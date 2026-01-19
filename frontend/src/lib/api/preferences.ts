/**
 * Preferences API - User preferences and settings
 *
 * This module handles all API calls related to user preferences system:
 * - Preference categories
 * - Preference definitions
 * - User-specific preference values
 * - Extended JSON preferences
 * - Preference audits
 */

import { apiClient } from './client';
import type {
  PreferenceCategory,
  PreferenceDefinition,
  UserPreference,
  UserPreferencesExtended,
  PreferenceAudit,
  CreateUserPreferenceRequest,
  UpdateUserPreferenceRequest,
  BulkUpdatePreferencesRequest,
  CreatePreferenceCategoryRequest,
  UpdatePreferenceCategoryRequest,
  CreatePreferenceDefinitionRequest,
  UpdatePreferenceDefinitionRequest,
} from '@/types/entities';
import type {
  ApiResponse,
  ApiListResponse,
  SearchParams,
} from '@/types/api';

// ============================================
// PREFERENCE CATEGORIES
// ============================================

/**
 * Get all preference categories
 * @param params - Query parameters (language_id, is_active, etc.)
 */
export const getPreferenceCategories = async (
  params?: SearchParams & { language_id?: number }
): Promise<ApiListResponse<PreferenceCategory>> => {
  return apiClient.get('/preferences/categories', { params });
};

/**
 * Get a single preference category by ID
 * @param id - Category ID
 * @param languageId - Language ID for translated description
 */
export const getPreferenceCategory = async (
  id: number,
  languageId?: number
): Promise<ApiResponse<PreferenceCategory>> => {
  const params = languageId ? { language_id: languageId } : undefined;
  return apiClient.get(`/preferences/categories/${id}`, { params });
};

/**
 * Create a new preference category
 * @param data - Category data with description_code
 */
export const createPreferenceCategory = async (
  data: CreatePreferenceCategoryRequest
): Promise<ApiResponse<PreferenceCategory>> => {
  return apiClient.post('/preferences/categories', data);
};

/**
 * Update an existing preference category
 * @param id - Category ID
 * @param data - Updated category data
 */
export const updatePreferenceCategory = async (
  id: number,
  data: UpdatePreferenceCategoryRequest
): Promise<ApiResponse<PreferenceCategory>> => {
  return apiClient.put(`/preferences/categories/${id}`, data);
};

/**
 * Delete (soft delete) a preference category
 * @param id - Category ID
 */
export const deletePreferenceCategory = async (
  id: number
): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/preferences/categories/${id}`);
};

// ============================================
// PREFERENCE DEFINITIONS
// ============================================

/**
 * Get all preference definitions
 * @param params - Query parameters (category_id, scope, language_id, etc.)
 */
export const getPreferenceDefinitions = async (
  params?: SearchParams & {
    category_id?: number;
    scope?: 'user' | 'system' | 'both';
    group_name?: string;
    is_user_editable?: boolean;
    language_id?: number;
  }
): Promise<ApiListResponse<PreferenceDefinition>> => {
  return apiClient.get('/preferences/definitions', { params });
};

/**
 * Get a single preference definition by ID
 * @param id - Definition ID
 * @param languageId - Language ID for translated names
 */
export const getPreferenceDefinition = async (
  id: number,
  languageId?: number
): Promise<ApiResponse<PreferenceDefinition>> => {
  const params = languageId ? { language_id: languageId } : undefined;
  return apiClient.get(`/preferences/definitions/${id}`, { params });
};

/**
 * Get a preference definition by key_name
 * @param keyName - Unique key name (e.g., 'ui.theme')
 * @param languageId - Language ID for translated names
 */
export const getPreferenceDefinitionByKey = async (
  keyName: string,
  languageId?: number
): Promise<ApiResponse<PreferenceDefinition>> => {
  const params = languageId ? { language_id: languageId } : undefined;
  return apiClient.get(`/preferences/definitions/by-key/${keyName}`, { params });
};

/**
 * Create a new preference definition
 * @param data - Definition data with translation codes
 */
export const createPreferenceDefinition = async (
  data: CreatePreferenceDefinitionRequest
): Promise<ApiResponse<PreferenceDefinition>> => {
  return apiClient.post('/preferences/definitions', data);
};

/**
 * Update an existing preference definition
 * @param id - Definition ID
 * @param data - Updated definition data
 */
export const updatePreferenceDefinition = async (
  id: number,
  data: UpdatePreferenceDefinitionRequest
): Promise<ApiResponse<PreferenceDefinition>> => {
  return apiClient.put(`/preferences/definitions/${id}`, data);
};

/**
 * Delete (soft delete) a preference definition
 * @param id - Definition ID
 */
export const deletePreferenceDefinition = async (
  id: number
): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/preferences/definitions/${id}`);
};

// ============================================
// USER PREFERENCES
// ============================================

/**
 * Get all preferences for a user
 * Returns preferences with their definitions and translated values
 * @param userId - User ID (object_id)
 * @param params - Query parameters (language_id, etc.)
 */
export const getUserPreferences = async (
  userId: number,
  params?: { language_id?: number }
): Promise<ApiListResponse<UserPreference>> => {
  return apiClient.get(`/users/${userId}/preferences`, { params });
};

/**
 * Get current user's preferences
 * Shortcut for getting authenticated user's preferences
 * @param params - Query parameters (language_id, etc.)
 */
export const getMyPreferences = async (
  params?: { language_id?: number }
): Promise<ApiListResponse<UserPreference>> => {
  return apiClient.get('/users/me/preferences', { params });
};

