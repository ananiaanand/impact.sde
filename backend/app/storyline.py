"""
SDG 11 Detective — Bengaluru Storyline
========================================

FRAME
-----
Player: junior investigator, "Bengaluru Urban Futures Cell" (fictional city
task-force). Case opened after satellite heat data flag Bengaluru as fastest-
warming metro in south India over past decade.

CENTRAL MYSTERY
----------------
"Why is Bengaluru getting hotter, more congested, and harder to live in --
and who or what is responsible?"

There is no single villain. The "culprit" is a web of 10 linked structural
problems. Player does not get them in fixed order -- opening ANY clue reveals
1-3 "leads" (connected obstacle nodes), so different players uncover
different paths through the same case.

ENTRY POINT (always unlocked first)
------------------------------------
Node: HEAT_MAP
  Evidence: NASA MOD11A2 land-surface-temp GeoJSON, 2012 vs 2026, Leaflet map.
  Story beat: "Your first exhibit: heat readings across the city, 14 years
  apart. Some neighborhoods barely changed. Others -- like the cell near
  [hotspot ward] -- jumped over 2 degrees C. Where do you dig first?"
  Unlocks leads -> UNPLANNED_GROWTH, GREEN_SPACE (both directly explain
  localized warming).

OBSTACLE NODES (10), each a mini-case-file
--------------------------------------------
1. UNPLANNED_GROWTH
   Clue: Satellite built-up-area layer shows dense construction exactly
   where LST jumped most; zero corresponding update to the city's Master
   Plan boundary for that zone.
   Leads to: HOUSING, FRAGMENTED_PLANNING

2. GREEN_SPACE
   Clue: Tree-cover survey shows a 30%+ drop in canopy in the same hotspot
   ring between 2012-2026; lake/wetland encroachment records for two lakes
   nearby.
   Leads to: CLIMATE_RISK, DATA_GAPS

3. HOUSING
   Clue: Informal settlement growth overlaid on the hotspot zone; rent data
   showing formal housing priced out low-income workers who then settled in
   flood-prone or unregulated land.
   Leads to: TRANSPORT, FUNDING

4. TRANSPORT
   Clue: Commute-time survey + vehicle registration growth far outpacing
   road/metro expansion; informal settlements far from metro lines force
   long private-vehicle commutes.
   Leads to: AIR_POLLUTION, UNPLANNED_GROWTH (loop-back, reinforces)

5. AIR_POLLUTION
   Clue: PM2.5 monitoring station data spikes correlating with traffic
   corridors and construction dust near the hotspot.
   Leads to: CLIMATE_RISK, WASTE (open burning contributes)

6. WASTE
   Clue: Landfill capacity report -- overflow, informal burning incidents
   logged near two wards; segregation compliance data low.
   Leads to: FUNDING, DATA_GAPS

7. CLIMATE_RISK
   Clue: Flood-incident log for monsoon seasons 2018-2025 clustered in
   low-lying ex-lakebed areas now built over; heat-stress hospital-admission
   trend.
   Leads to: FRAGMENTED_PLANNING

8. FUNDING
   Clue: Municipal budget allocation doc -- infrastructure spend per capita
   flat since 2015 while population + built-up area grew sharply.
   Leads to: FRAGMENTED_PLANNING, DATA_GAPS

9. FRAGMENTED_PLANNING
   Clue: Timeline showing BBMP, BDA, BWSSB and BMRCL approving overlapping
   or contradictory permits for the same hotspot zone with no shared
   database.
   Leads to: DATA_GAPS (root convergence node)

10. DATA_GAPS
    Clue: Investigator finds no single authority holds a unified, current
    land-use + infrastructure + environment dataset -- explaining why the
    other 9 problems went unnoticed or uncoordinated for years.
    Terminal node: all paths converge here. This is the "root cause behind
    the root causes" -- reveal at final case review regardless of path taken.

WIN CONDITION / FINAL QUESTION
--------------------------------
Player must have visited >= 4 obstacle nodes across >= 2 distinct "branches"
(branches: PHYSICAL = growth/housing/transport/air/green,
SYSTEMIC = funding/planning/data/climate) before final unlocks.
Final prompt: "Connect your findings: what chain of causes made Bengaluru's
[assigned hotspot zone] heat up the most, and what single systemic gap
made it hard to prevent?" Scored against the causal chain implied by the
nodes the player actually visited (not a fixed universal answer) + whether
DATA_GAPS was correctly named as the convergence point.

NON-LINEARITY RULE
--------------------
A node unlocks the moment ANY of its prerequisite nodes is completed (OR
logic, not AND) -- so a team can hit DATA_GAPS via WASTE+FUNDING while
another team hits it via FRAGMENTED_PLANNING alone. Different teams,
different stories, same 10-obstacle truth underneath.
"""

