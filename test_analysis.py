from planner.models.analysis import AnalysisResult

analysis = AnalysisResult(
    risk_level="Critical",
    risk_score=96,
    confidence=94,
    indicators=[
        "Multiple failed logins",
        "Foreign IP detected"
    ],
    risks=[
        "Credential Compromise"
    ]
)

print(analysis)
print()
print(analysis.model_dump())