import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client, create_client

from .quantum_model import build_student_cohort

router = APIRouter()


def get_supabase() -> Client | None:
    url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        return None
    return create_client(url, key)


@router.get("/analytics/overview")
def get_analytics_overview(supabase: Client | None = Depends(get_supabase)):
    try:
        students = build_student_cohort()

        if supabase is not None:
            try:
                users_resp = supabase.table("profiles").select("id", count="exact").eq("role", "student").execute()
                students_count = users_resp.count or len(students)

                games_resp = supabase.table("game_sessions").select("session_id", count="exact").execute()
                games_count = games_resp.count or 0
            except Exception:
                students_count = len(students)
                games_count = 0
        else:
            students_count = len(students)
            games_count = 12

        average_understanding = round(sum(student["score"] for student in students) / len(students) * 100, 1)
        most_mastered = "Quantum Forecasting"

        return {
            "students_active": students_count,
            "games_completed": games_count,
            "average_understanding": average_understanding,
            "most_mastered": most_mastered,
            "students": students,
            "algorithm": {
                "name": "simulated_annealing_quantum_risk_model",
                "features": ["attendance", "quiz_score", "assignment_timing", "participation"],
                "tiers": ["at_risk", "on_track", "excelling"],
            },
        }
    except Exception as exc:  # pragma: no cover - defensive guard for dashboard debugging
        raise HTTPException(status_code=500, detail=str(exc))
