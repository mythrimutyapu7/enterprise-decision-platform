import api from './api';
import { CreateIncidentRequest, IncidentDetail, IncidentSummary, AnalysisResponse } from '../types/incident';

interface BackendIncident {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  created_by?: string;
  createdBy?: string;
  created_at?: string;
  createdAt?: string;
  context?: Record<string, unknown>;
}

interface BackendListResponse {
  success?: boolean;
  count?: number;
  data?: BackendIncident[];
}

interface BackendDetailResponse {
  success?: boolean;
  data?: BackendIncident;
}

interface BackendAnalysisResponse {
  success?: boolean;
  analysis?: Partial<AnalysisResponse>;
  data?: Partial<AnalysisResponse>;
}

const normalizeSeverity = (severity?: string): IncidentSummary['severity'] => {
  const value = severity?.toLowerCase();
  if (value === 'critical' || value === 'high' || value === 'medium' || value === 'low') return value;
  return 'low';
};

const normalizeStatus = (status?: string): IncidentSummary['status'] => {
  const value = status?.toLowerCase();
  if (value === 'open' || value === 'in_progress' || value === 'resolved' || value === 'closed') return value;
  if (value === 'in progress') return 'in_progress';
  return 'open';
};

const normalizeIncident = (incident: BackendIncident): IncidentDetail => ({
  id: incident.id || incident._id || '',
  title: incident.title || 'Untitled incident',
  description: incident.description || '',
  severity: normalizeSeverity(incident.severity),
  status: normalizeStatus(incident.status),
  createdBy: incident.createdBy || incident.created_by || 'Unknown',
  createdAt: incident.createdAt || incident.created_at || new Date().toISOString(),
  context: incident.context,
});

export const fetchIncidents = async (): Promise<IncidentSummary[]> => {
  const response = await api.get<IncidentSummary[] | BackendListResponse>('/incidents/');
  const incidents = Array.isArray(response.data) ? response.data : response.data.data || [];
  return incidents.map((incident) => normalizeIncident(incident));
};

export const fetchIncidentById = async (id: string): Promise<IncidentDetail> => {
  const response = await api.get<IncidentDetail | BackendDetailResponse>(`/incidents/${id}`);
  const incident = 'data' in response.data && response.data.data ? response.data.data : (response.data as BackendIncident);
  return normalizeIncident(incident);
};

export const createIncident = async (payload: CreateIncidentRequest) => {
  const response = await api.post('/incidents/', {
    title: payload.title,
    description: payload.description,
    severity: payload.severity,
    status: payload.status,
    created_by: payload.createdBy,
  });
  return response.data;
};

export const deleteIncident = async (id: string) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};

export const analyzeIncident = async (id: string): Promise<any> => {
  const response = await api.post(`/incidents/${id}/analyze`);

  if (!response.data) {
    throw new Error('No response from analysis endpoint');
  }

  if (response.data.success === false) {
    const err = response.data.error || 'Analysis failed';
    throw new Error(err);
  }

  const result = response.data.analysis || response.data;

  return {
    incident: result.incident,
    context: result.context,
    analysis: result.analysis,
    recommendation: result.recommendation,
    approval: result.approval,
  };
};
