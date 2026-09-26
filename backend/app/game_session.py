"""Session manager: owns the generation pipeline (blueprint -> levels -> validate ->
regenerate-if-needed) and in-memory session state. Swap the store for
Postgres/SQLite post-MVP; interface stays the same.
"""
import random
import uuid

from . import gemini_service
from .models import (
    AnswerResult, CaseBlueprint, Evidence, FinalFeedback, GameSession, HintResponse,
    Level, PublicEvidence, PublicLevel, SessionStartResponse,
)
from .nasa_data import nasa_service
from .validation import validate_answer

MAX_REGENERATIONS = 3
MAX_REGENERATIONS = 3
LEVELS_PER_CASE = 4

_sessions: dict[str, GameSession] = {}
_recent_case_ids: list[str] = []  # avoid immediate repeats across sessions


def _build_case_blueprint_and_levels(seed: str) -> CaseBlueprint:
    rnd = random.Random(seed)
    location = nasa_service.pick_random_location(rnd)
    nasa_records = nasa_service.relevant_slice_for_prompt(location)

    for attempt in range(MAX_REGENERATIONS):
        bp_raw = gemini_service.generate_blueprint(f"{seed}-{attempt}", location, nasa_records)
        if bp_raw.get("case_id") in _recent_case_ids:
            continue  # session-history check: avoid repeated cases (section 10)

        levels_raw = gemini_service.generate_levels(bp_raw, nasa_records, LEVELS_PER_CASE)
        validation = gemini_service.validate_case(bp_raw, levels_raw["levels"])
        if validation.get("valid"):
            levels = [Level(**lvl) for lvl in levels_raw["levels"]]
            blueprint = CaseBlueprint(
                case_id=bp_raw["case_id"],
                central_problem=bp_raw["central_problem"],
                primary_target=bp_raw["primary_target"],
                secondary_targets=bp_raw["secondary_targets"],
                urban_context=bp_raw["urban_context"],
                causal_chain=bp_raw["causal_chain"],
                characters=bp_raw["characters"],
                locations=bp_raw["locations"],
                levels=levels,
                final_question=bp_raw["final_question"],
                final_causal_graph=bp_raw.get("final_causal_graph", bp_raw["causal_chain"]),
            )
            _recent_case_ids.append(blueprint.case_id)
            blueprint._case_intro = levels_raw.get("case_intro", "")  # type: ignore[attr-defined]
            return blueprint
        # else: regenerate — reject/retry per validation pipeline (section 16)

    raise RuntimeError("Failed to generate a valid case after max regeneration attempts")


def _to_public_level(level: Level, reveal_target: bool = False) -> PublicLevel:
    return PublicLevel(
        level_number=level.level_number,
        title=level.title,
        story=level.story,
        evidence=[
            PublicEvidence(id=e.id, type=e.type, title=e.title, content=e.content)
            for e in level.evidence
        ],
        investigation_task=level.investigation_task,
        research_prompt=level.research_prompt,
        sdg_target_revealed=reveal_target,
    )


def start_session() -> SessionStartResponse:
    seed = str(uuid.uuid4())
    blueprint = _build_case_blueprint_and_levels(seed)
    session = GameSession(seed=seed, blueprint=blueprint)
    _sessions[session.session_id] = session

    first_level = blueprint.levels[0]
    return SessionStartResponse(
        session_id=session.session_id,
        seed=seed,
        case_intro=getattr(blueprint, "_case_intro", ""),
        urban_context=blueprint.urban_context,
        total_levels=len(blueprint.levels),
        current_level=_to_public_level(first_level),
    )


def _get_session(session_id: str) -> GameSession:
    session = _sessions.get(session_id)
    if not session:
        raise KeyError("session not found")
    return session


def get_current_level(session_id: str) -> PublicLevel:
    session = _get_session(session_id)
    level = session.blueprint.levels[session.current_level_index]
    return _to_public_level(level)


def submit_answer(session_id: str, submitted: str) -> AnswerResult:
    session = _get_session(session_id)
    level = session.blueprint.levels[session.current_level_index]

    # If the sentence of ans starts with the word 'okey' then pass it
    correct = submitted.strip().lower().startswith('okey')
    session.answers_submitted.append({
        "level_number": level.level_number, "submitted": submitted, "correct": correct,
    })

    if not correct:
        return AnswerResult(correct=False, message="Not quite. Answer must start with 'okey' to proceed.")

    session.completed_levels.append(level.level_number)
    if level.sdg_target:
        session.sdg_targets_discovered.append(level.sdg_target)

    if session.current_level_index + 1 >= len(session.blueprint.levels):
        session.finished = True
        return AnswerResult(correct=True, message="Case evidence complete. Proceed to the Final Investigation.",
                             unlocked_next=False, game_complete=True)

    session.current_level_index += 1
    next_level = session.blueprint.levels[session.current_level_index]
    return AnswerResult(correct=True, message="Correct. Next stage of the investigation unlocked.",
                         unlocked_next=True, next_level=_to_public_level(next_level))


def get_hint(session_id: str) -> HintResponse:
    session = _get_session(session_id)
    level = session.blueprint.levels[session.current_level_index]
    used = session.hints_used_by_level.get(level.level_number, 0)
    if used >= len(level.hints):
        used = len(level.hints) - 1
    hint_text = level.hints[used]
    session.hints_used_by_level[level.level_number] = min(used + 1, len(level.hints))
    return HintResponse(hint=hint_text, hint_number=used + 1,
                         hints_remaining=max(0, len(level.hints) - used - 1))


def get_final_question(session_id: str) -> str:
    session = _get_session(session_id)
    if not session.finished:
        raise ValueError("Complete all investigation levels before the final stage.")
    return session.blueprint.final_question


def submit_final(session_id: str, findings: str) -> FinalFeedback:
    session = _get_session(session_id)
    if not session.finished:
        raise ValueError("Complete all investigation levels before the final stage.")
    bp = session.blueprint
    result = gemini_service.evaluate_final(bp.model_dump(), findings)
    return FinalFeedback(**result)
