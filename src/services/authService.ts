import { api, setAuthToken } from './apiClient';
import type { AuthTokenResponse, User } from '../types';

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthTokenResponse> {
    const result = await api.post<AuthTokenResponse>('/api/auth/register', { email, password, name });
    setAuthToken(result.access_token);
    return result;
  },

  async login(email: string, password: string): Promise<AuthTokenResponse> {
    const result = await api.post<AuthTokenResponse>('/api/auth/login', { email, password });
    setAuthToken(result.access_token);
    return result;
  },

  async googleAuth(idToken: string): Promise<AuthTokenResponse> {
    const result = await api.post<AuthTokenResponse>('/api/auth/google', { id_token: idToken });
    setAuthToken(result.access_token);
    return result;
  },

  async getMe(): Promise<User> {
    return api.get<User>('/api/auth/me');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/auth/forgot-password', { email });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/auth/reset-password', { email, code, newPassword });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return api.post<{ message: string }>('/api/auth/change-password', { old_password: oldPassword, new_password: newPassword });
  },

  logout() {
    setAuthToken(null);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('nexus_auth_token');
  },
};
