/**
 * Contact API - CRUD operations for object contacts
 *
 * IMPORTANT: This API uses a separate n8n webhook endpoint dedicated to contacts
 * Base URL: https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1
 */

import axios, { AxiosInstance } from 'axios';
import { getWebhookHeaders } from './config';
import type {
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
} from '@/types/entities';
import type {
  ContactListResponse,
  ContactResponse,
  ContactListParams,
} from '@/types/api';

/**
 * Dedicated Axios client for Contacts API
 * Uses a separate webhook endpoint from the main API
 */
const contactsClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
contactsClient.interceptors.request.use(
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
contactsClient.interceptors.response.use(
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

export const contactApi = {
  /**
   * Get all contacts for an object
   * Endpoint: GET /objects/:object_id/contacts
   */
  getByObjectId: async (objectId: number, params?: ContactListParams): Promise<ContactListResponse> => {
    return contactsClient.get(`/objects/${objectId}/contacts`, { params });
  },

  /**
   * Get single contact by ID
   * Endpoint: GET /contacts/:id
   */
  getById: async (id: number): Promise<ContactResponse> => {
    return contactsClient.get(`/contacts/${id}`);
  },

  /**
   * Add contact to an object
   * Endpoint: POST /objects/:object_id/contacts
   */
  create: async (objectId: number, data: CreateContactRequest): Promise<ContactResponse> => {
    return contactsClient.post(`/objects/${objectId}/contacts`, data);
  },

  /**
   * Update an existing contact
   * Endpoint: PUT /contacts/:id
   */
  update: async (id: number, data: UpdateContactRequest): Promise<ContactResponse> => {
    return contactsClient.put(`/contacts/${id}`, data);
  },

  /**
   * Delete (soft delete) a contact
   * Endpoint: DELETE /contacts/:id
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return contactsClient.delete(`/contacts/${id}`);
  },
};

