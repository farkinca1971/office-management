/**
 * Object Audit API - CRUD operations for object audits
 */

import axios, { AxiosInstance } from 'axios';
import { getAuditApiConfig, getWebhookHeaders } from './config';
import type {
  ObjectAudit,
  CreateObjectAuditRequest,
} from '@/types/entities';
import type {
  ObjectAuditListResponse,
  ObjectAuditResponse,
  ObjectAuditListParams,
} from '@/types/api';

// Create a separate axios instance for audit API with different base URL
const auditConfig = getAuditApiConfig();
const auditClient: AxiosInstance = axios.create({
  baseURL: auditConfig.baseURL,
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: auditConfig.timeout,
});

// Add request interceptor for authentication
auditClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to unwrap data
auditClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const errorData = error.response.data;

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
      });
    } else if (error.request) {
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      });
    } else {
      return Promise.reject({
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: error.message || 'An error occurred while making the request',
        },
      });
    }
  }
);

import { ENDPOINTS, replaceParams } from './endpoints';

export const auditApi = {
  /**
   * Get all audit records with pagination and filtering
   */
  getAll: async (params?: ObjectAuditListParams): Promise<ObjectAuditListResponse> => {
    return auditClient.get(ENDPOINTS.OBJECT_AUDITS, { params });
  },

  /**
   * Get single audit record by ID
   */
  getById: async (id: number): Promise<ObjectAuditResponse> => {
    return auditClient.get(replaceParams(ENDPOINTS.OBJECT_AUDIT_BY_ID, { id }));
  },

  /**
   * Get audit records for a specific object
   */
  getByObjectId: async (objectId: number, params?: Omit<ObjectAuditListParams, 'object_id'>): Promise<ObjectAuditListResponse> => {
    return auditClient.get(replaceParams(ENDPOINTS.OBJECT_AUDITS_BY_OBJECT_ID, { id: objectId }), { params });
  },

  /**
   * Create a new audit record
   */
  create: async (data: CreateObjectAuditRequest): Promise<ObjectAuditResponse> => {
    return auditClient.post(ENDPOINTS.OBJECT_AUDITS, data);
  },

  /**
   * Log a file download action
   * Creates an audit record for file download tracking
   *
   * @param objectId - The ID of the object (file) being downloaded
   * @param languageId - The current language ID
   * @param fileInfo - Optional additional file information for the audit record
   */
  logFileDownload: async (
    objectId: number,
    languageId: number,
    fileInfo?: {
      filename?: string;
      file_path?: string;
      mime_type?: string;
      file_size?: number;
    }
  ): Promise<ObjectAuditResponse> => {
    const auditData: CreateObjectAuditRequest = {
      object_id: objectId,
      audit_action_id: 0, // Will be resolved by backend using action code
      new_values: {
        action: 'FILE_DOWNLOAD',
        language_id: languageId,
        ...fileInfo,
        downloaded_at: new Date().toISOString(),
      },
      notes: `File downloaded: ${fileInfo?.filename || 'unknown'}`,
    };

    // Pass the action code in the request for backend resolution
    return auditClient.post(ENDPOINTS.OBJECT_AUDITS, {
      ...auditData,
      action_code: 'DOWNLOAD_FILE',
      language_id: languageId,
    });
  },
};

