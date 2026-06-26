from planner.models.context import ContextInfo

context = ContextInfo(
    security_policies=[
        "MFA Required",
        "Password Reset Policy"
    ],
    incident_playbooks=[
        "Credential Compromise"
    ],
    threat_intelligence=[
        "Known Malicious IP"
    ],
    affected_assets=[
        "Office365"
    ]
)

print(context)
print()
print(context.model_dump())