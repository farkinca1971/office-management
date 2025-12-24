/**
 * Lookup Store - Zustand store for reference/lookup data
 */

import { create } from 'zustand';
import type { LookupItem } from '@/types/common';
import { lookupApi } from '@/lib/api';

interface LookupState {
  // Lookup data
  objectTypes: LookupItem[];
  objectStatuses: LookupItem[];
  sexes: LookupItem[];
  salutations: LookupItem[];
  countries: LookupItem[];
  addressTypes: LookupItem[];
  addressAreaTypes: LookupItem[];
  contactTypes: LookupItem[];
  transactionTypes: LookupItem[];
  currencies: LookupItem[];
  objectRelationTypes: LookupItem[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadAll: () => Promise<void>;
  loadObjectTypes: () => Promise<void>;
  loadObjectStatuses: (objectTypeId?: number) => Promise<void>;
  loadSexes: () => Promise<void>;
  loadSalutations: () => Promise<void>;
  loadCountries: () => Promise<void>;
  loadAddressTypes: () => Promise<void>;
  loadAddressAreaTypes: () => Promise<void>;
  loadContactTypes: () => Promise<void>;
  loadTransactionTypes: () => Promise<void>;
  loadCurrencies: () => Promise<void>;
  loadObjectRelationTypes: () => Promise<void>;
  
  // Getters
  getObjectTypeByCode: (code: string) => LookupItem | undefined;
  getObjectStatusByCode: (code: string) => LookupItem | undefined;
  getCountryById: (id: number) => LookupItem | undefined;
  getCurrencyById: (id: number) => LookupItem | undefined;
}

export const useLookupStore = create<LookupState>((set, get) => ({
  objectTypes: [],
  objectStatuses: [],
  sexes: [],
  salutations: [],
  countries: [],
  addressTypes: [],
  addressAreaTypes: [],
  contactTypes: [],
  transactionTypes: [],
  currencies: [],
  objectRelationTypes: [],
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().loadObjectTypes(),
        get().loadSexes(),
        get().loadSalutations(),
        get().loadCountries(),
        get().loadAddressTypes(),
        get().loadAddressAreaTypes(),
        get().loadContactTypes(),
        get().loadTransactionTypes(),
        get().loadCurrencies(),
        get().loadObjectRelationTypes(),
      ]);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error?.error?.message || 'Failed to load lookup data',
      });
    }
  },

  loadObjectTypes: async () => {
    try {
      const response = await lookupApi.getObjectTypes();
      if (response.success) {
        set({ objectTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load object types:', error);
    }
  },

  loadObjectStatuses: async (objectTypeId?: number) => {
    try {
      const response = await lookupApi.getObjectStatuses(objectTypeId);
      if (response.success) {
        set({ objectStatuses: response.data });
      }
    } catch (error) {
      console.error('Failed to load object statuses:', error);
    }
  },

  loadSexes: async () => {
    try {
      const response = await lookupApi.getSexes();
      if (response.success) {
        set({ sexes: response.data });
      }
    } catch (error) {
      console.error('Failed to load sexes:', error);
    }
  },

  loadSalutations: async () => {
    try {
      const response = await lookupApi.getSalutations();
      if (response.success) {
        set({ salutations: response.data });
      }
    } catch (error) {
      console.error('Failed to load salutations:', error);
    }
  },

  loadCountries: async () => {
    try {
      const response = await lookupApi.getCountries();
      if (response.success) {
        set({ countries: response.data });
      }
    } catch (error) {
      console.error('Failed to load countries:', error);
    }
  },

  loadAddressTypes: async () => {
    try {
      const response = await lookupApi.getAddressTypes();
      if (response.success) {
        set({ addressTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load address types:', error);
    }
  },

  loadAddressAreaTypes: async () => {
    try {
      const response = await lookupApi.getAddressAreaTypes();
      if (response.success) {
        set({ addressAreaTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load address area types:', error);
    }
  },

  loadContactTypes: async () => {
    try {
      const response = await lookupApi.getContactTypes();
      if (response.success) {
        set({ contactTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load contact types:', error);
    }
  },

  loadTransactionTypes: async () => {
    try {
      const response = await lookupApi.getTransactionTypes();
      if (response.success) {
        set({ transactionTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load transaction types:', error);
    }
  },

  loadCurrencies: async () => {
    try {
      const response = await lookupApi.getCurrencies();
      if (response.success) {
        set({ currencies: response.data });
      }
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  },

  loadObjectRelationTypes: async () => {
    try {
      const response = await lookupApi.getObjectRelationTypes();
      if (response.success) {
        set({ objectRelationTypes: response.data });
      }
    } catch (error) {
      console.error('Failed to load object relation types:', error);
    }
  },

  getObjectTypeByCode: (code: string) => {
    return get().objectTypes.find((item) => item.code === code);
  },

  getObjectStatusByCode: (code: string) => {
    return get().objectStatuses.find((item) => item.code === code);
  },

  getCountryById: (id: number) => {
    return get().countries.find((item) => item.id === id);
  },

  getCurrencyById: (id: number) => {
    return get().currencies.find((item) => item.id === id);
  },
}));

