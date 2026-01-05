/**
 * User API - CRUD operations for users
 * Uses dedicated webhook endpoint for user management
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import { ENDPOINTS, replaceParams } from './endpoints';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/entities';
import type {
  UserListResponse,
  UserResponse,
  UserListParams,
} from '@/types/api';

/**
 * Dedicated Axios client for Users API
 * Uses the same webhook endpoint as contacts, identifications, addresses, and notes
 */
const usersClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
usersClient.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add language_id to POST/PUT/PATCH request bodies
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        let currentLanguage: string = 'en';
        try {
          const storedLanguage = localStorage.getItem('language-storage');
          if (storedLanguage) {
            const parsed = JSON.parse(storedLanguage);
            currentLanguage = parsed?.state?.language || 'en';
          }
        } catch (e) {
          // Use default
        }

        // Convert language code to ID (1=en, 2=de, 3=hu)
        const languageMap: Record<string, number> = { en: 1, de: 2, hu: 3 };
        const languageId = languageMap[currentLanguage] || 1;

        // Add language_id to request body
        if (config.data && typeof config.data === 'object') {
          config.data.language_id = languageId;
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Unwrap response data and handle errors
 */
usersClient.interceptors.response.use(
  (response) => {
    // Unwrap the data property (axios wraps response in { data, status, headers, ... })
    return response.data;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Don't redirect if already on login page
        if (!currentPath.includes('/login')) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }
    }

    // No response received (network error)
    if (error.request && !error.response) {
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      });
    }

    // Return standardized error format
    const errorResponse = {
      success: false,
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message || error.message || 'An error occurred',
        details: error.response?.data?.error?.details || error.response?.data,
      },
    };

    return Promise.reject(errorResponse);
  }
);

export const userApi = {
  /**
   * Get all users with pagination and filtering
   */
  getAll: async (params?: UserListParams): Promise<UserListResponse> => {
    return usersClient.get(ENDPOINTS.USERS, { params });
  },

  /**
   * Get single user by ID
   */
  getById: async (id: number): Promise<UserResponse> => {
    return usersClient.get(replaceParams(ENDPOINTS.USER_BY_ID, { id }));
  },

  /**
   * Create a new user
   */
  create: async (data: CreateUserRequest): Promise<UserResponse> => {
    return usersClient.post(ENDPOINTS.USERS, data);
  },

  /**
   * Update an existing user
   */
  update: async (id: number, data: UpdateUserRequest): Promise<UserResponse> => {
    return usersClient.put(replaceParams(ENDPOINTS.USER_BY_ID, { id }), data);
  },

  /**
   * Change user password
   */
  changePassword: async (id: number, data: ChangePasswordRequest): Promise<{ success: true }> => {
    return usersClient.post(replaceParams(ENDPOINTS.USER_PASSWORD, { id }), data);
  },

  /**
   * Delete a user
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return usersClient.delete(replaceParams(ENDPOINTS.USER_BY_ID, { id }));
  },
};

