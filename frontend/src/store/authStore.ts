/**
 * Authentication Store - Zustand store for auth state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/entities';
import { authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ username, password });

          // Handle various response formats from the API:
          // Format 1 (standard): { success: true, data: { token, user } }
          // Format 2 (direct): { token, user }
          // Format 3 (flat): { success: true, token, user }

          let token: string | undefined;
          let user: User | undefined;

          if (!response) {
            throw new Error('Empty response from server. Please check your credentials.');
          }

          // Check for error response
          if (response.success === false) {
            throw new Error(response.error?.message || 'Login failed');
          }

          // Format 1: Standard wrapped response
          if (response.success && response.data) {
            token = response.data.token;
            user = response.data.user;
          }
          // Format 2: Direct response (token and user at root level)
          else if (response.token) {
            token = response.token;
            user = response.user;
          }
          // Format 3: Flat response with success flag
          else if (response.success && response.token) {
            token = response.token;
            user = response.user;
          }

          if (!token) {
            throw new Error('Token not found in response. Please check your credentials.');
          }

          if (!user) {
            // If no user data but we have a token, create minimal user object
            user = { id: 0, username: username } as User;
          }

          authApi.setToken(token);
          set({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Login error:', error);
          set({
            isLoading: false,
            error: error?.error?.message || error?.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      signup: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.signup({ username, password });
          if (response.success) {
            // After successful signup, automatically log the user in
            // by calling login with the same credentials
            await get().login(username, password);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.error?.message || 'Signup failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        authApi.setToken(token);
        set({ token, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const token = authApi.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        // Verify token with /auth/me endpoint
        set({ isLoading: true });
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            // Token is valid, update user data
            set({
              user: response.data,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Invalid response format
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
            authApi.logout();
          }
        } catch (error: any) {
          // Check if it's an authentication error (401/UNAUTHORIZED)
          const isAuthError = 
            error?.error?.code === 'UNAUTHORIZED' || 
            error?.error?.code === 'INVALID_TOKEN' ||
            error?.error?.code === 'TOKEN_DECODE_ERROR' ||
            error?.response?.status === 401;
          
          if (isAuthError) {
            // Actual authentication failure - clear everything
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
            authApi.logout();
          } else {
            // Network error or other non-auth errors - keep token but don't update user
            // This prevents clearing auth state on temporary network issues
            set({
              token,
              isAuthenticated: true, // Keep authenticated if we have a token
              isLoading: false,
            });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

