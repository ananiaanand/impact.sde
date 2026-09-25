"""Pydantic models: request/response schemas + internal game state."""
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field
import uuid


# ---------- Case Blueprint (hidden, server-side) ----------

class Evidence(BaseModel):
    id: str
    type: str  # "nasa" | "fictional"
    title: str
    content: str
    source_metadata: Optional[dict] = None  # required when type == "nasa"


class Character(BaseModel):
    name: str
    role: str
    description: str


class Level(BaseModel):
    level_number: int
    title: str
    story: str
    evidence: list[Evidence] = Field(default_factory=list)
    investigation_task: str
    research_prompt: str
    expected_answer: str
    accepted_equivalents: list[str] = Field(default_factory=list)
    answer_type: str = "semantic"  # "semantic" | "sdg_target"
    sdg_target: Optional[str] = None
    hints: list[str] = Field(default_factory=list)


class CaseBlueprint(BaseModel):
    case_id: str
    central_problem: str
    primary_target: str
    secondary_targets: list[str]
    urban_context: str
    causal_chain: list[str]
    characters: list[Character]
    locations: list[str]
    levels: list[Level]
    final_question: str
    final_causal_graph: list[str]


# ---------- Public (frontend-safe) views ----------

class PublicEvidence(BaseModel):
    id: str
    type: str
    title: str
    content: str


class PublicLevel(BaseModel):
    level_number: int
    title: str
    story: str
    evidence: list[PublicEvidence]
    investigation_task: str
    research_prompt: str
    sdg_target_revealed: bool = False


class SessionStartResponse(BaseModel):
    session_id: str
    seed: str
    case_intro: str
    urban_context: str
    total_levels: int
    current_level: PublicLevel


class AnswerSubmission(BaseModel):
    answer: str


class AnswerResult(BaseModel):
    correct: bool
    message: str
    unlocked_next: bool = False
    next_level: Optional[PublicLevel] = None
    hints_used: int = 0
    game_complete: bool = False


class HintResponse(BaseModel):
    hint: str
    hint_number: int
    hints_remaining: int


class FinalQuestion(BaseModel):
    question: str


class FinalSubmission(BaseModel):
    findings: str  # free-text player explanation


class FinalFeedback(BaseModel):
    case_summary: str
    timeline: list[str]
    key_evidence: list[str]
    sdg_connections: list[str]
    causal_chain: list[str]
    score: float
    missed_points: list[str]
    learning_summary: str


# ---------- Internal session state ----------

class GameSession(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seed: str
    blueprint: CaseBlueprint
    current_level_index: int = 0
    completed_levels: list[int] = Field(default_factory=list)
    hints_used_by_level: dict[int, int] = Field(default_factory=dict)
    answers_submitted: list[dict[str, Any]] = Field(default_factory=list)
    sdg_targets_discovered: list[str] = Field(default_factory=list)
    finished: bool = False
