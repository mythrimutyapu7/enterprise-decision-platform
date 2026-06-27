import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const login = async (payload: LoginRequest) => {
  const response = await api.post('/auth/login', payload);
  const data = response.data as any;
  // normalize backend `access_token` -> `accessToken` for frontend usage
  if (data.access_token && !data.accessToken) {
    data.accessToken = data.access_token;
  }
  return data as AuthResponse;
};

export const register = async (payload: RegisterRequest) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};
