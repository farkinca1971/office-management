/**
 * API Client - Centralized HTTP client with interceptors
 * Configured for n8n webhook integration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '@/types/common';
import { getApiConfig, getWebhookHeaders } from './config';

// Get API configuration
const config = getApiConfig();

/**
 * Create axios instance with default configuration for n8n webhooks
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: config.baseURL,
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: config.timeout,
});

/**
 * Request Interceptor: Add authentication token to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or your preferred storage)
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

/**
 * Response Interceptor: Handle errors and transform responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly (axios wraps it in data property)
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      
      // Handle 401 Unauthorized - only redirect if we're not already on login/signup page
      if (error.response.status === 401) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/login', '/signup'];
          
          // Only redirect if not already on a public path
          if (!publicPaths.includes(currentPath)) {
            localStorage.removeItem('auth_token');
            // Use router if available, otherwise use window.location
            window.location.href = '/login';
          }
        }
      }

      // Return standardized error format
      return Promise.reject({
        success: false,
        error: {
          code: errorData?.error?.code || 'UNKNOWN_ERROR',
          message: errorData?.error?.message || error.message || 'An error occurred',
          details: errorData?.error?.details,
        },
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
        },
      });
    } else {
      // Something else happened
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

export default apiClient;

