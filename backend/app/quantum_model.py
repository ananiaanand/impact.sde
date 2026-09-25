from __future__ import annotations

import math
import random
from statistics import mean, pstdev
from typing import Dict, Iterable, List

FEATURE_KEYS = ("attendance", "quiz_score", "assignment_timing", "participation")
TIER_KEYS = ("at_risk", "on_track", "excelling")


def _clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def _coerce_feature(raw_value: float | int | None, *, allow_zero: bool = False) -> float:
    if raw_value is None:
        return 0.5 if allow_zero else 0.0

    value = float(raw_value)
    if value > 1.5:
        value = value / 100.0

    if not allow_zero:
        value = max(0.0, min(1.0, value))
    else:
        value = max(0.0, min(1.0, value))

    return value


def normalize_feature_vector(student: Dict[str, object]) -> Dict[str, float]:
    return {
        "attendance": _coerce_feature(student.get("attendance")),
        "quiz_score": _coerce_feature(student.get("quiz_score")),
        "assignment_timing": _coerce_feature(student.get("assignment_timing")),
        "participation": _coerce_feature(student.get("participation")),
    }


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def _fitness(weights: Dict[str, float], rows: Iterable[Dict[str, object]]) -> float:
    thriving_scores: List[float] = []
    struggling_scores: List[float] = []

    for row in rows:
        feature_vector = normalize_feature_vector(row)
        score = sum(weights[key] * feature_vector[key] for key in FEATURE_KEYS)
        if row.get("label") == "thriving":
            thriving_scores.append(score)
        elif row.get("label") == "struggling":
            struggling_scores.append(score)

    if not thriving_scores or not struggling_scores:
        return 0.0

    gap = mean(thriving_scores) - mean(struggling_scores)
    spread = pstdev(thriving_scores + struggling_scores)
    return gap - (0.2 * spread)


def optimize_feature_weights(rows: Iterable[Dict[str, object]]) -> Dict[str, float]:
    rows = list(rows)
    if not rows:
        return {key: 0.25 for key in FEATURE_KEYS}

    weights = {key: 0.25 for key in FEATURE_KEYS}
    best_weights = weights.copy()
    best_score = _fitness(best_weights, rows)
    temperature = 1.2

    for _ in range(1200):
        candidate = {
            key: _clamp(weights[key] + random.uniform(-0.2, 0.2))
            for key in FEATURE_KEYS
        }
        total = sum(candidate.values())
        if total <= 0:
            continue
        candidate = {key: candidate[key] / total for key in FEATURE_KEYS}

        candidate_score = _fitness(candidate, rows)
        if candidate_score > best_score or random.random() < math.exp((candidate_score - best_score) / max(temperature, 0.01)):
            weights = candidate
            if candidate_score > best_score:
                best_weights = candidate.copy()
                best_score = candidate_score
        temperature *= 0.995

    return best_weights


def score_student(student: Dict[str, object], weights: Dict[str, float]) -> Dict[str, float]:
    feature_vector = normalize_feature_vector(student)
    raw_score = sum(weights[key] * feature_vector[key] for key in FEATURE_KEYS)

    on_track = _sigmoid((raw_score - 0.5) * 5.5)
    at_risk = _sigmoid((0.42 - raw_score) * 8.0)
    excelling = _sigmoid((raw_score - 0.68) * 8.0)

    probabilities = {
        "at_risk": at_risk,
        "on_track": on_track,
        "excelling": excelling,
    }

    total = sum(probabilities.values())
    if total <= 0:
        probabilities = {"at_risk": 0.25, "on_track": 0.5, "excelling": 0.25}
        total = 1.0

    normalized = {key: value / total for key, value in probabilities.items()}
    dominant_tier = max(TIER_KEYS, key=lambda k: normalized[k])

    return {
        "raw_score": round(raw_score, 4),
        "probabilities": {key: round(normalized[key], 4) for key in TIER_KEYS},
        "dominant_tier": dominant_tier,
        "feature_vector": feature_vector,
    }


def build_mock_training_data() -> List[Dict[str, object]]:
    return [
        {"student_id": "S-101", "name": "Aisha", "attendance": 0.92, "quiz_score": 0.88, "assignment_timing": 0.9, "participation": 0.86, "label": "thriving"},
        {"student_id": "S-102", "name": "Marcus", "attendance": 0.8, "quiz_score": 0.76, "assignment_timing": 0.84, "participation": 0.78, "label": "thriving"},
        {"student_id": "S-103", "name": "Priya", "attendance": 0.68, "quiz_score": 0.62, "assignment_timing": 0.64, "participation": 0.7, "label": "thriving"},
        {"student_id": "S-104", "name": "Daniel", "attendance": 0.4, "quiz_score": 0.46, "assignment_timing": 0.38, "participation": 0.35, "label": "struggling"},
        {"student_id": "S-105", "name": "Leah", "attendance": 0.52, "quiz_score": 0.5, "assignment_timing": 0.43, "participation": 0.44, "label": "struggling"},
        {"student_id": "S-106", "name": "Noah", "attendance": 0.58, "quiz_score": 0.55, "assignment_timing": 0.48, "participation": 0.41, "label": "struggling"},
    ]


def build_student_cohort() -> List[Dict[str, object]]:
    raw_students = [
        {"student_id": "S-201", "name": "Avery", "attendance": 95, "quiz_score": 83, "assignment_timing": 88, "participation": 74},
        {"student_id": "S-202", "name": "Jordan", "attendance": 64, "quiz_score": 58, "assignment_timing": 42, "participation": 49},
        {"student_id": "S-203", "name": "Sofia", "attendance": 91, "quiz_score": 90, "assignment_timing": 94, "participation": 88},
        {"student_id": "S-204", "name": "Mateo", "attendance": 77, "quiz_score": 70, "assignment_timing": 72, "participation": 69},
        {"student_id": "S-205", "name": "Ella", "attendance": 48, "quiz_score": 54, "assignment_timing": 46, "participation": 52},
        {"student_id": "S-206", "name": "Omar", "attendance": 89, "quiz_score": 81, "assignment_timing": 75, "participation": 92},
    ]

    training_rows = build_mock_training_data()
    weights = optimize_feature_weights(training_rows)

    students: List[Dict[str, object]] = []
    for student in raw_students:
        outcome = score_student(student, weights)
        students.append({
            "student_id": student["student_id"],
            "name": student["name"],
            "score": outcome["raw_score"],
            "dominant_tier": outcome["dominant_tier"],
            "probabilities": outcome["probabilities"],
            "feature_vector": outcome["feature_vector"],
        })

    return students
