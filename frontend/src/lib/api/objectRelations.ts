/**
 * Object Relations API - CRUD operations for object relationships
 *
 * IMPORTANT: This API uses a dedicated Axios client with language ID support.
 * The language_id is passed in:
 * - X-Language-ID header for GET/DELETE requests
 * - Request body for POST/PUT/PATCH requests
 */

import axios, { AxiosInstance } from 'axios';
import { ENDPOINTS, replaceParams } from './endpoints';
import { getWebhookHeaders } from './config';
import { getLanguageId } from '@/lib/utils';
import type {
  ObjectRelation,
  CreateObjectRelationRequest,
  UpdateObjectRelationRequest,
  Document,
  OrphanedRelation,
  DuplicateRelationGroup,
  InvalidRelation,
  MissingMirrorRelation,
  ObjectSearchRequest,
  ObjectSearchResult,
} from '@/types/entities';
import type { ApiListResponse, ApiResponse, SearchParams } from '@/types/common';

export interface ObjectRelationListParams extends SearchParams {
  object_from_id?: number;
  object_to_id?: number;
  object_relation_type_id?: number;
  is_active?: boolean;
}

/**
 * Helper function to get current language ID from localStorage
 */
const getCurrentLanguageId = (): number => {
  if (typeof window === 'undefined') return 1; // Default to English on server

  try {
    const storedLanguage = localStorage.getItem('language-storage');
    if (storedLanguage) {
      const languageData = JSON.parse(storedLanguage);
      const languageCode = languageData.state?.language || 'en';
      return getLanguageId(languageCode);
    }
  } catch (error) {
    console.error('Error reading language from localStorage:', error);
  }
  return 1; // Default to English
};

/**
 * Dedicated Axios client for Object Relations API
 * Automatically adds language_id to all requests
 */
