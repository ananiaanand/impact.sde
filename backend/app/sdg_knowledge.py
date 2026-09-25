"""Structured SDG 11 knowledge base used to ground case generation."""

SDG11_TARGETS = [
    {
        "target_id": "11.1",
        "topic": "Housing and informal settlements",
        "description": "Ensure access to adequate, safe and affordable housing; upgrade slums.",
        "keywords": ["housing", "slum", "informal settlement", "affordability", "eviction"],
        "related_urban_problems": ["housing pressure", "informal settlement redevelopment", "displacement"],
        "research_questions": [
            "Which target addresses access to safe, affordable housing for all?",
        ],
    },
    {
        "target_id": "11.2",
        "topic": "Transport",
        "description": "Provide safe, affordable, accessible and sustainable transport systems for all.",
        "keywords": ["transport", "public transit", "accessibility", "road safety", "mobility"],
        "related_urban_problems": ["transport accessibility"],
        "research_questions": [
            "Which target addresses safe and accessible transport systems?",
        ],
    },
    {
        "target_id": "11.3",
        "topic": "Inclusive and participatory urbanization",
        "description": "Enhance inclusive, sustainable urbanization and participatory planning.",
        "keywords": ["participation", "urbanization", "community planning", "governance"],
        "related_urban_problems": ["urban expansion", "displacement"],
        "research_questions": [
            "Which target concerns participatory, inclusive urban planning?",
        ],
    },
    {
        "target_id": "11.4",
        "topic": "Cultural and natural heritage",
        "description": "Strengthen efforts to protect and safeguard cultural and natural heritage.",
        "keywords": ["heritage", "historic site", "cultural preservation", "landmark"],
        "related_urban_problems": ["heritage preservation"],
        "research_questions": [
            "Which target concerns protecting cultural and natural heritage?",
        ],
    },
    {
        "target_id": "11.5",
        "topic": "Disasters and resilience",
        "description": "Reduce deaths, losses and impacts of disasters, including water-related disasters.",
        "keywords": ["disaster", "flood", "resilience", "vulnerability", "emergency"],
        "related_urban_problems": ["flooding", "disaster vulnerability"],
        "research_questions": [
            "Which target addresses reducing disaster impacts on people and cities?",
        ],
    },
    {
        "target_id": "11.6",
        "topic": "Environmental impact of cities",
        "description": "Reduce the per-capita environmental impact of cities, incl. air quality and waste.",
        "keywords": ["pollution", "air quality", "waste", "environmental impact"],
        "related_urban_problems": ["waste infrastructure", "environmental degradation"],
        "research_questions": [
            "Which target concerns reducing the environmental impact of cities?",
        ],
    },
    {
        "target_id": "11.7",
        "topic": "Green and public spaces",
        "description": "Provide universal access to safe, inclusive, accessible green and public spaces.",
        "keywords": ["green space", "park", "public space", "vegetation", "safety"],
        "related_urban_problems": ["loss of vegetation", "loss of green space", "unsafe public spaces"],
        "research_questions": [
            "Which target concerns access to safe, inclusive green and public spaces?",
        ],
    },
    {
        "target_id": "11.a",
        "topic": "Urban/rural/regional planning",
        "description": "Support positive economic, social and environmental links via regional planning.",
        "keywords": ["regional planning", "urban-rural links", "development planning"],
        "related_urban_problems": ["urban expansion", "environmental degradation"],
        "research_questions": [
            "Which target concerns urban, peri-urban and rural planning links?",
        ],
    },
    {
        "target_id": "11.b",
        "topic": "Resilience and climate adaptation",
        "description": "Increase cities adopting integrated policies for resilience and climate adaptation.",
        "keywords": ["climate adaptation", "resilience policy", "risk reduction"],
        "related_urban_problems": ["resilience planning", "disaster vulnerability"],
        "research_questions": [
            "Which target concerns integrated disaster risk and climate resilience policy?",
        ],
    },
    {
        "target_id": "11.c",
        "topic": "Sustainable and resilient buildings",
        "description": "Support least developed countries in building sustainable, resilient structures.",
        "keywords": ["building materials", "construction", "resilient buildings"],
        "related_urban_problems": ["informal settlement redevelopment", "disaster vulnerability"],
        "research_questions": [
            "Which target concerns sustainable, locally-sourced resilient construction?",
        ],
    },
]

URBAN_PROBLEMS = [
    "flooding", "urban heat", "loss of vegetation", "loss of green space",
    "transport accessibility", "housing pressure", "informal settlement redevelopment",
    "displacement", "urban expansion", "environmental degradation",
    "waste infrastructure", "disaster vulnerability", "heritage preservation",
    "unsafe public spaces", "resilience planning",
]


def targets_for_problem(problem: str) -> list[dict]:
    return [t for t in SDG11_TARGETS if problem in t["related_urban_problems"]]


def target_by_id(target_id: str) -> dict | None:
    for t in SDG11_TARGETS:
        if t["target_id"] == target_id:
            return t
    return None
