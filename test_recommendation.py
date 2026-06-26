from planner.models.recommendation import RecommendationResult

recommendation = RecommendationResult(
    recommended_action="Disable User Account",
    action_priority="Critical",
    reasoning=[
        "Multiple failed logins",
        "Suspicious foreign login"
    ],
    supporting_evidence=[
        "Azure AD Logs",
        "Threat Intelligence"
    ],
    confidence=95
)

print(recommendation)
print()
print(recommendation.model_dump())