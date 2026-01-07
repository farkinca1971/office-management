/**
 * Documents API - CRUD operations for documents
 *
 * IMPORTANT: This API uses a separate n8n webhook endpoint dedicated to documents
 * Base URL: https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import { ENDPOINTS, replaceParams } from './endpoints';
import { getLanguageId } from '@/lib/utils';
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
  language_code?: string; // Language code for translations (e.g., 'en', 'de', 'hu')
  language_id?: number; // Alternative: Language ID for translations
};

export type DocumentListResponse = ApiResponse<Document[]>;
export type DocumentResponse = ApiResponse<Document>;

/**
 * Dedicated Axios client for Documents API
 * Uses a separate webhook endpoint from the main API
 */
const documentsClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token, language_code, and language_id
 */
documentsClient.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get current language code from localStorage
      let currentLanguageCode: string = 'en'; // Default to English
      try {
        const storedLanguage = localStorage.getItem('language-storage');
        if (storedLanguage) {
          const languageData = JSON.parse(storedLanguage);
          currentLanguageCode = languageData.state?.language || 'en';
        }
      } catch (error) {
        console.error('Error reading language from localStorage:', error);
      }

      // Convert language code to language_id (en=1, de=2, hu=3)
      const currentLanguageId = getLanguageId(currentLanguageCode);

      // Add X-Language-ID header to ALL requests
      if (config.headers) {
        config.headers['X-Language-ID'] = currentLanguageId.toString();
      }

      // Add language_code and language_id to ALL request methods
      // For POST/PUT/PATCH: Add to request body
      // For GET/DELETE: Add to query params
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        // Add language_code and language_id to request body if not already present
        if (!config.data) {
          config.data = {};
        }
        if (!config.data.language_code && !config.data.language_id) {
          config.data.language_code = currentLanguageCode;
        }
        if (!config.data.language_id) {
          config.data.language_id = currentLanguageId;
        }
      } else {
        // For GET/DELETE: Add language_code and language_id to query params
        if (!config.params) {
          config.params = {};
        }
        // Only add if not already set (allow explicit override)
        if (!config.params.language_code && !config.params.language_id) {
          config.params.language_code = currentLanguageCode;
        }
        if (!config.params.language_id) {
          config.params.language_id = currentLanguageId;
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
   * Language code is automatically added from user preferences via interceptor
   */
  getAll: async (params?: DocumentListParams): Promise<DocumentListResponse> => {
    return documentsClient.get(ENDPOINTS.DOCUMENTS, {
      params: params || {},
    });
  },

  /**
   * Get single document by ID
   * Language code is automatically added from user preferences via interceptor
   */
  getById: async (id: number, params?: { language_code?: string; language_id?: number }): Promise<DocumentResponse> => {
    return documentsClient.get(replaceParams(ENDPOINTS.DOCUMENT_BY_ID, { id }), {
      params: params || {},
    });
  },

  /**
   * Create a new document
   */
  create: async (data: CreateDocumentRequest): Promise<DocumentResponse> => {
    return documentsClient.post(ENDPOINTS.DOCUMENTS, data);
  },

  /**
   * Update an existing document
   * IMPORTANT: Uses POST instead of PUT because PUT method is not working on n8n webhook
   */
  update: async (id: number, data: UpdateDocumentRequest): Promise<DocumentResponse> => {
    return documentsClient.post(replaceParams(ENDPOINTS.DOCUMENT_BY_ID, { id }), data);
  },

  /**
   * Soft delete a document
   * Uses POST method to the dedicated delete endpoint
   */
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.post(replaceParams(ENDPOINTS.DOCUMENT_DELETE, { id }));
  },

  /**
   * Get all files linked to a document
   */
  getFiles: async (documentId: number): Promise<ApiResponse<FileEntity[]>> => {
    return documentsClient.get(replaceParams(ENDPOINTS.DOCUMENT_FILES, { id: documentId }));
  },

  /**
   * Link an existing file to a document
   */
  linkFile: async (documentId: number, fileId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.post(replaceParams(ENDPOINTS.DOCUMENT_FILES, { id: documentId }), { file_id: fileId });
  },

  /**
   * Unlink a file from a document
   * Note: This will fail if the file has no other parent documents
   */
  unlinkFile: async (documentId: number, fileId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.delete(replaceParams(ENDPOINTS.DOCUMENT_FILE_BY_ID, { id: documentId, file_id: fileId }));
  },

  /**
   * Get all objects related to a document
   */
  getRelations: async (documentId: number): Promise<ApiResponse<ObjectRelation[]>> => {
    return documentsClient.get(replaceParams(ENDPOINTS.DOCUMENT_RELATIONS, { id: documentId }));
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
    return documentsClient.post(replaceParams(ENDPOINTS.DOCUMENT_RELATIONS, { id: documentId }), {
      object_to_id: objectId,
      object_relation_type_id: relationTypeId,
      note,
    });
  },

  /**
   * Remove a relation
   */
  removeRelation: async (documentId: number, relationId: number): Promise<ApiResponse<{ success: boolean }>> => {
    return documentsClient.delete(replaceParams(ENDPOINTS.DOCUMENT_RELATION_BY_ID, { id: documentId, relation_id: relationId }));
  },
};
