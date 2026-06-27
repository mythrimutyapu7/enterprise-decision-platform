import api from './api';
import { CreateIncidentRequest, IncidentDetail, IncidentSummary, AnalysisResponse } from '../types/incident';

export const fetchIncidents = async () => {
  const response = await api.get<IncidentSummary[]>('/incidents');
  return response.data;
};

export const fetchIncidentById = async (id: string) => {
  const response = await api.get<IncidentDetail>(`/incidents/${id}`);
  return response.data;
};

export const createIncident = async (payload: CreateIncidentRequest) => {
  const response = await api.post<IncidentDetail>('/incidents', payload);
  return response.data;
};

export const deleteIncident = async (id: string) => {
  const response = await api.delete(`/incidents/${id}`);
  return response.data;
};

export const analyzeIncident = async (id: string) => {
  const response = await api.post<AnalysisResponse>(`/incidents/${id}/analyze`);
  return response.data;
};
