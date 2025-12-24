/**
 * Object Relations API - CRUD operations for object relationships
 */

import apiClient from './client';
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
    return apiClient.get('/object-relations', { params });
  },

  /**
   * Get relations for a specific object (from or to)
   */
  getByObjectId: async (objectId: number, params?: ObjectRelationListParams): Promise<ApiListResponse<ObjectRelation>> => {
    return apiClient.get(`/objects/${objectId}/relations`, { params });
  },

  /**
   * Get single object relation by ID
   */
  getById: async (id: number): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.get(`/object-relations/${id}`);
  },

  /**
   * Create a new object relation
   */
  create: async (data: CreateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.post('/object-relations', data);
  },

  /**
   * Update an existing object relation
   */
  update: async (id: number, data: UpdateObjectRelationRequest): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.put(`/object-relations/${id}`, data);
  },

  /**
   * Delete (soft delete) an object relation
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/object-relations/${id}`);
  },
};

