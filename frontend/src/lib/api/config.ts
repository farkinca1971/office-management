/**
 * API Configuration - n8n Webhook Integration
 * 
 * This file centralizes API configuration for n8n webhook endpoints.
 * n8n webhooks typically receive POST requests with JSON payloads.
 */

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  apiKey?: string;
}

/**
 * Get API configuration from environment variables
 */
export const getApiConfig = (): ApiConfig => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5678/api/v1';
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
  const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY;

  return {
    baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL,
    timeout,
    apiKey,
  };
};

/**
 * Get Audit API configuration from environment variables
 * Uses a separate webhook endpoint for audit operations
 */
export const getAuditApiConfig = (): ApiConfig => {
  const baseURL = process.env.NEXT_PUBLIC_AUDIT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5678/api/v1';
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
  const apiKey = process.env.NEXT_PUBLIC_N8N_API_KEY;

  return {
    baseURL: baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL,
    timeout,
    apiKey,
  };
};

/**
 * n8n Webhook Endpoint Paths
 * 
 * These paths correspond to n8n webhook nodes configured in your workflow.
 * Each endpoint should be set up as a webhook trigger in n8n.
 */
export const WEBHOOK_ENDPOINTS = {
  // Lookup/Reference Data
  LANGUAGES: '/languages',
  OBJECT_TYPES: '/object-types',
  OBJECT_STATUSES: '/object-statuses',
  SEXES: '/sexes',
  SALUTATIONS: '/salutations',
  PRODUCT_CATEGORIES: '/product-categories',
  COUNTRIES: '/countries',
  ADDRESS_TYPES: '/address-types',
  ADDRESS_AREA_TYPES: '/address-area-types',
  CONTACT_TYPES: '/contact-types',
  TRANSACTION_TYPES: '/transaction-types',
  CURRENCIES: '/currencies',
  OBJECT_RELATION_TYPES: '/object-relation-types',
  TRANSLATIONS: '/translations',
  
  // Entities
  PERSONS: '/persons',
  COMPANIES: '/companies',
  USERS: '/users',
  
  // Related Data
  ADDRESSES: '/addresses',
  CONTACTS: '/contacts',
  IDENTIFICATIONS: '/identifications',
  OBJECT_RELATIONS: '/object-relations',
  
  // Business Data
  INVOICES: '/invoices',
  TRANSACTIONS: '/transactions',
  
  // Audit
  OBJECT_AUDITS: '/object-audits',
  
  // Authentication
  AUTH: '/auth',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
} as const;

/**
 * Build full URL for a webhook endpoint
 */
export const buildWebhookUrl = (endpoint: string): string => {
  const config = getApiConfig();
  const base = config.baseURL.endsWith('/') ? config.baseURL.slice(0, -1) : config.baseURL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

/**
 * Get request headers for n8n webhook calls
 */
export const getWebhookHeaders = (): Record<string, string> => {
  const config = getApiConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add API key if configured
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
    // Alternative: headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
};

