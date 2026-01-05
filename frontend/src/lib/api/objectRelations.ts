/**
 * Object Relations API - CRUD operations for object relationships
 */

import apiClient from './client';
import { ENDPOINTS, replaceParams } from './endpoints';
import type {
  ObjectRelation,
  CreateObjectRelationRequest,
  UpdateObjectRelationRequest,
} from '@/types/entities';
import type { ApiListResponse, ApiResponse, SearchParams } from '@/types/common';

export interface ObjectRelationListParams extends SearchParams {
  object_from_id?: number;
  object_to_id?: number;
  object_relation_type_id?: number;
  is_active?: boolean;
}

export const objectRelationApi = {
  /**
   * Get all object relations with pagination and filtering
   */
  getAll: async (params?: ObjectRelationListParams): Promise<ApiListResponse<ObjectRelation>> => {
    return apiClient.get(ENDPOINTS.OBJECT_RELATIONS, { params });
  },

  /**
   * Get relations for a specific object (from or to)
   */
  getByObjectId: async (objectId: number, params?: ObjectRelationListParams): Promise<ApiListResponse<ObjectRelation>> => {
    return apiClient.get(replaceParams(ENDPOINTS.OBJECT_RELATIONS_BY_OBJECT_ID, { id: objectId }), { params });
  },

  /**
   * Get single object relation by ID
   */
  getById: async (id: number): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.get(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }));
  },

  /**
   * Create a new object relation
   */
  create: async (data: CreateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.post(ENDPOINTS.OBJECT_RELATIONS, data);
  },

  /**
   * Update an existing object relation
   */
  update: async (id: number, data: UpdateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.put(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }), data);
  },

  /**
   * Delete (soft delete) an object relation
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(replaceParams(ENDPOINTS.OBJECT_RELATION_BY_ID, { id }));
  },
};