const objectRelationsClient: AxiosInstance = axios.create({
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
objectRelationsClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Add JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get current language ID
      const currentLanguageId = getCurrentLanguageId();

      // Add language_id based on request method
      if (config.method && ['post', 'put', 'patch'].includes(config.method.toLowerCase())) {
        // For POST/PUT/PATCH: Add to request body
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

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
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
objectRelationsClient.interceptors.response.use(
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

/**
 * Dedicated Axios client for Object Relations endpoint that returns documents
 * Uses webhook: b0fc82f1-0fd7-4068-83a2-6051579b85c1
 */
const objectRelationsDocumentsClient: AxiosInstance = axios.create({
  baseURL: 'https://n8n.wolfitlab.duckdns.org/webhook/b0fc82f1-0fd7-4068-83a2-6051579b85c1/api/v1',
  headers: {
    ...getWebhookHeaders(),
  },
  timeout: 30000,
});

/**
 * Request Interceptor: Add authentication token and language_id
 */
objectRelationsDocumentsClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Add JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Get current language ID and add to header
      const currentLanguageId = getCurrentLanguageId();
      if (config.headers) {
        config.headers['X-Language-ID'] = currentLanguageId.toString();
      }
    }

    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {} as any;
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
objectRelationsDocumentsClient.interceptors.response.use(
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

export const objectRelationApi = {
  /**
   * Get all object relations with pagination and filtering
   * Language ID is automatically added via X-Language-ID header
   */
  getAll: async (params?: ObjectRelationListParams): Promise<ApiListResponse<ObjectRelation>> => {
    return objectRelationsClient.get(ENDPOINTS.OBJECT_RELATIONS, { params });
  },

  /**
   * Get relations for a specific object (from or to)
   * Language ID is automatically added via X-Language-ID header
   */
  getByObjectId: async (objectId: number, params?: ObjectRelationListParams): Promise<ApiListResponse<ObjectRelation>> => {
    return objectRelationsClient.get(replaceParams(ENDPOINTS.OBJECT_RELATIONS_BY_OBJECT_ID, { id: objectId }), { params });
  },

  /**
   * Get single object relation by ID
   * Language ID is automatically added via X-Language-ID header
   */
  getById: async (id: number): Promise<ApiResponse<ObjectRelation>> => {
    return objectRelationsClient.get(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }));
  },

  /**
   * Create a new object relation
   * Language ID is automatically added to request body
   */
  create: async (data: CreateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return objectRelationsClient.post(ENDPOINTS.OBJECT_RELATIONS, data);
  },

  /**
   * Update an existing object relation
   * Language ID is automatically added to request body
   */
  update: async (id: number, data: UpdateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return objectRelationsClient.put(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }), data);
  },

  /**
   * Delete (soft delete) an object relation
   * Language ID is automatically added via X-Language-ID header
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return objectRelationsClient.delete(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }));
  },

  /**
   * Update an existing object relation (note field only)
   * Uses POST method as per project requirements
   * Language ID is automatically added to request body
   */
  updateNote: async (id: number, noteOld: string, noteNew: string): Promise<ApiResponse<ObjectRelation>> => {
    return objectRelationsClient.post(replaceParams(ENDPOINTS.OBJECT_RELATION_UPDATE, { id }), {
      note_old: noteOld,
      note_new: noteNew,
    });
  },

  /**
   * Delete (soft delete) an object relation
   * Uses POST method as per project requirements
   * Language ID is automatically added to request body
   */
  deleteRelation: async (id: number): Promise<{ success: true }> => {
    return objectRelationsClient.post(replaceParams(ENDPOINTS.OBJECT_RELATION_DELETE, { id }), {
      id,
    });
  },

  /**
   * Bulk delete multiple relations
   * Language ID is automatically added to request body
   */
  bulkDelete: async (relationIds: number[]): Promise<{ success: true; deleted_count: number }> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_BULK_DELETE, {
      relation_ids: relationIds,
    });
  },

  /**
   * Bulk reassign target object for multiple relations
   * Language ID is automatically added to request body
   */
  bulkReassign: async (
    relationIds: number[],
    oldObjectToId: number,
    newObjectToId: number
  ): Promise<{ success: true; updated_count: number }> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_BULK_REASSIGN, {
      relation_ids: relationIds,
      old_object_to_id: oldObjectToId,
      new_object_to_id: newObjectToId,
    });
  },

  /**
   * Bulk update relation type for multiple relations
   * Language ID is automatically added to request body
   */
  bulkUpdateType: async (
    relationIds: number[],
    oldRelationTypeId: number,
    newRelationTypeId: number
  ): Promise<{ success: true; updated_count: number }> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_BULK_UPDATE_TYPE, {
      relation_ids: relationIds,
      old_relation_type_id: oldRelationTypeId,
      new_relation_type_id: newRelationTypeId,
    });
  },

  /**
   * Get orphaned relations (pointing to inactive objects)
   * Language ID is automatically added to request body
   */
  getOrphanedRelations: async (): Promise<ApiListResponse<OrphanedRelation>> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_ORPHANED, {});
  },

  /**
   * Get duplicate relations
   * Language ID is automatically added to request body
   */
  getDuplicateRelations: async (): Promise<ApiListResponse<DuplicateRelationGroup>> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_DUPLICATES, {});
  },

  /**
   * Get invalid relations (violating type constraints)
   * Language ID is automatically added to request body
   */
  getInvalidRelations: async (): Promise<ApiListResponse<InvalidRelation>> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_INVALID, {});
  },

  /**
   * Get relations missing their mirror counterparts
   * Language ID is automatically added to request body
   */
  getMissingMirrors: async (): Promise<ApiListResponse<MissingMirrorRelation>> => {
    return objectRelationsClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_MISSING_MIRRORS, {});
  },

  /**
   * Universal object search with filtering
   * Language ID is automatically added to request body
   */
  searchObjects: async (searchRequest: ObjectSearchRequest): Promise<ApiListResponse<ObjectSearchResult>> => {
    return objectRelationsClient.post(ENDPOINTS.OBJECTS_SEARCH, searchRequest);
  },

  /**
   * Get documents for an object using the relations endpoint
   * This endpoint returns documents data directly from object relations
   * 
   * @param objectId - The object ID (person or company ID)
   * @param objectRelationTypeId - The object relation type ID (e.g., person_doc or company_doc)
   * @param languageId - The language ID (optional, will be derived from language store if not provided)
   * @returns Documents data array
   * 
   * Query parameters sent:
   * - object_from_id: The object ID
   * - object_relation_type_id: The relation type ID
   * - language_id: The language ID
   */
  getDocumentsByObjectId: async (
    objectId: number,
    objectRelationTypeId: number,
    languageId?: number
  ): Promise<ApiListResponse<Document>> => {
    // Get language_id from language store if not provided
    let currentLanguageId = languageId;
    if (!currentLanguageId && typeof window !== 'undefined') {
      try {
        const storedLanguage = localStorage.getItem('language-storage');
        if (storedLanguage) {
          const languageData = JSON.parse(storedLanguage);
          const languageCode = languageData.state?.language || 'en';
          currentLanguageId = getLanguageId(languageCode);
        } else {
          currentLanguageId = 1; // Default to English
        }
      } catch (error) {
        console.error('Error reading language from localStorage:', error);
        currentLanguageId = 1; // Default to English
      }
    }

    // Build the endpoint path with the object ID
    // Use relative path since baseURL is already set in the axios client
    const endpointPath = `/objects/${objectId}/relations`;

    // Validate required parameters
    if (!objectId || !objectRelationTypeId) {
      throw new Error('objectId and objectRelationTypeId are required');
    }

    // Prepare query parameters - these will be sent in the URL query string
    // Required params: object_from_id, object_relation_type_id, language_id
    const queryParams = {
      'object_from_id': objectId,
      'object_relation_type_id': objectRelationTypeId,
      'language_id': currentLanguageId,
    };

    // Make the request with query parameters
    return objectRelationsDocumentsClient.get(endpointPath, {
      params: queryParams,
    });
  },
};

