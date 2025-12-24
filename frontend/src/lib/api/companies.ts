/**
 * Company API - CRUD operations for companies
 */

import apiClient from './client';
import type {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@/types/entities';
import type {
  CompanyListResponse,
  CompanyResponse,
  CompanyListParams,
} from '@/types/api';

export const companyApi = {
  /**
   * Get all companies with pagination and filtering
   */
  getAll: async (params?: CompanyListParams): Promise<CompanyListResponse> => {
    return apiClient.get('/companies', { params });
  },

  /**
   * Get single company by ID
   */
  getById: async (id: number): Promise<CompanyResponse> => {
    return apiClient.get(`/companies/${id}`);
  },

  /**
   * Create a new company
   */
  create: async (data: CreateCompanyRequest): Promise<CompanyResponse> => {
    return apiClient.post('/companies', data);
  },

  /**
   * Update an existing company
   */
  update: async (id: number, data: UpdateCompanyRequest): Promise<CompanyResponse> => {
    return apiClient.put(`/companies/${id}`, data);
  },

  /**
   * Delete a company
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/companies/${id}`);
  },
};