/**
 * Get a specific preference value for a user by key name
 * @param userId - User ID
 * @param keyName - Preference key (e.g., 'ui.theme')
 * @param languageId - Language ID for translations
 */
export const getUserPreferenceByKey = async (
  userId: number,
  keyName: string,
  languageId?: number
): Promise<ApiResponse<UserPreference>> => {
  const params = languageId ? { language_id: languageId } : undefined;
  return apiClient.get(`/users/${userId}/preferences/${keyName}`, { params });
};

/**
 * Create a new user preference
 * @param userId - User ID
 * @param data - Preference data (definition_id + value)
 */
export const createUserPreference = async (
  userId: number,
  data: CreateUserPreferenceRequest
): Promise<ApiResponse<UserPreference>> => {
  return apiClient.post(`/users/${userId}/preferences`, data);
};

/**
 * Update a user preference by key name
 * @param userId - User ID
 * @param keyName - Preference key (e.g., 'ui.theme')
 * @param data - Updated value
 */
export const updateUserPreference = async (
  userId: number,
  keyName: string,
  data: UpdateUserPreferenceRequest
): Promise<ApiResponse<UserPreference>> => {
  return apiClient.put(`/users/${userId}/preferences/${keyName}`, data);
};

/**
 * Bulk update multiple user preferences at once
 * @param userId - User ID
 * @param data - Array of key-value pairs to update
 */
export const bulkUpdateUserPreferences = async (
  userId: number,
  data: BulkUpdatePreferencesRequest
): Promise<ApiResponse<UserPreference[]>> => {
  return apiClient.post(`/users/${userId}/preferences/bulk`, data);
};

/**
 * Reset a user preference to its default value
 * @param userId - User ID
 * @param keyName - Preference key to reset
 */
export const resetUserPreference = async (
  userId: number,
  keyName: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/users/${userId}/preferences/${keyName}`);
};

/**
 * Reset all user preferences to default values
 * @param userId - User ID
 */
export const resetAllUserPreferences = async (
  userId: number
): Promise<ApiResponse<void>> => {
  return apiClient.post(`/users/${userId}/preferences/reset-all`, {});
};

// ============================================
// USER PREFERENCES EXTENDED (JSON)
// ============================================

/**
 * Get extended JSON preferences for a namespace
 * @param userId - User ID
 * @param namespace - Namespace (e.g., 'ui', 'api')
 */
export const getUserPreferencesExtended = async (
  userId: number,
  namespace: string
): Promise<ApiResponse<UserPreferencesExtended>> => {
  return apiClient.get(`/users/${userId}/preferences/extended/${namespace}`);
};

/**
 * Update extended JSON preferences for a namespace
 * @param userId - User ID
 * @param namespace - Namespace (e.g., 'ui', 'api')
 * @param preferences - JSON object with preference key-value pairs
 */
export const updateUserPreferencesExtended = async (
  userId: number,
  namespace: string,
  preferences: Record<string, any>
): Promise<ApiResponse<UserPreferencesExtended>> => {
  return apiClient.put(`/users/${userId}/preferences/extended/${namespace}`, {
    preferences,
  });
};

/**
 * Delete extended JSON preferences for a namespace
 * @param userId - User ID
 * @param namespace - Namespace to delete
 */
export const deleteUserPreferencesExtended = async (
  userId: number,
  namespace: string
): Promise<ApiResponse<void>> => {
  return apiClient.delete(`/users/${userId}/preferences/extended/${namespace}`);
};

// ============================================
// PREFERENCE AUDITS
// ============================================

/**
 * Get preference change audit trail for a user
 * @param userId - User ID
 * @param params - Query parameters (language_id, date range, etc.)
 */
export const getUserPreferenceAudits = async (
  userId: number,
  params?: SearchParams & {
    preference_definition_id?: number;
    date_from?: string;
    date_to?: string;
    language_id?: number;
  }
): Promise<ApiListResponse<PreferenceAudit>> => {
  return apiClient.get(`/users/${userId}/preferences/audits`, { params });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse preference value based on data type
 * Converts string representation to actual typed value
 */
export const parsePreferenceValue = (
  value: string,
  dataType: PreferenceDefinition['data_type']
): any => {
  switch (dataType) {
    case 'boolean':
      return value === 'true' || value === '1';
    case 'number':
      return parseFloat(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case 'date':
    case 'datetime':
    case 'string':
    default:
      return value;
  }
};

/**
 * Serialize preference value for API submission
 * Converts typed value to string representation
 */
export const serializePreferenceValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
};

// Export all functions as a namespace for convenience
export const preferencesApi = {
  // Categories
  getPreferenceCategories,
  getPreferenceCategory,
  createPreferenceCategory,
  updatePreferenceCategory,
  deletePreferenceCategory,

  // Definitions
  getPreferenceDefinitions,
  getPreferenceDefinition,
  getPreferenceDefinitionByKey,
  createPreferenceDefinition,
  updatePreferenceDefinition,
  deletePreferenceDefinition,

  // User Preferences
  getUserPreferences,
  getMyPreferences,
  getUserPreferenceByKey,
  createUserPreference,
  updateUserPreference,
  bulkUpdateUserPreferences,
  resetUserPreference,
  resetAllUserPreferences,

  // Extended JSON
  getUserPreferencesExtended,
  updateUserPreferencesExtended,
  deleteUserPreferencesExtended,

  // Audits
  getUserPreferenceAudits,

  // Helpers
  parsePreferenceValue,
  serializePreferenceValue,
};
