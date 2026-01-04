/**
 * Documents API - CRUD operations for documents
 *
 * IMPORTANT: This API uses a separate n8n webhook endpoint dedicated to documents
 * Base URL: https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  FileEntity,
  ObjectRelation,
} from '@/types/entities';
import type { ApiResponse, ApiErrorResponse } from '@/types/common';

export type DocumentListParams = {
  document_type_id?: number;
  object_status_id?: number;
  is_active?: number; // 0 = false, 1 = true
  date_from?: string;
  date_to?: string;
};

export type DocumentListResponse = ApiResponse<Document[]>;
export type DocumentResponse = ApiResponse<Document>;

/**
 * Dedicated Axios client for Documents API
 * Uses a separate webhook endpoint from the main API
 */
const documentsClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
documentsClient.interceptors.request.use(
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
      // For GET/DELETE: Add to custom header
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
documentsClient.interceptors.response.use(
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

export const documentsApi = {
  /**
   * Get all documents with optional filtering
   */
  getAll: async (params?: DocumentListParams): Promise<DocumentListResponse> => {
    return documentsClient.get('/documents', {
      params: params || {},
      headers: {},
    });
  },

  /**
   * Get single document by ID
   */
  getById: async (id: number): Promise<DocumentResponse> => {
    return documentsClient.get(`/documents/${id}`, { headers: {} });
  },

  /**
   * Create a new document
   */
  create: async (data: CreateDocumentRequest): Promise<DocumentResponse> => {
    return documentsClient.post('/documents', data);
  },

  /**
   * Update an existing document
   * IMPORTANT: Uses POST instead of PUT because PUT method is not working on n8n webhook
   */
  update: async (id: number, data: UpdateDocumentRequest): Promise<DocumentResponse> => {
    return documentsClient.post(`/documents/${id}`, data);
  },

  /**
   * Soft delete a document
   */
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.delete(`/documents/${id}`);
  },

  /**
   * Get all files linked to a document
   */
  getFiles: async (documentId: number): Promise<ApiResponse<FileEntity[]>> => {
    return documentsClient.get(`/documents/${documentId}/files`, { headers: {} });
  },

  /**
   * Link an existing file to a document
   */
  linkFile: async (documentId: number, fileId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.post(`/documents/${documentId}/files`, { file_id: fileId });
  },

  /**
   * Unlink a file from a document
   * Note: This will fail if the file has no other parent documents
   */
  unlinkFile: async (documentId: number, fileId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.delete(`/documents/${documentId}/files/${fileId}`);
  },

  /**
   * Get all objects related to a document
   */
  getRelations: async (documentId: number): Promise<ApiResponse<ObjectRelation[]>> => {
    return documentsClient.get(`/documents/${documentId}/relations`, { headers: {} });
  },

  /**
   * Add a relation between document and another object
   */
  addRelation: async (
    documentId: number,
    objectId: number,
    relationTypeId: number,
    note?: string
  ): Promise<ApiResponse<ObjectRelation>> => {
    return documentsClient.post(`/documents/${documentId}/relations`, {
      object_to_id: objectId,
      object_relation_type_id: relationTypeId,
      note,
    });
  },

  /**
   * Remove a relation
   */
  removeRelation: async (documentId: number, relationId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.delete(`/documents/${documentId}/relations/${relationId}`);
  },
};
