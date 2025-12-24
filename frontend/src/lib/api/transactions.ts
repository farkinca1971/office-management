/**
 * Transaction API - CRUD operations for transactions
 */

import apiClient from './client';
import type {
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '@/types/entities';
import type {
  TransactionListResponse,
  TransactionResponse,
  TransactionListParams,
} from '@/types/api';

export const transactionApi = {
  /**
   * Get all transactions with pagination and filtering
   */
  getAll: async (params?: TransactionListParams): Promise<TransactionListResponse> => {
    return apiClient.get('/transactions', { params });
  },

  /**
   * Get single transaction by ID
   */
  getById: async (id: number): Promise<TransactionResponse> => {
    return apiClient.get(`/transactions/${id}`);
  },

  /**
   * Create a new transaction
   */
  create: async (data: CreateTransactionRequest): Promise<TransactionResponse> => {
    return apiClient.post('/transactions', data);
  },

  /**
   * Update an existing transaction
   */
  update: async (id: number, data: UpdateTransactionRequest): Promise<TransactionResponse> => {
    return apiClient.put(`/transactions/${id}`, data);
  },

  /**
   * Delete a transaction
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/transactions/${id}`);
  },
};

