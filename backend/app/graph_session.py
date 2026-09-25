"""Non-linear clue-graph session engine.

Replaces the old fixed level-list flow. Nodes unlock via OR logic: a node
becomes visitable the moment ANY node listing it in "unlocks" is completed.
Different players/teams can traverse different node orders and still reach
the same underlying 10-obstacle truth.
"""
from __future__ import annotations
import uuid

from .storyline import (
    BRANCHES, MIN_BRANCHES_FOR_FINAL, MIN_OBSTACLES_FOR_FINAL, NODE_GRAPH,
    STORYLINE_INTRO,
)
from .obstacles import OBSTACLES
from .nasa_geo import get_top_hotspots
from . import gemini_service

START_NODE = "HEAT_MAP"


class GraphSession:
    def __init__(self):
        self.session_id = str(uuid.uuid4())
        self.available: set[str] = {START_NODE}
        self.completed: set[str] = set()
        self.hints_used: dict[str, int] = {}
        self.finished = False

    def branches_covered(self) -> set[str]:
        obstacles_done = {NODE_GRAPH[n]["obstacle"] for n in self.completed
                           if NODE_GRAPH[n]["obstacle"]}
        return {b for b, members in BRANCHES.items() if obstacles_done & members}

    def final_unlocked(self) -> bool:
        obstacles_done = {NODE_GRAPH[n]["obstacle"] for n in self.completed
                           if NODE_GRAPH[n]["obstacle"]}
        return (len(obstacles_done) >= MIN_OBSTACLES_FOR_FINAL
                and len(self.branches_covered()) >= MIN_BRANCHES_FOR_FINAL)


_sessions: dict[str, GraphSession] = {}


def _get(session_id: str) -> GraphSession:
    s = _sessions.get(session_id)
    if not s:
        raise KeyError("session not found")
    return s


def _public_node(node_id: str) -> dict:
    node = NODE_GRAPH[node_id]
    payload = {
        "node_id": node_id,
        "title": node["title"],
        "story": node["story"],
        "obstacle": OBSTACLES.get(node["obstacle"]) if node["obstacle"] else None,
    }
    if node_id == START_NODE:
        payload["hotspots"] = get_top_hotspots(3)
        payload["map_endpoint"] = "/map/heat"
    return payload


def start_session() -> dict:
    session = GraphSession()
    _sessions[session.session_id] = session
    return {
        "session_id": session.session_id,
        "intro": STORYLINE_INTRO,
        "available_nodes": [_public_node(n) for n in session.available],
    }


def open_node(session_id: str, node_id: str) -> dict:
    session = _get(session_id)
    if node_id not in session.available:
        raise ValueError(f"Node '{node_id}' is not unlocked yet.")
    return _public_node(node_id)


def complete_node(session_id: str, node_id: str, finding: str) -> dict:
    """Player states what they think this clue shows. Not strict grading per
    node (that lives in the final review) -- completing a node just requires
    a non-trivial submission, then unlocks its children."""
    session = _get(session_id)
    if node_id not in session.available:
        raise ValueError(f"Node '{node_id}' is not unlocked yet.")

    accepted = len(finding.strip()) >= 10  # MVP: presence check; swap for
    # gemini_service semantic check per node when wiring real LLM validation.

    if not accepted:
        return {"accepted": False, "message": "Say a bit more about what this evidence shows."}

    session.completed.add(node_id)
    newly_unlocked = [n for n in NODE_GRAPH[node_id]["unlocks"] if n not in session.completed]
    session.available.update(newly_unlocked)

    if session.final_unlocked():
        session.finished = True

    return {
        "accepted": True,
        "obstacle_confirmed": OBSTACLES.get(NODE_GRAPH[node_id]["obstacle"]),
        "newly_unlocked": [_public_node(n) for n in newly_unlocked],
        "final_unlocked": session.finished,
        "progress": {
            "obstacles_found": len({NODE_GRAPH[n]["obstacle"] for n in session.completed
                                     if NODE_GRAPH[n]["obstacle"]}),
            "branches_covered": sorted(session.branches_covered()),
        },
    }


def get_final_question(session_id: str) -> dict:
    session = _get(session_id)
    if not session.finished:
        raise ValueError("Not enough leads yet -- keep investigating.")
    return {
        "question": (
            "Connect your findings: what chain of causes made Bengaluru's "
            "hotspot zone heat up the most, and what single systemic gap "
            "made it hard to prevent?"
        ),
        "nodes_visited": sorted(session.completed),
    }


def submit_final(session_id: str, findings: str) -> dict:
    session = _get(session_id)
    if not session.finished:
        raise ValueError("Not enough leads yet -- keep investigating.")
    obstacles_found = [NODE_GRAPH[n]["obstacle"] for n in session.completed if NODE_GRAPH[n]["obstacle"]]
    names_data_gaps = "data" in findings.lower() or "DATA_GAPS" in session.completed
    result = gemini_service.evaluate_final(
        {"case_id": "bengaluru-graph", "causal_chain": obstacles_found}, findings,
    )
    result["converged_on_root_cause"] = "data_gaps" in obstacles_found and names_data_gaps
    return result
