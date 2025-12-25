/**
 * Employee API - CRUD operations for employees
 */

import apiClient from './client';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@/types/entities';
import type {
  EmployeeListResponse,
  EmployeeResponse,
  EmployeeListParams,
} from '@/types/api';

export const employeeApi = {
  /**
   * Get all employees with pagination and filtering
   */
  getAll: async (params?: EmployeeListParams): Promise<EmployeeListResponse> => {
    return apiClient.get('/employees', { params });
  },

  /**
   * Get single employee by ID
   */
  getById: async (id: number): Promise<EmployeeResponse> => {
    return apiClient.get(`/employees/${id}`);
  },

  /**
   * Create a new employee
   */
  create: async (data: CreateEmployeeRequest): Promise<EmployeeResponse> => {
    return apiClient.post('/employees', data);
  },

  /**
   * Update an existing employee
   */
  update: async (id: number, data: UpdateEmployeeRequest): Promise<EmployeeResponse> => {
    return apiClient.put(`/employees/${id}`, data);
  },

  /**
   * Delete an employee
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/employees/${id}`);
  },
};

