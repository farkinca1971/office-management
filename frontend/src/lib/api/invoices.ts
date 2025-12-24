/**
 * Invoice API - CRUD operations for invoices
 */

import apiClient from './client';
import type {
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/types/entities';
import type {
  InvoiceListResponse,
  InvoiceResponse,
  InvoiceListParams,
} from '@/types/api';

export const invoiceApi = {
  /**
   * Get all invoices with pagination and filtering
   */
  getAll: async (params?: InvoiceListParams): Promise<InvoiceListResponse> => {
    return apiClient.get('/invoices', { params });
  },

  /**
   * Get single invoice by ID
   */
  getById: async (id: number): Promise<InvoiceResponse> => {
    return apiClient.get(`/invoices/${id}`);
  },

  /**
   * Create a new invoice
   */
  create: async (data: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    return apiClient.post('/invoices', data);
  },

  /**
   * Update an existing invoice
   */
  update: async (id: number, data: UpdateInvoiceRequest): Promise<InvoiceResponse> => {
    return apiClient.put(`/invoices/${id}`, data);
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: number, paymentDate?: string): Promise<InvoiceResponse> => {
    return apiClient.post(`/invoices/${id}/pay`, { payment_date: paymentDate });
  },

  /**
   * Void an invoice
   */
  void: async (id: number): Promise<InvoiceResponse> => {
    return apiClient.post(`/invoices/${id}/void`);
  },

  /**
   * Delete an invoice
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(`/invoices/${id}`);
  },
};

