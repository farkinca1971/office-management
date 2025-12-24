/**
 * n8n Webhook Utilities
 * 
 * Helper functions for working with n8n webhook responses and formatting
 */

import { ApiResponse, ApiListResponse } from '@/types/common';

/**
 * n8n Webhook Response Format
 * 
 * n8n webhooks typically return data in this format:
 * {
 *   "success": true,
 *   "data": { ... } or [ ... ],
 *   "pagination": { ... } (optional)
 * }
 */
export interface N8nWebhookResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Transform n8n webhook response to standard API response format
 */
export function transformWebhookResponse<T>(
  response: N8nWebhookResponse<T>
): ApiResponse<T> | ApiListResponse<T> {
  if (!response.success) {
    throw new Error(response.error?.message || 'Webhook request failed');
  }

  // Check if data is an array (list response)
  if (Array.isArray(response.data)) {
    return {
      success: true,
      data: response.data,
      pagination: response.pagination || {
        page: 1,
        per_page: response.data.length,
        total: response.data.length,
        total_pages: 1,
      },
    } as ApiListResponse<T>;
  }

  // Single item response
  return {
    success: true,
    data: response.data as T,
  } as ApiResponse<T>;
}

/**
 * Format request payload for n8n webhook
 * 
 * n8n webhooks expect data in the request body
 */
export function formatWebhookPayload<T>(data: T): Record<string, any> {
  return {
    ...data,
    // Add any n8n-specific formatting here
    timestamp: new Date().toISOString(),
  };
}

/**
 * Build query string for GET requests to n8n webhooks
 * 
 * Note: n8n webhooks typically use POST, but some workflows
 * may accept GET with query parameters
 */
export function buildWebhookQuery(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
}

/**
 * Validate n8n webhook response structure
 */
export function validateWebhookResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    typeof response.success === 'boolean'
  );
}

/**
 * Extract error message from n8n webhook response
 */
export function extractWebhookError(response: any): string {
  if (response?.error?.message) {
    return response.error.message;
  }
  if (response?.error?.code) {
    return `Error: ${response.error.code}`;
  }
  return 'Unknown error occurred';
}

