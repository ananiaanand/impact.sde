import os
from fastapi import APIRouter, HTTPException, Depends
from supabase import create_client, Client

router = APIRouter()

def get_supabase() -> Client:
    url = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Supabase credentials not configured in backend.")
    return create_client(url, key)

@router.get("/analytics/overview")
def get_analytics_overview(supabase: Client = Depends(get_supabase)):
    try:
        # Fetch high level stats
        users_resp = supabase.table("profiles").select("id", count="exact").eq("role", "student").execute()
        students_count = users_resp.count or 0
        
        games_resp = supabase.table("game_sessions").select("session_id", count="exact").execute()
        games_count = games_resp.count or 0

        # Placeholder for more complex analytics calculation (quantum states, etc.)
        return {
            "students_active": students_count,
            "games_completed": games_count,
            "average_understanding": 71, # Mock for MVP
            "most_mastered": "SDG 11.5", # Mock for MVP
            "students": [] # Would fetch from game_sessions grouped by student
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
