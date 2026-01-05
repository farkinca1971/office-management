/**
 * Person API - CRUD operations for persons
 */

import apiClient from './client';
import { ENDPOINTS, replaceParams } from './endpoints';
import type {
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
} from '@/types/entities';
import type {
  PersonListResponse,
  PersonResponse,
  PersonListParams,
} from '@/types/api';

export const personApi = {
  /**
   * Get all persons with pagination and filtering
   */
  getAll: async (params?: PersonListParams): Promise<PersonListResponse> => {
    return apiClient.get(ENDPOINTS.PERSONS, { params });
  },

  /**
   * Get single person by ID
   */
  getById: async (id: number): Promise<PersonResponse> => {
    return apiClient.get(replaceParams(ENDPOINTS.PERSON_BY_ID, { id }));
  },

  /**
   * Create a new person
   */
  create: async (data: CreatePersonRequest): Promise<PersonResponse> => {
    return apiClient.post(ENDPOINTS.PERSONS, data);
  },

  /**
   * Update an existing person
   */
  update: async (id: number, data: UpdatePersonRequest): Promise<PersonResponse> => {
    return apiClient.put(replaceParams(ENDPOINTS.PERSON_BY_ID, { id }), data);
  },

  /**
   * Delete a person
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(replaceParams(ENDPOINTS.PERSON_BY_ID, { id }));
  },
};

