"""NASA JSON data service. Ground truth — never invent values not present here."""
import json
import os
import random

DATA_PATH = os.environ.get(
    "NASA_DATA_PATH",
    os.path.join(os.path.dirname(__file__), "..", "data", "nasa_sample.json"),
)


class NasaDataService:
    def __init__(self, path: str = DATA_PATH):
        with open(path, "r") as f:
            raw = json.load(f)
        self.dataset_id = raw["dataset_id"]
        self.records: list[dict] = raw["records"]
        self.locations = sorted({r["location"] for r in self.records})
        self.variables = sorted({r["variable"] for r in self.records})

    def records_for_location(self, location: str) -> list[dict]:
        return [r for r in self.records if r["location"] == location]

    def pick_random_location(self, seed: random.Random) -> str:
        return seed.choice(self.locations)

    def variable_trend(self, location: str, variable: str) -> list[dict]:
        """Chronological records for one location/variable — used as a clue."""
        recs = [
            r for r in self.records
            if r["location"] == location and r["variable"] == variable
        ]
        return sorted(recs, key=lambda r: r["timestamp"])

    def as_evidence_metadata(self, record: dict) -> dict:
        return {
            "source": "NASA",
            "dataset_id": self.dataset_id,
            "record_id": record["record_id"],
            "variable": record["variable"],
            "timestamp": record["timestamp"],
            "location": record["location"],
            "value": record["value"],
            "unit": record.get("unit"),
        }

    def relevant_slice_for_prompt(self, location: str) -> list[dict]:
        """Compact set of real records handed to the LLM as its only factual grounding."""
        return [self.as_evidence_metadata(r) for r in self.records_for_location(location)]


nasa_service = NasaDataService()
