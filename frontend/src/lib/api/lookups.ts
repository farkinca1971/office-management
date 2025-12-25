/**
 * Lookup Data API - Reference data endpoints
 */

import apiClient from './client';
import type { LookupItem, Translation } from '@/types/common';
import type { LookupListResponse, ApiResponse } from '@/types/api';

export interface CreateLookupRequest {
  code: string;
  is_active?: boolean;
}

export interface UpdateLookupRequest {
  code?: string;
  is_active?: boolean;
}

export const lookupApi = {
  // Languages
  getLanguages: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/languages');
  },
  getLanguage: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/languages/${id}`);
  },
  createLanguage: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/languages', data);
  },
  updateLanguage: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/languages/${id}`, data);
  },
  deleteLanguage: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/languages/${id}`);
  },

  // Object Types
  getObjectTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/object-types');
  },
  getObjectType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/object-types/${id}`);
  },
  createObjectType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/object-types', data);
  },
  updateObjectType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/object-types/${id}`, data);
  },
  deleteObjectType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/object-types/${id}`);
  },

  // Object Statuses
  getObjectStatuses: async (objectTypeId?: number): Promise<LookupListResponse<LookupItem>> => {
    const params = objectTypeId ? { object_type_id: objectTypeId } : {};
    return apiClient.get('/object-statuses', { params });
  },
  getObjectStatus: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/object-statuses/${id}`);
  },
  createObjectStatus: async (data: CreateLookupRequest & { object_type_id?: number }): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/object-statuses', data);
  },
  updateObjectStatus: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/object-statuses/${id}`, data);
  },
  deleteObjectStatus: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/object-statuses/${id}`);
  },

  // Sexes
  getSexes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/sexes');
  },
  getSex: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/sexes/${id}`);
  },
  createSex: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/sexes', data);
  },
  updateSex: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/sexes/${id}`, data);
  },
  deleteSex: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/sexes/${id}`);
  },

  // Salutations
  getSalutations: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/salutations');
  },
  getSalutation: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/salutations/${id}`);
  },
  createSalutation: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/salutations', data);
  },
  updateSalutation: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/salutations/${id}`, data);
  },
  deleteSalutation: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/salutations/${id}`);
  },

  // Product Categories
  getProductCategories: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/product-categories');
  },
  getProductCategory: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/product-categories/${id}`);
  },
  createProductCategory: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/product-categories', data);
  },
  updateProductCategory: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/product-categories/${id}`, data);
  },
  deleteProductCategory: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/product-categories/${id}`);
  },

  // Countries
  getCountries: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/countries');
  },
  getCountry: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/countries/${id}`);
  },
  createCountry: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/countries', data);
  },
  updateCountry: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/countries/${id}`, data);
  },
  deleteCountry: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/countries/${id}`);
  },

  // Address Types
  getAddressTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/address-types');
  },
  getAddressType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/address-types/${id}`);
  },
  createAddressType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/address-types', data);
  },
  updateAddressType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/address-types/${id}`, data);
  },
  deleteAddressType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/address-types/${id}`);
  },

  // Address Area Types
  getAddressAreaTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/address-area-types');
  },
  getAddressAreaType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/address-area-types/${id}`);
  },
  createAddressAreaType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/address-area-types', data);
  },
  updateAddressAreaType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/address-area-types/${id}`, data);
  },
  deleteAddressAreaType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/address-area-types/${id}`);
  },

  // Contact Types
  getContactTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/contact-types');
  },
  getContactType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/contact-types/${id}`);
  },
  createContactType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/contact-types', data);
  },
  updateContactType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/contact-types/${id}`, data);
  },
  deleteContactType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/contact-types/${id}`);
  },

  // Transaction Types
  getTransactionTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/transaction-types');
  },
  getTransactionType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/transaction-types/${id}`);
  },
  createTransactionType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/transaction-types', data);
  },
  updateTransactionType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/transaction-types/${id}`, data);
  },
  deleteTransactionType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/transaction-types/${id}`);
  },

  // Currencies
  getCurrencies: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/currencies');
  },
  getCurrency: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/currencies/${id}`);
  },
  createCurrency: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/currencies', data);
  },
  updateCurrency: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/currencies/${id}`, data);
  },
  deleteCurrency: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/currencies/${id}`);
  },

  // Object Relation Types
  getObjectRelationTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/object-relation-types');
  },
  getObjectRelationType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(`/object-relation-types/${id}`);
  },
  createObjectRelationType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post('/object-relation-types', data);
  },
  updateObjectRelationType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(`/object-relation-types/${id}`, data);
  },
  deleteObjectRelationType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/object-relation-types/${id}`);
  },

  // Translations
  getTranslations: async (code?: string, languageId?: number): Promise<LookupListResponse<Translation>> => {
    const params: Record<string, any> = {};
    if (code) params.code = code;
    if (languageId) params.language_id = languageId;
    return apiClient.get('/translations', { params });
  },
  getTranslation: async (code: string, languageId: number): Promise<ApiResponse<Translation>> => {
    return apiClient.get(`/translations/${code}/${languageId}`);
  },
  createTranslation: async (data: { code: string; language_id: number; text: string }): Promise<ApiResponse<Translation>> => {
    return apiClient.post('/translations', data);
  },
  updateTranslation: async (code: string, languageId: number, data: { text: string }): Promise<ApiResponse<Translation>> => {
    return apiClient.put(`/translations/${code}/${languageId}`, data);
  },
  deleteTranslation: async (code: string, languageId: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`/translations/${code}/${languageId}`);
  },
};

