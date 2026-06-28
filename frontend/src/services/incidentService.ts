import api from "./api";
import {
  CreateIncidentRequest,
  IncidentDetail,
  IncidentSummary,
  AnalysisResponse,
} from "../types/incident";

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

const normalizeSeverity = (
  severity?: string
): IncidentSummary["severity"] => {
  const value = severity?.toLowerCase();

  if (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
  ) {
    return value;
  }

  return "low";
};

const normalizeStatus = (
  status?: string
): IncidentSummary["status"] => {
  const value = status?.toLowerCase();

  if (
    value === "open" ||
    value === "in_progress" ||
    value === "resolved" ||
    value === "closed"
  ) {
    return value;
  }

  if (value === "in progress") {
    return "in_progress";
  }

  return "open";
};

const normalizeIncident = (
  incident: BackendIncident
): IncidentDetail => ({
  id: incident.id || incident._id || "",
  title: incident.title || "Untitled Incident",
  description: incident.description || "",
  severity: normalizeSeverity(incident.severity),
  status: normalizeStatus(incident.status),
  createdBy:
    incident.createdBy ||
    incident.created_by ||
    "Unknown",
  createdAt:
    incident.createdAt ||
    incident.created_at ||
    new Date().toISOString(),
  context: incident.context,
});

export const fetchIncidents = async (): Promise<
  IncidentSummary[]
> => {

  const response = await api.get<
    IncidentSummary[] | BackendListResponse
  >("/incidents/");

  const incidents = Array.isArray(response.data)
    ? response.data
    : response.data.data || [];

  return incidents.map(normalizeIncident);

};

export const fetchIncidentById = async (
  id: string
): Promise<IncidentDetail> => {

  const response = await api.get<
    IncidentDetail | BackendDetailResponse
  >(`/incidents/${id}`);

  const incident =
    "data" in response.data && response.data.data
      ? response.data.data
      : (response.data as BackendIncident);

  return normalizeIncident(incident);

};

export const createIncident = async (
  payload: CreateIncidentRequest
) => {

  const response = await api.post("/incidents/", {
    title: payload.title,
    description: payload.description,
    severity: payload.severity,
    status: payload.status,
    created_by: payload.createdBy,
  });

  return response.data;

};

export const deleteIncident = async (
  id: string
) => {

  const response = await api.delete(
    `/incidents/${id}`
  );

  return response.data;

};

// ======================================
// Load Saved Analysis
// ======================================

export const getSavedAnalysis = async (
  id: string
): Promise<AnalysisResponse | null> => {

  try {

    const response = await api.get(
      `/incidents/${id}/analysis`
    );

    if (!response.data.success) {
      return null;
    }

    return response.data.analysis;

  } catch {

    return null;

  }

};

// ======================================
// Analyze
// ======================================

export const analyzeIncident = async (
  id: string
): Promise<AnalysisResponse> => {

  const response = await api.post(
    `/incidents/${id}/analyze`
  );

  if (!response.data.success) {

    throw new Error(
      response.data.error || "Analysis failed"
    );

  }

  return response.data.analysis;

};

// ======================================
// Re-analyze
// ======================================

export const reAnalyzeIncident = async (
  id: string
): Promise<AnalysisResponse> => {

  const response = await api.post(
    `/incidents/${id}/reanalyze`
  );

  if (!response.data.success) {

    throw new Error(
      response.data.error || "Analysis failed"
    );

  }

  return response.data.analysis;

};

// ======================================
// Download Investigation Report
// ======================================

export const downloadInvestigationReport = async (
  id: string
): Promise<Blob> => {

  const response = await api.get(
    `/incidents/${id}/report`,
    {
      responseType: "blob",
    }
  );

  return response.data;

};

// ======================================
// Approve Recommendation
// ======================================

export const approveRecommendation = async (
  id: string
) => {

  const response = await api.post(
    `/recommendations/${id}/approve`
  );

  return response.data;

};

// ======================================
// Reject Recommendation
// ======================================

export const rejectRecommendation = async (
  id: string
) => {

  const response = await api.post(
    `/recommendations/${id}/reject`
  );

  return response.data;

};

// ======================================
// Get Recommendation
// ======================================

export const getRecommendation = async (
  id: string
) => {

  const response = await api.get(
    `/recommendations/${id}`
  );

  if (!response.data.success) {

    return null;

  }

  return response.data.data;

};