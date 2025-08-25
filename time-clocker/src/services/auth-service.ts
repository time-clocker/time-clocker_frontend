import type { LoginRequest, LoginResponse } from "../types/auth";
import { api } from "../types/auth";

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {

      const response = await api.post<LoginResponse>('/auth/login', credentials);
    
      return response.data;
      
    } catch (error: any) {
      
      if (error.response) {        
        if (error.response.data?.detail) {
          throw new Error(error.response.data.detail[0]?.msg || 'Error de autenticación');
        }
        throw new Error(error.response.data?.message || 'Error del servidor');
      } else if (error.request) {
        throw new Error('No se pudo conectar con el servidor');
      } else {
        throw new Error('Error inesperado');
      }
    }
  },

  setTokens(tokens: LoginResponse): void {
    localStorage.setItem('idToken', tokens.idToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userEmail', tokens.email);
  },

  getToken(): string | null {
    return localStorage.getItem('idToken');
  },

  logout(): void {
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};