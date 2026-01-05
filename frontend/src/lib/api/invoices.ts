/**
 * Invoice API - CRUD operations for invoices
 */

import apiClient from './client';
import { ENDPOINTS, replaceParams } from './endpoints';
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
    return apiClient.get(ENDPOINTS.INVOICES, { params });
  },

  /**
   * Get single invoice by ID
   */
  getById: async (id: number): Promise<InvoiceResponse> => {
    return apiClient.get(replaceParams(ENDPOINTS.INVOICE_BY_ID, { id }));
  },

  /**
   * Create a new invoice
   */
  create: async (data: CreateInvoiceRequest): Promise<InvoiceResponse> => {
    return apiClient.post(ENDPOINTS.INVOICES, data);
  },

  /**
   * Update an existing invoice
   */
  update: async (id: number, data: UpdateInvoiceRequest): Promise<InvoiceResponse> => {
    return apiClient.put(replaceParams(ENDPOINTS.INVOICE_BY_ID, { id }), data);
  },

  /**
   * Mark invoice as paid
   */
  markAsPaid: async (id: number, paymentDate?: string): Promise<InvoiceResponse> => {
    return apiClient.post(replaceParams(ENDPOINTS.INVOICE_PAY, { id }), { payment_date: paymentDate });
  },

  /**
   * Void an invoice
   */
  void: async (id: number): Promise<InvoiceResponse> => {
    return apiClient.post(replaceParams(ENDPOINTS.INVOICE_VOID, { id }));
  },

  /**
   * Delete an invoice
   */
  delete: async (id: number): Promise<{ success: true }> => {
    return apiClient.delete(replaceParams(ENDPOINTS.INVOICE_BY_ID, { id }));
  },
};

