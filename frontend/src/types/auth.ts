export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  accessToken?: string;
  token_type?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
