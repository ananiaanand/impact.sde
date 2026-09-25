# SDG 11 Detective Game — MVP Backend (FastAPI)

## Run
```bash
pip install -r requirements.txt
cp .env.example .env   # fill GEMINI_API_KEY to use real Gemini; leave blank for offline demo
uvicorn app.main:app --reload
```
Open `http://localhost:8000/docs` for interactive API.

## Mock mode
No `GEMINI_API_KEY` set → every Gemini call falls back to a deterministic,
seeded mock generator (`app/gemini_service.py`). Full game loop runs offline,
same schemas, same endpoint contracts — swap in a real key with zero API changes.

## Endpoints
- `POST /session/start` — new investigation, no profile questions asked
- `GET  /session/{id}/level` — current level (frontend-safe, no hidden answer)
- `POST /session/{id}/answer` — `{"answer": "..."}`, deterministic validation
- `POST /session/{id}/hint` — progressive hints (never reveals answer)
- `GET  /session/{id}/final/question` — unlocked after last level
- `POST /session/{id}/final` — `{"findings": "..."}`, scored against hidden causal graph

## Architecture (matches spec section 20/22)
```
NASA JSON (data/nasa_sample.json — replace with real dataset)
   -> nasa_data.py         (load/index/search, ground truth)
   -> sdg_knowledge.py      (SDG 11 target KB)
   -> gemini_service.py     (Calls 1-5: blueprint, levels, validate, final eval)
   -> game_session.py       (orchestration, in-memory session store, regenerate-on-invalid)
   -> main.py                (FastAPI routes)
```
Hidden fields (`expected_answer`, `causal_chain`, future levels) never serialize
to the frontend — `PublicLevel`/`PublicEvidence` in `models.py` strip them.

## Known MVP simplifications (call out for next iteration)
- Session store is in-memory (`dict`) — swap for Postgres/SQLite for persistence across restarts.
- Sample NASA dataset is a small hand-built stand-in (`data/nasa_sample.json`) — point
  `NASA_DATA_PATH` at the real dataset; loader/schema already generic.
- Mock generator's causal chains are template-assembled from variable names present
  per location; real Gemini calls will produce richer, more varied narratives.
- `_recent_case_ids` dedup is process-memory only.
