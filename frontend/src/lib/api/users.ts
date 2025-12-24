/**
 * User API - CRUD operations for users
 */

import apiClient from './client';
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '@/types/entities';
import type {
  UserListResponse,
  UserResponse,
  UserListParams,
} from '@/types/api';

export const userApi = {
  /**
   * Get all users with pagination and filtering
   */
  getAll: async (params?: UserListParams): Promise<UserListResponse> => {
    return apiClient.get('/users', { params });
  },

  /**
   * Get single user by ID
   */
  getById: async (id: number): Promise<UserResponse> => {
    return apiClient.get(`/users/${id}`);
  },

  /**
   * Create a new user
   */
  create: async (data: CreateUserRequest): Promise<UserResponse> => {
    return apiClient.post('/users', data);
  },

  /**
   * Update an existing user
   */
  update: async (id: number, data: UpdateUserRequest): Promise<UserResponse> => {
    return apiClient.put(`/users/${id}`, data);
  },

  /**
   * Change user password
   */
  changePassword: async (id: number, data: ChangePasswordRequest): Promise<{ success: true }> => {
    return apiClient.post(`/users/${id}/password`, data);
  },

  /**
   * Delete a user
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/users/${id}`);
  },
};

