/**
 * Identification API - CRUD operations for object identifications
 */

import apiClient from './client';
import type {
  Identification,
  CreateIdentificationRequest,
  UpdateIdentificationRequest,
} from '@/types/entities';
import type {
  IdentificationListResponse,
  IdentificationResponse,
  IdentificationListParams,
} from '@/types/api';

export const identificationApi = {
  /**
   * Get all identifications for an object
   */
  getByObjectId: async (objectId: number, params?: IdentificationListParams): Promise<IdentificationListResponse> => {
    return apiClient.get(`/objects/${objectId}/identifications`, { params });
  },

  /**
   * Get single identification by ID
   */
  getById: async (id: number): Promise<IdentificationResponse> => {
    return apiClient.get(`/identifications/${id}`);
  },

  /**
   * Add identification to an object
   */
  create: async (objectId: number, data: CreateIdentificationRequest): Promise<IdentificationResponse> => {
    return apiClient.post(`/objects/${objectId}/identifications`, data);
  },

  /**
   * Update an existing identification
   */
  update: async (id: number, data: UpdateIdentificationRequest): Promise<IdentificationResponse> => {
    return apiClient.put(`/identifications/${id}`, data);
  },

  /**
   * Delete (soft delete) an identification
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/identifications/${id}`);
  },
};

