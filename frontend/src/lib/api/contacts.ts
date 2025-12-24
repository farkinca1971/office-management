/**
 * Contact API - CRUD operations for object contacts
 */

import apiClient from './client';
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

export const contactApi = {
  /**
   * Get all contacts for an object
   */
  getByObjectId: async (objectId: number, params?: ContactListParams): Promise<ContactListResponse> => {
    return apiClient.get(`/objects/${objectId}/contacts`, { params });
  },

  /**
   * Get single contact by ID
   */
  getById: async (id: number): Promise<ContactResponse> => {
    return apiClient.get(`/contacts/${id}`);
  },

  /**
   * Add contact to an object
   */
  create: async (objectId: number, data: CreateContactRequest): Promise<ContactResponse> => {
    return apiClient.post(`/objects/${objectId}/contacts`, data);
  },

  /**
   * Update an existing contact
   */
  update: async (id: number, data: UpdateContactRequest): Promise<ContactResponse> => {
    return apiClient.put(`/contacts/${id}`, data);
  },

  /**
   * Delete (soft delete) a contact
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/contacts/${id}`);
  },
};

