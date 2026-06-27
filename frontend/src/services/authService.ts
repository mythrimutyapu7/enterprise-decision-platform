import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const login = async (payload: LoginRequest) => {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
};

export const register = async (payload: RegisterRequest) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};
