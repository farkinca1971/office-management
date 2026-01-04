/**
 * Files API - CRUD operations for files
 *
 * IMPORTANT: This API uses a separate n8n webhook endpoint dedicated to files
 * Base URL: https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
 *
 * Critical constraint: Files must have at least one parent document at all times.
 * Deleting a file is only allowed if it has more than one parent document.
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import type {
  FileEntity,
  CreateFileRequest,
  UpdateFileRequest,
  FileVersion,
  Document,
} from '@/types/entities';
import type { ApiResponse, ApiErrorResponse } from '@/types/common';

export type FileListParams = {
  mime_type?: string;
  storage_type?: string;
  is_active?: number; // 0 = false, 1 = true
};

export type FileListResponse = ApiResponse<FileEntity[]>;
export type FileResponse = ApiResponse<FileEntity>;
export type FileVersionListResponse = ApiResponse<FileVersion[]>;
export type FileVersionResponse = ApiResponse<FileVersion>;

/**
 * Dedicated Axios client for Files API
 * Uses a separate webhook endpoint from the main API
 */
const filesClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
filesClient.interceptors.request.use(
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
filesClient.interceptors.response.use(
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

export const filesApi = {
  /**
   * Get all files with optional filtering
   */
  getAll: async (params?: FileListParams): Promise<FileListResponse> => {
    return filesClient.get('/files', {
      params: params || {},
      headers: {},
    });
  },

  /**
   * Get single file by ID
   */
  getById: async (id: number): Promise<FileResponse> => {
    return filesClient.get(`/files/${id}`, { headers: {} });
  },

  /**
   * Create a new file
   * Note: parent_document_id is required - files must have at least one parent document
   */
  create: async (data: CreateFileRequest): Promise<FileResponse> => {
    return filesClient.post('/files', data);
  },

  /**
   * Update an existing file
   * IMPORTANT: Uses POST instead of PUT because PUT method is not working on n8n webhook
   */
  update: async (id: number, data: UpdateFileRequest): Promise<FileResponse> => {
    return filesClient.post(`/files/${id}`, data);
  },

  /**
   * Soft delete a file
   * Note: This will fail if the file has only one parent document.
   * Files must maintain at least one parent document relationship.
   */
  delete: async (id: number): Promise<ApiResponse<{ success: boolean }>> => {
    return filesClient.delete(`/files/${id}`);
  },

  /**
   * Get all parent documents for a file
   */
  getDocuments: async (fileId: number): Promise<ApiResponse<Document[]>> => {
    return filesClient.get(`/files/${fileId}/documents`, { headers: {} });
  },

  /**
   * Get the count of parent documents for a file
   * Useful for checking if file can be deleted or unlinked
   */
  getDocumentCount: async (fileId: number): Promise<ApiResponse<{ count: number }>> => {
    return filesClient.get(`/files/${fileId}/documents/count`, { headers: {} });
  },

  /**
   * Get version history for a file
   */
  getVersions: async (fileId: number): Promise<FileVersionListResponse> => {
    return filesClient.get(`/files/${fileId}/versions`, { headers: {} });
  },

  /**
   * Create a version snapshot of the current file state
   */
  createVersion: async (fileId: number, changeReason?: string): Promise<FileVersionResponse> => {
    return filesClient.post(`/files/${fileId}/versions`, { change_reason: changeReason });
  },

  /**
   * Get all unattached files (files that are not linked to any document)
   * These are physical files stored in n8n that can be linked to new documents
   */
  getUnattachedFiles: async (): Promise<ApiResponse<FileEntity[]>> => {
    return filesClient.get('/files/unattached', { headers: {} });
  },

  /**
   * Upload a physical file to n8n
   * Returns the file metadata after successful upload
   * @param file - The file to upload
   * @param documentId - The document ID to link the file to
   */
  uploadPhysicalFile: async (file: File, documentId: number): Promise<FileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_id', documentId.toString());

    return filesClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
