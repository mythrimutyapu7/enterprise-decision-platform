export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface IncidentSummary {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdBy: string;
  createdAt: string;
}

export interface IncidentDetail extends IncidentSummary {
  description: string;
  context?: Record<string, unknown>;
}

export interface CreateIncidentRequest {
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdBy: string;
}

export interface AnalysisResponse {
  incidentSummary: Record<string, unknown>;
  context: Record<string, unknown>;
  riskAnalysis: Record<string, unknown>;
  recommendations: Record<string, unknown>;
  approval: Record<string, unknown>;
}
