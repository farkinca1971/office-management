/**
 * Company API - CRUD operations for companies
 */

import apiClient from './client';
import { ENDPOINTS, replaceParams } from './endpoints';
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
    return apiClient.get(ENDPOINTS.COMPANIES, { params });
  },

  /**
   * Get single company by ID
   */
  getById: async (id: number): Promise<CompanyResponse> => {
    return apiClient.get(replaceParams(ENDPOINTS.COMPANY_BY_ID, { id }));
  },

  /**
   * Create a new company
   */
  create: async (data: CreateCompanyRequest): Promise<CompanyResponse> => {
    return apiClient.post(ENDPOINTS.COMPANIES, data);
  },

  /**
   * Update an existing company
   */
  update: async (id: number, data: UpdateCompanyRequest): Promise<CompanyResponse> => {
    return apiClient.put(replaceParams(ENDPOINTS.COMPANY_BY_ID, { id }), data);
  },

  /**
   * Delete a company
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(replaceParams(ENDPOINTS.COMPANY_BY_ID, { id }));
  },
};

