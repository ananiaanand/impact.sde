"""Deterministic answer validation. Gemini is NOT used for simple answer checks —
keeps validation fast, cheap and reliable per spec section 13.
"""
import re

_SDG_TARGET_RE = re.compile(r"(?:sdg\s*)?(?:target\s*)?11\.([0-9]+|[a-c])", re.IGNORECASE)


def _normalize(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s.]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text


def _normalize_sdg_answer(text: str) -> str | None:
    m = _SDG_TARGET_RE.search(text)
    if m:
        return f"11.{m.group(1).lower()}"
    return None


def validate_answer(submitted: str, expected: str, equivalents: list[str],
                     answer_type: str) -> bool:
    if answer_type == "sdg_target":
        submitted_norm = _normalize_sdg_answer(submitted) or _normalize(submitted)
        expected_norm = _normalize_sdg_answer(expected) or _normalize(expected)
        return submitted_norm == expected_norm

    # semantic: normalized exact match, substring match, or match against equivalents
    submitted_norm = _normalize(submitted)
    candidates = {_normalize(expected)} | {_normalize(e) for e in equivalents}
    if submitted_norm in candidates:
        return True
    # loose containment both ways catches e.g. "water canal" vs "canal"
    return any(
        (c in submitted_norm or submitted_norm in c) and len(submitted_norm) >= 3
        for c in candidates
    )
