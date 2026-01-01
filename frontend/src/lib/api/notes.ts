/**
 * Notes API - CRUD operations for object notes
 *
 * IMPORTANT: This API uses a separate n8n webhook endpoint dedicated to notes
 * Base URL: https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import type {
  ObjectNote,
  CreateObjectNoteRequest,
  UpdateObjectNoteRequest,
} from '@/types/entities';
import type { ApiResponse, ApiErrorResponse } from '@/types/common';

export type ObjectNoteListParams = {
  is_active?: boolean;
  is_pinned?: boolean;
  language_id?: number;
};

export type ObjectNoteListResponse = ApiResponse<ObjectNote[]>;
export type ObjectNoteResponse = ApiResponse<ObjectNote>;

/**
 * Dedicated Axios client for Notes API
 * Uses a separate webhook endpoint from the main API
 */
const notesClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
notesClient.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get current language ID
      let currentLanguageId: number = 1; // Default to English
      try {
        const storedLanguage = localStorage.getItem('language-storage');
        if (storedLanguage) {
          const languageData = JSON.parse(storedLanguage);
          // Convert language code to ID (en=1, de=2, hu=3)
          const languageMap: Record<string, number> = { en: 1, de: 2, hu: 3 };
          currentLanguageId = languageMap[languageData.state?.language || 'en'] || 1;
        }
      } catch (error) {
        console.error('Error reading language from localStorage:', error);
      }

      // Add language_id to ALL request methods
      // For POST/PUT/PATCH: Add to request body
      // For GET/DELETE: Add to request body (using custom header)
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        // Add language_id to request body if not already present
        if (!config.data) {
          config.data = {};
        }
        if (!config.data.language_id) {
          config.data.language_id = currentLanguageId;
        }
      } else {
        // For GET/DELETE: Send language_id in a custom header
        // n8n can read this from headers instead of query params
        if (config.headers) {
          config.headers['X-Language-ID'] = currentLanguageId.toString();
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
 * Response Interceptor: Unwrap data and handle errors
 */
notesClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const errorData = error.response.data;

      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/login', '/signup'];

          if (!publicPaths.includes(currentPath)) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        }
      }

      return Promise.reject({
        success: false,
        error: {
          code: errorData?.error?.code || 'UNKNOWN_ERROR',
          message: errorData?.error?.message || error.message || 'An error occurred',
          details: errorData?.error?.details,
        },
      } as ApiErrorResponse);
    } else if (error.request) {
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      } as ApiErrorResponse);
    } else {
      return Promise.reject({
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error.message || 'An error occurred while making the request',
        },
      } as ApiErrorResponse);
    }
  }
);

export const notesApi = {
  /**
   * Get all notes for a specific object
   */
  getByObjectId: async (objectId: number, params?: ObjectNoteListParams): Promise<any> => {
    console.log('[notesApi] getByObjectId called:', { objectId, params });
    // Explicitly set empty object for params to ensure axios config is created
    const result = await notesClient.get(`/objects/${objectId}/notes`, {
      params: params || {},
      // Ensure headers object exists for interceptor
      headers: {}
    });
    console.log('[notesApi] getByObjectId result:', result);
    return result;
  },

  /**
   * Get single note by ID
   */
  getById: async (id: number, language_id?: number): Promise<ObjectNoteResponse> => {
    return notesClient.get(`/notes/${id}`, { params: { language_id } });
  },

  /**
   * Create a new note for an object
   */
  create: async (objectId: number, data: CreateObjectNoteRequest): Promise<ObjectNoteResponse> => {
    return notesClient.post(`/objects/${objectId}/notes`, data);
  },

  /**
   * Update an existing note
   */
  update: async (id: number, data: UpdateObjectNoteRequest): Promise<ObjectNoteResponse> => {
    return notesClient.put(`/notes/${id}`, data);
  },

  /**
   * Toggle note pin status
   */
  togglePin: async (id: number, is_pinned: boolean): Promise<ObjectNoteResponse> => {
    return notesClient.patch(`/notes/${id}/pin`, { is_pinned });
  },

  /**
   * Soft delete a note
   */
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return notesClient.delete(`/notes/${id}`);
  },
};
