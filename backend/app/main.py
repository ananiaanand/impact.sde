"""FastAPI backend for the SDG 11 Detective Game MVP.

Run: uvicorn app.main:app --reload
"""
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import game_session, graph_session, nasa_geo, analytics
from .models import (
    AnswerResult, AnswerSubmission, FinalFeedback, FinalSubmission, HintResponse,
    PublicLevel, SessionStartResponse,
)

app = FastAPI(title="SDG 11 Detective Game", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(analytics.router)


@app.get("/map/heat")
def map_heat(year: int = 2026):
    """GeoJSON FeatureCollection for Leaflet: single-year Bangalore LST map or delta view."""
    if year == 0:
        return nasa_geo.get_heat_diff()
    return nasa_geo.get_year_heat_map(year)


@app.get("/map/hotspots")
def map_hotspots(n: int = 5, year: int = 2026):
    """Top-N hottest cells. The frontend can use this for teaching clues and map overlays."""
    return {"hotspots": nasa_geo.get_top_hotspots(n, year), "city_summary": nasa_geo.get_city_summary(year)}


@app.post("/session/start", response_model=SessionStartResponse)
def start_session():
    """START NEW INVESTIGATION. No profile questions — fixed defaults per spec."""
    try:
        return game_session.start_session()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{session_id}/level", response_model=PublicLevel)
def get_level(session_id: str):
    try:
        return game_session.get_current_level(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/session/{session_id}/answer", response_model=AnswerResult)
def submit_answer(session_id: str, submission: AnswerSubmission):
    try:
        return game_session.submit_answer(session_id, submission.answer)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")


@app.post("/session/{session_id}/hint", response_model=HintResponse)
def get_hint(session_id: str):
    try:
        return game_session.get_hint(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/session/{session_id}/final/question")
def final_question(session_id: str):
    try:
        return {"question": game_session.get_final_question(session_id)}
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/session/{session_id}/final", response_model=FinalFeedback)
def submit_final(session_id: str, submission: FinalSubmission):
    try:
        return game_session.submit_final(session_id, submission.findings)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Non-linear clue-graph mode (Bengaluru storyline) ----------
# Parallel to the linear /session/* routes above; use /graph/* for the
# branching investigation. Old routes kept for backward compatibility.

@app.post("/graph/start")
def graph_start():
    return graph_session.start_session()


@app.get("/graph/{session_id}/node/{node_id}")
def graph_open_node(session_id: str, node_id: str):
    try:
        return graph_session.open_node(session_id, node_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/graph/{session_id}/node/{node_id}/answer")
def graph_answer_node(session_id: str, node_id: str, submission: AnswerSubmission):
    try:
        return graph_session.complete_node(session_id, node_id, submission.answer)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/graph/{session_id}/final/question")
def graph_final_question(session_id: str):
    try:
        return graph_session.get_final_question(session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/graph/{session_id}/final")
def graph_submit_final(session_id: str, submission: FinalSubmission):
    try:
        return graph_session.submit_final(session_id, submission.findings)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Frontend (static) ----------
# Serves the Leaflet case-board UI at "/". API routes above stay untouched
# since StaticFiles is mounted last and FastAPI matches explicit routes first.
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
