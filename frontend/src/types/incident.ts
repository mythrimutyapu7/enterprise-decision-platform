export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdBy: string;
  createdAt: string;
  analystNotes?: string;
  analystNotesUpdatedAt?: string;
}

export interface IncidentDetail extends IncidentSummary {
  description: string;
  context?: Record<string, unknown>;
  analystNotes?: string;
  analysis?: Record<string, unknown>;
}

export interface IngestIncidentRequest {
  source_type: string;
  raw_content: string;
  metadata: Record<string, any>;
}

export interface CreateIncidentRequest {
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  createdBy?: string;
  source?: string;
  
  // For flexibility when handling ingested forms
  source_type?: string;
  raw_content?: string;
  metadata?: Record<string, any>;
}

export interface AnalysisResponse {
  incident: {
    incident_id: number;
    title: string;
    description: string;
    summary: string;
    incident_type: string;
    severity: string;
    source: string;
    created_by?: string;
    uploaded_file?: string | null;
    key_findings: string[];
  };

  context: {
    security_policies: string[];
    incident_playbooks: string[];
    threat_intelligence: string[];
    affected_assets: string[];
    organizational_notes: string[];
  };

  analysis: {
    risk_level: string;
    risk_score: number;
    confidence: number;

    indicators: string[];
    missing_information: string[];
    opportunities: string[];
    risks: string[];
  };

  recommendation: {
    recommended_action: string;
    action_priority: string;
    business_impact: string;

    reasoning: string[];
    supporting_evidence: string[];

    confidence: number;

    alternative_actions: string[];
    follow_up_actions: string[];
  };

  approval: {
    approved: boolean;
    approved_by: string | null;
    reviewer_comments: string | null;
    approval_timestamp: string | null;
    execution_status: string;
  };

  planner_decision?: string;
  similarity_score?: number;
}
