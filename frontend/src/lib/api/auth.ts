/**
 * Authentication API
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, AuthErrorResponse } from '@/types/api';
import type { User } from '@/types/entities';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post(ENDPOINTS.AUTH_LOGIN, credentials);
  },

  /**
   * Signup/Register new user
   */
  signup: async (credentials: SignupRequest): Promise<SignupResponse> => {
    return apiClient.post(ENDPOINTS.AUTH_SIGNUP, credentials);
  },

  /**
   * Logout user (client-side only, clears token)
   */
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get current user (if token is valid)
   * Calls /auth/me endpoint which validates token and returns user data
   */
  getCurrentUser: async (): Promise<{ success: true; data: User }> => {
    const response: any = await apiClient.get(ENDPOINTS.AUTH_ME);
    // Handle various response formats
    if (response && response.success && response.data) {
      return { success: true, data: response.data as User };
    }
    // Handle direct user response
    if (response && response.id) {
      return { success: true, data: response as User };
    }
    // If response doesn't have expected format, throw error
    throw new Error('Invalid response format from /auth/me');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get stored auth token
   */
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Store auth token
   */
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
};

