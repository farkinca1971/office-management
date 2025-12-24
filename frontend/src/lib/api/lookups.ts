/**
 * Lookup Data API - Reference data endpoints
 */

import apiClient from './client';
import type { LookupItem, Translation } from '@/types/common';
import type { LookupListResponse } from '@/types/api';

export const lookupApi = {
  // Languages
  getLanguages: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/languages');
  },

  // Object Types
  getObjectTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/object-types');
  },

  // Object Statuses
  getObjectStatuses: async (objectTypeId?: number): Promise<LookupListResponse<LookupItem>> => {
    const params = objectTypeId ? { object_type_id: objectTypeId } : {};
    return apiClient.get('/object-statuses', { params });
  },

  // Sexes
  getSexes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/sexes');
  },

  // Salutations
  getSalutations: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/salutations');
  },

  // Product Categories
  getProductCategories: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/product-categories');
  },

  // Countries
  getCountries: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/countries');
  },

  // Address Types
  getAddressTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/address-types');
  },

  // Address Area Types
  getAddressAreaTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/address-area-types');
  },

  // Contact Types
  getContactTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/contact-types');
  },

  // Transaction Types
  getTransactionTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/transaction-types');
  },

  // Currencies
  getCurrencies: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/currencies');
  },

  // Object Relation Types
  getObjectRelationTypes: async (): Promise<LookupListResponse<LookupItem>> => {
    return apiClient.get('/object-relation-types');
  },

  // Translations
  getTranslations: async (code?: string, languageId?: number): Promise<LookupListResponse<Translation>> => {
    const params: Record<string, any> = {};
    if (code) params.code = code;
    if (languageId) params.language_id = languageId;
    return apiClient.get('/translations', { params });
  },
};

