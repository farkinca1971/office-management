/**
 * Lookup Data API - Reference data endpoints
 * Uses unified endpoint: /api/v1/lookups/:lookup_type
 */

import apiClient from './client';
import type { LookupItem, Translation } from '@/types/common';
import type { LookupListResponse, ApiResponse } from '@/types/api';

export interface CreateLookupRequest {
  code: string;
  is_active?: boolean;
  text?: string;
  language_id?: number;
  object_type_id?: number;
  parent_object_type_id?: number;
  child_object_type_id?: number;
}

export interface UpdateLookupRequest {
  code?: string;
  is_active?: boolean;
  text?: string;
  language_id?: number;
  object_type_id?: number;
  parent_object_type_id?: number;
  child_object_type_id?: number;
  update_all_languages?: number; // 0 or 1 (always included)
  // Old and new values for all editable columns (always included)
  old_code?: string;
  new_code?: string;
  old_is_active?: boolean;
  new_is_active?: boolean;
  old_object_type_id?: number;
  new_object_type_id?: number;
  old_parent_object_type_id?: number;
  new_parent_object_type_id?: number;
  old_child_object_type_id?: number;
  new_child_object_type_id?: number;
  old_text?: string;
  new_text?: string;
}

// Helper function to build lookup endpoint paths
const lookupPath = (lookupType: string, id?: number): string => {
  const base = `/lookups/${lookupType}`;
  return id ? `${base}/${id}` : base;
};

export const lookupApi = {
  // Languages
  getLanguages: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('languages'), { params });
  },
  getLanguage: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('languages', id));
  },
  createLanguage: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('languages'), data);
  },
  updateLanguage: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('languages', id), data);
  },
  deleteLanguage: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('languages', id));
  },

  // Object Types
  getObjectTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('object-types'), { params });
  },
  getObjectType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('object-types', id));
  },
  createObjectType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('object-types'), data);
  },
  updateObjectType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('object-types', id), data);
  },
  deleteObjectType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('object-types', id));
  },

  // Object Statuses
  getObjectStatuses: async (objectTypeId?: number, languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params: Record<string, any> = {};
    if (objectTypeId) params.object_type_id = objectTypeId;
    if (languageCode) params.language_code = languageCode;
    return apiClient.get(lookupPath('object-statuses'), { params });
  },
  getObjectStatus: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('object-statuses', id));
  },
  createObjectStatus: async (data: CreateLookupRequest & { object_type_id?: number }): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('object-statuses'), data);
  },
  updateObjectStatus: async (id: number, data: UpdateLookupRequest & { object_type_id?: number }): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('object-statuses', id), data);
  },
  deleteObjectStatus: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('object-statuses', id));
  },

  // Sexes
  getSexes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('sexes'), { params });
  },
  getSex: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('sexes', id));
  },
  createSex: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('sexes'), data);
  },
  updateSex: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('sexes', id), data);
  },
  deleteSex: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('sexes', id));
  },

  // Salutations
  getSalutations: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('salutations'), { params });
  },
  getSalutation: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('salutations', id));
  },
  createSalutation: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('salutations'), data);
  },
  updateSalutation: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('salutations', id), data);
  },
  deleteSalutation: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('salutations', id));
  },

  // Product Categories
  getProductCategories: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('product-categories'), { params });
  },
  getProductCategory: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('product-categories', id));
  },
  createProductCategory: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('product-categories'), data);
  },
  updateProductCategory: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('product-categories', id), data);
  },
  deleteProductCategory: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('product-categories', id));
  },

  // Countries
  getCountries: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('countries'), { params });
  },
  getCountry: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('countries', id));
  },
  createCountry: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('countries'), data);
  },
  updateCountry: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('countries', id), data);
  },
  deleteCountry: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('countries', id));
  },

  // Address Types
  getAddressTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('address-types'), { params });
  },
  getAddressType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('address-types', id));
  },
  createAddressType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('address-types'), data);
  },
  updateAddressType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('address-types', id), data);
  },
  deleteAddressType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('address-types', id));
  },

  // Address Area Types
  getAddressAreaTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('address-area-types'), { params });
  },
  getAddressAreaType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('address-area-types', id));
  },
  createAddressAreaType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('address-area-types'), data);
  },
  updateAddressAreaType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('address-area-types', id), data);
  },
  deleteAddressAreaType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('address-area-types', id));
  },

  // Contact Types
  getContactTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('contact-types'), { params });
  },
  getContactType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('contact-types', id));
  },
  createContactType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('contact-types'), data);
  },
  updateContactType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('contact-types', id), data);
  },
  deleteContactType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('contact-types', id));
  },

  // Transaction Types
  getTransactionTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('transaction-types'), { params });
  },
  getTransactionType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('transaction-types', id));
  },
  createTransactionType: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('transaction-types'), data);
  },
  updateTransactionType: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('transaction-types', id), data);
  },
  deleteTransactionType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('transaction-types', id));
  },

  // Currencies
  getCurrencies: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('currencies'), { params });
  },
  getCurrency: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('currencies', id));
  },
  createCurrency: async (data: CreateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('currencies'), data);
  },
  updateCurrency: async (id: number, data: UpdateLookupRequest): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('currencies', id), data);
  },
  deleteCurrency: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('currencies', id));
  },

  // Object Relation Types
  getObjectRelationTypes: async (languageCode?: string): Promise<LookupListResponse<LookupItem>> => {
    const params = languageCode ? { language_code: languageCode } : {};
    return apiClient.get(lookupPath('object-relation-types'), { params });
  },
  getObjectRelationType: async (id: number): Promise<ApiResponse<LookupItem>> => {
    return apiClient.get(lookupPath('object-relation-types', id));
  },
  createObjectRelationType: async (data: CreateLookupRequest & { parent_object_type_id?: number; child_object_type_id?: number }): Promise<ApiResponse<LookupItem>> => {
    return apiClient.post(lookupPath('object-relation-types'), data);
  },
  updateObjectRelationType: async (id: number, data: UpdateLookupRequest & { parent_object_type_id?: number; child_object_type_id?: number }): Promise<ApiResponse<LookupItem>> => {
    return apiClient.put(lookupPath('object-relation-types', id), data);
  },
  deleteObjectRelationType: async (id: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(lookupPath('object-relation-types', id));
  },

  // Translations (special case - uses different endpoint structure)
  getTranslations: async (code?: string, languageId?: number): Promise<LookupListResponse<Translation>> => {
    const params: Record<string, any> = {};
    if (code) params.code = code;
    if (languageId) params.language_id = languageId;
    return apiClient.get(lookupPath('translations'), { params });
  },
  getTranslation: async (code: string, languageId: number): Promise<ApiResponse<Translation>> => {
    return apiClient.get(`${lookupPath('translations')}/${code}/${languageId}`);
  },
  createTranslation: async (data: { code: string; language_id: number; text: string }): Promise<ApiResponse<Translation>> => {
    return apiClient.post(lookupPath('translations'), data);
  },
  updateTranslation: async (code: string, languageId: number, data: { text: string }): Promise<ApiResponse<Translation>> => {
    return apiClient.put(`${lookupPath('translations')}/${code}/${languageId}`, data);
  },
  deleteTranslation: async (code: string, languageId: number): Promise<ApiResponse<{ success: true }>> => {
    return apiClient.delete(`${lookupPath('translations')}/${code}/${languageId}`);
  },
};

