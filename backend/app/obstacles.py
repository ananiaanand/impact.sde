"""SDG 11 obstacle taxonomy for the Bengaluru case.

Ten root-cause obstacles the non-linear mystery graph is built from.
Each clue node in game_session.py tags which obstacle(s) it points to.
"""

OBSTACLES = {
    "housing": "Housing affordability & informal settlement growth",
    "transport": "Traffic congestion & poor public transport coverage",
    "unplanned_growth": "Unplanned / unregulated urban expansion",
    "air_pollution": "Air pollution from traffic & construction",
    "waste": "Poor solid-waste management",
    "green_space": "Loss of public & green/open space",
    "climate_risk": "Climate & disaster risk (heat, flooding)",
    "funding": "Limited municipal funding for infrastructure",
    "fragmented_planning": "Fragmented planning across agencies (BBMP/BDA/BWSSB/BMRCL)",
    "data_gaps": "Lack of reliable, unified urban data",
}

OBSTACLE_IDS = list(OBSTACLES.keys())
