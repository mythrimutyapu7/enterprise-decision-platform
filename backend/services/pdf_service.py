from io import BytesIO
from textwrap import wrap

from bson import ObjectId
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from backend.database.mongodb import database

incidents_collection = database["incidents"]


def _as_lines(value):
	if value is None:
		return []

	if isinstance(value, list):
		return [str(item).strip() for item in value if str(item).strip()]

	text = str(value).strip()
	return [text] if text else []


def _display_value(value, fallback="Not provided"):
	if value is None:
		return fallback

	if isinstance(value, str):
		text = value.strip()
		return text if text else fallback

	return str(value)


def _section(story, title, items, styles):
	lines = _as_lines(items)

	if not lines:
		return

	story.append(Paragraph(title, styles["section_title"]))
	story.append(Spacer(1, 0.12 * inch))

	for item in lines:
		for line in wrap(item, width=92) or [item]:
			story.append(Paragraph(line, styles["body"]))
		story.append(Spacer(1, 0.08 * inch))


async def build_investigation_report(id: str):
	incident = await incidents_collection.find_one({"_id": ObjectId(id)})

	if not incident:
		return {
			"success": False,
			"message": "Incident not found",
		}

	analysis_bundle = incident.get("analysis") or {}
	incident_data = analysis_bundle.get("incident") or {}
	context_data = analysis_bundle.get("context") or {}
	analysis_data = analysis_bundle.get("analysis") or {}
	recommendation_data = analysis_bundle.get("recommendation") or {}
	approval_data = analysis_bundle.get("approval") or {}
	shared_analysis = analysis_bundle.get("shared_analysis") or {}

	incident_source = incident_data or shared_analysis.get("incident", {})
	context_source = context_data or shared_analysis.get("context", {})
	analysis_source = analysis_data or shared_analysis.get("analysis", {})
	recommendation_source = recommendation_data or shared_analysis.get("recommendation", {})
	approval_source = approval_data or shared_analysis.get("approval", {})

	buffer = BytesIO()
	document = SimpleDocTemplate(
		buffer,
		pagesize=letter,
		rightMargin=0.7 * inch,
		leftMargin=0.7 * inch,
		topMargin=0.7 * inch,
		bottomMargin=0.7 * inch,
	)

	styles = getSampleStyleSheet()
	styles.add(
		ParagraphStyle(
			name="ReportTitle",
			parent=styles["Title"],
			fontSize=20,
			leading=24,
			textColor=colors.HexColor("#0f172a"),
			spaceAfter=12,
		)
	)
	styles.add(
		ParagraphStyle(
			name="SectionTitle",
			parent=styles["Heading2"],
			fontSize=12,
			leading=14,
			textColor=colors.HexColor("#1d4ed8"),
			spaceBefore=8,
			spaceAfter=6,
		)
	)
	styles.add(
		ParagraphStyle(
			name="ReportBody",
			parent=styles["BodyText"],
			fontSize=9.5,
			leading=13,
			textColor=colors.HexColor("#334155"),
		)
	)

	section_title_style = styles["SectionTitle"]
	body_style = styles["ReportBody"]

	story = [
		Paragraph("Investigation Report", styles["ReportTitle"]),
		Paragraph(
			f"Incident: {_display_value(incident_source.get('summary') or incident.get('title') or incident_source.get('title'), 'Untitled Incident')}",
			body_style,
		),
		Spacer(1, 0.16 * inch),
	]

	summary_rows = [
		["Title", _display_value(incident_source.get("title") or incident.get("title"))],
		["Summary", _display_value(incident_source.get("summary"))],
		["Incident Type", _display_value(incident_source.get("incident_type"))],
		["Severity", _display_value(incident_source.get("severity") or incident.get("severity"))],
		["Source", _display_value(incident_source.get("source") or incident.get("created_by"))],
		["Created By", _display_value(incident_source.get("created_by") or incident.get("created_by"))],
		["Uploaded File", _display_value(incident_source.get("uploaded_file") or incident.get("uploaded_file"), "None")],
		["AI Risk Level", _display_value(analysis_source.get("risk_level"))],
		["AI Risk Score", _display_value(analysis_source.get("risk_score"))],
		["AI Confidence", _display_value(f"{analysis_source.get('confidence')}%" if analysis_source.get("confidence") is not None else None)],
		["Approval Status", _display_value(approval_source.get("execution_status"), "Pending")],
	]

	summary_table = Table(summary_rows, colWidths=[1.6 * inch, 4.8 * inch])
	summary_table.setStyle(
		TableStyle(
			[
				("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
				("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
				("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
				("FONTSIZE", (0, 0), (-1, -1), 9),
				("LEADING", (0, 0), (-1, -1), 12),
				("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
				("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
				("VALIGN", (0, 0), (-1, -1), "TOP"),
				("LEFTPADDING", (0, 0), (-1, -1), 8),
				("RIGHTPADDING", (0, 0), (-1, -1), 8),
				("TOPPADDING", (0, 0), (-1, -1), 6),
				("BOTTOMPADDING", (0, 0), (-1, -1), 6),
			]
		)
	)

	story.append(summary_table)
	story.append(Spacer(1, 0.18 * inch))

	_section(
		story,
		"Incident Overview",
		[
			f"Description: {_display_value(incident_source.get('description') or incident.get('description'))}",
			f"Summary: {_display_value(incident_source.get('summary'))}",
			f"Incident Type: {_display_value(incident_source.get('incident_type'))}",
			f"Source: {_display_value(incident_source.get('source') or incident.get('created_by'))}",
		],
		{
			"section_title": section_title_style,
			"body": body_style,
		},
	)
	_section(story, "Key Findings", incident_source.get("key_findings"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Context - Security Policies", context_source.get("security_policies"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Context - Incident Playbooks", context_source.get("incident_playbooks"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Context - Threat Intelligence", context_source.get("threat_intelligence"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Context - Organizational Notes", context_source.get("organizational_notes"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Analysis - Indicators", analysis_source.get("indicators"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Analysis - Risks", analysis_source.get("risks"), {"section_title": section_title_style, "body": body_style})
	_section(story, "Analysis - Missing Information", analysis_source.get("missing_information"), {"section_title": section_title_style, "body": body_style})
	_section(
		story,
		"Recommendation",
		[
			f"Recommended Action: {_display_value(recommendation_source.get('recommended_action'))}",
			f"Priority: {_display_value(recommendation_source.get('action_priority'))}",
			f"Business Impact: {_display_value(recommendation_source.get('business_impact'))}",
			f"Confidence: {_display_value(recommendation_source.get('confidence'))}",
		],
		{"section_title": section_title_style, "body": body_style},
	)
	_section(story, "Recommendation - Follow Up Actions", recommendation_source.get("follow_up_actions"), {"section_title": section_title_style, "body": body_style})
	_section(
		story,
		"Approval",
		[
			f"Approved: {_display_value(approval_source.get('approved'), 'False')}",
			f"Approved By: {_display_value(approval_source.get('approved_by'), 'Pending Analyst Review')}",
			f"Reviewer Comments: {_display_value(approval_source.get('reviewer_comments'), 'Awaiting analyst approval.')}",
			f"Approval Timestamp: {_display_value(approval_source.get('approval_timestamp'), 'Not provided')}",
			f"Execution Status: {_display_value(approval_source.get('execution_status'), 'Pending')}",
		],
		{"section_title": section_title_style, "body": body_style},
	)

	document.build(story)
	buffer.seek(0)

	return StreamingResponse(
		buffer,
		media_type="application/pdf",
		headers={
			"Content-Disposition": f'attachment; filename="investigation-report-{id}.pdf"',
		},
	)
