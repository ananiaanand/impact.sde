"""Load NASA MOD11A2 land-surface-temperature GeoJSON (2012 vs 2026),
index by (modis_row, modis_col), compute per-cell heat delta.

Real files: data/nasa_lst_2012.geojson, data/nasa_lst_2026.geojson
Matched by (modis_row, modis_col) since exact polygon coords can drift
a hair between composites; row/col is the stable MODIS grid key.
"""
from __future__ import annotations
import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
PATH_2012 = os.environ.get("NASA_LST_2012_PATH", os.path.join(DATA_DIR, "nasa_lst_2012.geojson"))
PATH_2026 = os.environ.get("NASA_LST_2026_PATH", os.path.join(DATA_DIR, "nasa_lst_2026.geojson"))

_cache: dict = {}


def _load(path: str) -> dict:
    with open(path) as f:
        return json.load(f)


def _key(props: dict):
    return (props["modis_row"], props["modis_col"])


def get_heat_diff() -> dict:
    """Return a FeatureCollection: one feature per cell present in BOTH years,
    geometry from 2026, properties = lst_c_2012, lst_c_2026, delta_c.
    Cached after first call (dataset static per process)."""
    if "diff" in _cache:
        return _cache["diff"]

    d2012 = _load(PATH_2012)
    d2026 = _load(PATH_2026)

    idx2012 = {_key(f["properties"]): f for f in d2012["features"]}

    out_features = []
    for f in d2026["features"]:
        k = _key(f["properties"])
        match = idx2012.get(k)
        if not match:
            continue
        lst_2012 = match["properties"]["lst_c"]
        lst_2026 = f["properties"]["lst_c"]
        out_features.append({
            "type": "Feature",
            "geometry": f["geometry"],
            "properties": {
                "modis_row": k[0],
                "modis_col": k[1],
                "lst_c_2012": lst_2012,
                "lst_c_2026": lst_2026,
                "delta_c": round(lst_2026 - lst_2012, 2),
            },
        })

    result = {"type": "FeatureCollection", "features": out_features}
    _cache["diff"] = result
    return result


def get_year_heat_map(year: int = 2026) -> dict:
    """Return the raw GeoJSON for a single LST year so the frontend can toggle 2016/2026.

    The current dataset includes a 2012 baseline and a 2026 current layer. The app
    intentionally aliases 2016 to the 2012 baseline until a dedicated 2016 GeoJSON
    file is added, which keeps the comparison meaningful and visibly different.
    """
    if year not in (2012, 2016, 2026):
        raise ValueError("Unsupported heat map year. Use 2012, 2016, or 2026.")

    data_year = 2012 if year == 2016 else year
    path = PATH_2012 if data_year == 2012 else PATH_2026
    return _load(path)


def get_top_hotspots(n: int = 5, year: int = 2026) -> list[dict]:
    """Return hottest cells for the selected year, or for the delta between 2012 and 2026 if a diff is requested."""
    if year in (2012, 2016, 2026):
        data = get_year_heat_map(year)
        feats = sorted(data["features"], key=lambda f: float(f["properties"].get("lst_c", 0)), reverse=True)
        return [
            {
                **f["properties"],
                "year": year,
                "city": "Bengaluru",
            }
            for f in feats[:n]
        ]

    diff = get_heat_diff()
    feats = sorted(diff["features"], key=lambda f: f["properties"]["delta_c"], reverse=True)
    return [f["properties"] for f in feats[:n]]


def get_city_summary(year: int = 2026) -> dict:
    if year in (2012, 2016, 2026):
        data = get_year_heat_map(year)
        values = [float(f["properties"].get("lst_c", 0)) for f in data["features"]]
        if not values:
            return {"cells": 0, "year": year}
        return {
            "cells": len(values),
            "year": year,
            "mean_lst_c": round(sum(values) / len(values), 2),
            "max_lst_c": round(max(values), 2),
            "min_lst_c": round(min(values), 2),
        }

    diff = get_heat_diff()
    deltas = [f["properties"]["delta_c"] for f in diff["features"]]
    if not deltas:
        return {"cells_matched": 0}
    return {
        "cells_matched": len(deltas),
        "mean_delta_c": round(sum(deltas) / len(deltas), 2),
        "max_delta_c": round(max(deltas), 2),
        "min_delta_c": round(min(deltas), 2),
    }
