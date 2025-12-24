/**
 * Address API - CRUD operations for object addresses
 */

import apiClient from './client';
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
} from '@/types/entities';
import type {
  AddressListResponse,
  AddressResponse,
  AddressListParams,
} from '@/types/api';

export const addressApi = {
  /**
   * Get all addresses for an object
   */
  getByObjectId: async (objectId: number, params?: AddressListParams): Promise<AddressListResponse> => {
    return apiClient.get(`/objects/${objectId}/addresses`, { params });
  },

  /**
   * Get single address by ID
   */
  getById: async (id: number): Promise<AddressResponse> => {
    return apiClient.get(`/addresses/${id}`);
  },

  /**
   * Add address to an object
   */
  create: async (objectId: number, data: CreateAddressRequest): Promise<AddressResponse> => {
    return apiClient.post(`/objects/${objectId}/addresses`, data);
  },

  /**
   * Update an existing address
   */
  update: async (id: number, data: UpdateAddressRequest): Promise<AddressResponse> => {
    return apiClient.put(`/addresses/${id}`, data);
  },

  /**
   * Delete (soft delete) an address
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/addresses/${id}`);
  },
};

