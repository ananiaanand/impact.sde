"""Wraps calls to the Gemini API. Falls back to a deterministic seeded mock
generator when GEMINI_API_KEY is not set, so the MVP runs end-to-end offline.
Never expose the API key to the frontend — this module is backend-only.
"""
import json
import os
import random
import re
import requests

from . import prompts
from .sdg_knowledge import SDG11_TARGETS, URBAN_PROBLEMS, targets_for_problem

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)


class GenerationError(Exception):
    pass


def _call_gemini(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise GenerationError("GEMINI_API_KEY not set")
    resp = requests.post(
        GEMINI_URL,
        params={"key": GEMINI_API_KEY},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


def _parse_json(text: str) -> dict:
    cleaned = re.sub(r"^```json|```$", "", text.strip(), flags=re.MULTILINE).strip()
    return json.loads(cleaned)


def _call_json(prompt: str, mock_fn) -> dict:
    """Try the real Gemini call; on any failure (no key, network, bad JSON) use mock_fn."""
    if GEMINI_API_KEY:
        try:
            text = _call_gemini(prompt)
            return _parse_json(text)
        except Exception:
            pass  # fall through to mock so the MVP still demos end-to-end
    return mock_fn()


# ---------------------------------------------------------------------------
# Mock generators (deterministic on seed) — stand in for Gemini in offline MVP
# ---------------------------------------------------------------------------

def _mock_blueprint(seed: str, location: str, nasa_records: list[dict]) -> dict:
    rnd = random.Random(seed)
    problem = rnd.choice(URBAN_PROBLEMS)
    matching = targets_for_problem(problem) or SDG11_TARGETS
    primary = rnd.choice(matching)
    secondary_pool = [t for t in SDG11_TARGETS if t["target_id"] != primary["target_id"]]
    secondary = rnd.sample(secondary_pool, k=min(2, len(secondary_pool)))

    vars_present = sorted({r["variable"] for r in nasa_records})
    chain = [f"Baseline conditions recorded in {location} show stable urban indicators."]
    if "NDVI_vegetation_index" in vars_present:
        chain.append(f"Vegetation cover in {location} declines significantly over the period on record.")
    if "impervious_surface_pct" in vars_present:
        chain.append("Impervious (built) surface expands, reducing natural drainage capacity.")
    if "land_surface_temperature" in vars_present:
        chain.append("Land surface temperature rises in the affected area.")
    if "flood_extent" in vars_present:
        chain.append("A major rainfall event overwhelms reduced drainage capacity, causing flooding.")
    if "informal_settlement_area" in vars_present:
        chain.append("Informal settlement area expands into higher-risk, under-serviced land.")
    if "road_network_density" in vars_present or "transit_stop_coverage_pct" in vars_present:
        chain.append("Transport infrastructure fails to keep pace with district growth.")
    chain.append(f"Residents of {location} experience compounding impacts, prompting an investigation.")

    return {
        "case_id": f"case-{seed[:8]}",
        "central_problem": problem,
        "primary_target": primary["target_id"],
        "secondary_targets": [t["target_id"] for t in secondary],
        "urban_context": f"{location}, a rapidly changing urban district",
        "causal_chain": chain,
        "characters": [
            {"name": rnd.choice(["Inspector Lior Adeyemi", "Detective Sara Kwan", "Agent Matteo Reyes"]),
             "role": "Player's investigative partner",
             "description": "A methodical field investigator assigned to the case."},
            {"name": rnd.choice(["Council Member Dana Osei", "Director Priya Nair", "Commissioner Tom Alvarez"]),
             "role": "City official",
             "description": "Oversees the department connected to the central problem."},
            {"name": rnd.choice(["Resident Marco Liu", "Resident Aiko Santos", "Resident Jonas Weber"]),
             "role": "Local resident / witness",
             "description": f"Has lived in {location} through the changes under investigation."},
        ],
        "locations": [location, f"{location} Civic Records Office", f"{location} Waterfront/Perimeter"],
        "final_question": f"How did the changes documented in {location} lead to the crisis, "
                           f"and which SDG 11 targets should guide the city's response?",
        "final_causal_graph": chain,
    }


def _mock_levels(blueprint: dict, nasa_records: list[dict], num_levels: int = 6) -> dict:
    seed_src = blueprint["case_id"]
    rnd = random.Random(seed_src)
    chain = blueprint["causal_chain"]
    location = blueprint["locations"][0]
    primary = blueprint["primary_target"]
    secondary = blueprint["secondary_targets"]
    targets_cycle = [primary] + secondary

    by_var: dict[str, list[dict]] = {}
    for r in nasa_records:
        by_var.setdefault(r["variable"], []).append(r)
    var_list = list(by_var.keys())

    n = max(num_levels, len(chain))
    levels = []
    for i in range(min(n, len(chain))):
        step = chain[i]
        lvl_num = i + 1
        ev = []
        if var_list:
            var = var_list[i % len(var_list)]
            recs = sorted(by_var[var], key=lambda r: r["timestamp"])
            for r in recs[:2]:
                ev.append({
                    "id": f"ev-{lvl_num}-{r['record_id']}",
                    "type": "nasa",
                    "title": f"{var.replace('_', ' ').title()} record ({r['timestamp']})",
                    "content": f"SATELLITE TELEMETRY (MODIS SENSOR) -- [TIMESTAMP: {r['timestamp']}]\n\n"
                               f"LOCATION SCAN: {r['location']}\n"
                               f"ANALYSIS: {var.replace('_', ' ').title()} recorded at {r['value']} {r.get('unit', '')}.",
                    "source_metadata": {
                        "source": "NASA", "dataset_id": "NASA-EARTHDATA-URBAN-SAMPLE-2026",
                        "record_id": r["record_id"], "variable": var,
                        "timestamp": r["timestamp"], "location": r["location"], "value": r["value"],
                    },
                })
        ev.append({
            "id": f"ev-{lvl_num}-doc",
            "type": "fictional",
            "title": rnd.choice(["Planning memo", "Inspection log excerpt", "Resident statement",
                                  "Council meeting transcript excerpt"]),
            "content": f"CONFIDENTIAL // EYES ONLY\n\nIntercepted transcript or file fragment:\n\n\"{step}\"",
            "source_metadata": None,
        })

        use_target = lvl_num % 2 == 0 and targets_cycle
        sdg_target = targets_cycle[(lvl_num // 2) % len(targets_cycle)] if use_target else None
        target_info = next((t for t in SDG11_TARGETS if t["target_id"] == sdg_target), None)

        if sdg_target and target_info:
            research_prompt = (f"The evidence points to a pattern affecting {target_info['topic'].lower()}. "
                                f"Which SDG 11 target most directly addresses this?")
            expected = sdg_target
            equivalents = [sdg_target, f"SDG {sdg_target}", f"Target {sdg_target}",
                           f"SDG 11.{sdg_target.split('.')[1]}"]
            answer_type = "sdg_target"
        else:
            key_term = step.split(" in ")[0].split(",")[0][:40]
            research_prompt = f"Based on the evidence, what specifically changed in {location} at this stage?"
            expected = key_term
            equivalents = [key_term.lower(), key_term]
            answer_type = "semantic"

        levels.append({
            "level_number": lvl_num,
            "title": f"Level {lvl_num}: {step[:48]}",
            "story": step,
            "evidence": ev,
            "investigation_task": f"Determine: {step}",
            "research_prompt": research_prompt,
            "expected_answer": expected,
            "accepted_equivalents": equivalents,
            "answer_type": answer_type,
            "sdg_target": sdg_target,
            "hints": [
                "Re-read the evidence for this level closely — one item directly supports the answer.",
                f"Think about the underlying concept: {step[:60]}",
                (f"Consider SDG target {sdg_target}." if sdg_target else
                 "This may not need an SDG target — focus on what the data shows."),
            ],
        })

    return {
        "case_intro": (
            f"A situation has developed in {location}. Officials are asking questions, residents "
            f"are worried, and the data tells a story no one has pieced together yet. "
            f"You're brought in to investigate what really happened — and why."
        ),
        "levels": levels,
    }


def _mock_validation(blueprint: dict, levels: list[dict]) -> dict:
    issues = []
    for lvl in levels:
        if not lvl.get("expected_answer"):
            issues.append(f"Level {lvl['level_number']} missing expected_answer")
        for ev in lvl.get("evidence", []):
            if ev["type"] == "nasa" and not ev.get("source_metadata", {}).get("record_id"):
                issues.append(f"Level {lvl['level_number']} evidence {ev['id']} missing NASA record_id")
    return {"valid": len(issues) == 0, "issues": issues}


def _mock_final_evaluation(blueprint: dict, player_findings: str) -> dict:
    chain = blueprint.get("final_causal_graph", [])
    findings_lower = player_findings.lower()
    mentioned = [step for step in chain if any(
        w.lower() in findings_lower for w in step.split() if len(w) > 5
    )]
    score = round(min(1.0, 0.2 + 0.8 * (len(mentioned) / max(1, len(chain)))), 2)
    missed = [s for s in chain if s not in mentioned]
    return {
        "score": score,
        "case_summary": f"The case centered on {blueprint.get('central_problem')} in "
                         f"{blueprint.get('urban_context')}, tracing back through documented change.",
        "timeline": chain,
        "causal_chain": chain,
        "key_evidence": [f"Data and documents linked to: {s[:50]}" for s in chain[:4]],
        "sdg_connections": [f"{blueprint.get('primary_target')} (primary)"] +
                            [f"{t} (secondary)" for t in blueprint.get("secondary_targets", [])],
        "missed_points": missed,
        "learning_summary": (
            "Urban problems rarely have one cause — this case showed how environmental change, "
            "planning decisions and infrastructure gaps compound into a visible crisis, and how "
            "SDG 11 targets map to each stage of prevention and response."
        ),
    }


# ---------------------------------------------------------------------------
# Public pipeline functions (Calls 1, 2+3, 4, 5)
# ---------------------------------------------------------------------------

def generate_blueprint(seed: str, location: str, nasa_records: list[dict]) -> dict:
    prompt = prompts.blueprint_prompt(seed, nasa_records, SDG11_TARGETS, URBAN_PROBLEMS)
    return _call_json(prompt, lambda: _mock_blueprint(seed, location, nasa_records))


def generate_levels(blueprint: dict, nasa_records: list[dict], num_levels: int = 6) -> dict:
    prompt = prompts.levels_prompt(blueprint, nasa_records, num_levels)
    return _call_json(prompt, lambda: _mock_levels(blueprint, nasa_records, num_levels))


def validate_case(blueprint: dict, levels: list[dict]) -> dict:
    prompt = prompts.validation_prompt(blueprint, levels)
    return _call_json(prompt, lambda: _mock_validation(blueprint, levels))


def evaluate_final(blueprint: dict, player_findings: str) -> dict:
    prompt = prompts.final_evaluation_prompt(blueprint, player_findings)
    return _call_json(prompt, lambda: _mock_final_evaluation(blueprint, player_findings))