from .obstacles import OBSTACLE_IDS  # noqa: F401 (kept for import-time validation)

STORYLINE_INTRO = (
    "Satellite heat data just flagged Bengaluru as the fastest-warming metro "
    "in the south over the last 14 years. You're the newest investigator on "
    "the Bengaluru Urban Futures Cell. No one knows the full story yet -- "
    "not even your seniors. Follow the evidence."
)

NODE_GRAPH: dict[str, dict] = {
    "HEAT_MAP": {
        "obstacle": None,
        "title": "Exhibit A: The Heat Map",
        "story": (
            "NASA land-surface-temperature readings, 2012 vs 2026. Most of "
            "the city barely shifted. One ring of grid cells jumped over "
            "2C. Start there."
        ),
        "unlocks": ["UNPLANNED_GROWTH", "GREEN_SPACE"],
    },
    "UNPLANNED_GROWTH": {
        "obstacle": "unplanned_growth",
        "title": "Built Without a Blueprint",
        "story": (
            "Built-up-area imagery shows dense new construction exactly "
            "where the heat spiked -- but the Master Plan boundary for that "
            "zone was never updated to match."
        ),
        "unlocks": ["HOUSING", "FRAGMENTED_PLANNING"],
    },
    "GREEN_SPACE": {
        "obstacle": "green_space",
        "title": "The Missing Canopy",
        "story": (
            "Tree cover in the hotspot ring dropped over 30% in 14 years. "
            "Two nearby lakes show encroachment in municipal records."
        ),
        "unlocks": ["CLIMATE_RISK", "DATA_GAPS"],
    },
    "HOUSING": {
        "obstacle": "housing",
        "title": "Priced Out, Pushed In",
        "story": (
            "Formal housing near the hotspot priced out low-income workers. "
            "Informal settlement footprints grew fastest in flood-prone, "
            "unregulated land nearby."
        ),
        "unlocks": ["TRANSPORT", "FUNDING"],
    },
    "TRANSPORT": {
        "obstacle": "transport",
        "title": "The Long Commute",
        "story": (
            "Vehicle registrations outpaced road and metro expansion for a "
            "decade. Residents pushed to the city edge face commutes with "
            "no transit option but private vehicles."
        ),
        "unlocks": ["AIR_POLLUTION", "UNPLANNED_GROWTH"],
    },
    "AIR_POLLUTION": {
        "obstacle": "air_pollution",
        "title": "What's in the Air",
        "story": (
            "PM2.5 spikes track almost exactly with traffic corridors and "
            "construction dust in the hotspot zone."
        ),
        "unlocks": ["CLIMATE_RISK", "WASTE"],
    },
    "WASTE": {
        "obstacle": "waste",
        "title": "Overflow",
        "story": (
            "Landfill capacity reports show overflow and repeated informal "
            "burning incidents in two wards near the hotspot; segregation "
            "compliance is low citywide."
        ),
        "unlocks": ["FUNDING", "DATA_GAPS"],
    },
    "CLIMATE_RISK": {
        "obstacle": "climate_risk",
        "title": "The Ex-Lakebed Problem",
        "story": (
            "Flood incidents since 2018 cluster in low-lying areas that "
            "used to be lakebeds and are now built over. Heat-stress "
            "hospital admissions trend upward in the same zone."
        ),
        "unlocks": ["FRAGMENTED_PLANNING"],
    },
    "FUNDING": {
        "obstacle": "funding",
        "title": "The Budget Didn't Grow",
        "story": (
            "Infrastructure spend per capita has stayed flat since 2015 "
            "while population and built-up area grew sharply."
        ),
        "unlocks": ["FRAGMENTED_PLANNING", "DATA_GAPS"],
    },
    "FRAGMENTED_PLANNING": {
        "obstacle": "fragmented_planning",
        "title": "Four Agencies, No Shared Map",
        "story": (
            "BBMP, BDA, BWSSB and BMRCL each approved permits for the same "
            "zone -- some contradicting each other -- with no shared "
            "database between them."
        ),
        "unlocks": ["DATA_GAPS"],
    },
    "DATA_GAPS": {
        "obstacle": "data_gaps",
        "title": "The Root Beneath the Roots",
        "story": (
            "No single authority holds a unified, current dataset on land "
            "use, infrastructure and environment for the city. That absence "
            "is why the other problems went unnoticed or uncoordinated for "
            "years."
        ),
        "unlocks": [],
    },
}

BRANCHES = {
    "PHYSICAL": {"unplanned_growth", "housing", "transport", "air_pollution", "green_space"},
    "SYSTEMIC": {"funding", "fragmented_planning", "data_gaps", "climate_risk"},
}

MIN_OBSTACLES_FOR_FINAL = 4
MIN_BRANCHES_FOR_FINAL = 2
