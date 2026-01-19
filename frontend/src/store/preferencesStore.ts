/**
 * Preferences Store - Zustand store for user preferences
 *
 * This store manages user preferences with the following features:
 * - Local caching of preferences (persisted to localStorage)
 * - Automatic synchronization with API
 * - Type-safe preference access
 * - Default value fallback
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreference, PreferenceDefinition } from '@/types/entities';
import { preferencesApi } from '@/lib/api';
import { useAuthStore } from './authStore';

interface PreferencesState {
  // State
  preferences: Record<string, any>; // Flattened key-value pairs (e.g., { 'ui.theme': 'dark' })
  definitions: PreferenceDefinition[]; // Preference definitions with metadata
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null; // Timestamp of last fetch

  // Actions
  loadPreferences: (userId: number, languageId?: number) => Promise<void>;
  loadDefinitions: (languageId?: number) => Promise<void>;
  getPreference: <T = any>(keyName: string, defaultValue?: T) => T;
  updatePreference: (keyName: string, value: any) => Promise<void>;
  bulkUpdatePreferences: (updates: Record<string, any>) => Promise<void>;
  resetPreference: (keyName: string) => Promise<void>;
  resetAllPreferences: () => Promise<void>;
  clearError: () => void;

  // Internal helpers
  _setPreferences: (preferences: Record<string, any>) => void;
  _setDefinitions: (definitions: PreferenceDefinition[]) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: {},
      definitions: [],
      isLoading: false,
      error: null,
      lastFetched: null,

      /**
       * Load all preferences for a user from the API
       * Automatically parses values based on their data types
       */
      loadPreferences: async (userId: number, languageId?: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await preferencesApi.getUserPreferences(userId, {
            language_id: languageId,
          });

          if (response.success && response.data) {
            // Flatten preferences into key-value pairs
            const flattened = response.data.reduce((acc, pref) => {
              const definition = pref.definition;
              if (definition) {
                // Parse value based on data type
                const parsedValue = preferencesApi.parsePreferenceValue(
                  pref.value,
                  definition.data_type
                );
                acc[definition.key_name] = parsedValue;
              }
              return acc;
            }, {} as Record<string, any>);

            set({
              preferences: flattened,
              isLoading: false,
              lastFetched: Date.now(),
            });
          } else {
            throw new Error('Failed to load preferences');
          }
        } catch (error: any) {
          console.error('Failed to load preferences:', error);
          set({
            isLoading: false,
            error: error?.message || 'Failed to load preferences',
          });
        }
      },

      /**
       * Load preference definitions (metadata) from the API
       * These define what preferences exist and their types
       */
      loadDefinitions: async (languageId?: number) => {
        try {
          const response = await preferencesApi.getPreferenceDefinitions({
            language_id: languageId,
            is_active: true,
          });

          if (response.success && response.data) {
            set({ definitions: response.data });
          }
        } catch (error: any) {
          console.error('Failed to load preference definitions:', error);
          // Don't set error state for definitions, as it's not critical
        }
      },

      /**
       * Get a preference value by key name
       * Returns the cached value or default if not found
       */
      getPreference: <T = any>(keyName: string, defaultValue?: T): T => {
        const prefs = get().preferences;
        const value = prefs[keyName];

        // If value exists in cache, return it
        if (value !== undefined && value !== null) {
          return value as T;
        }

        // If no value in cache, try to get default from definitions
        const definition = get().definitions.find(d => d.key_name === keyName);
        if (definition?.default_value !== undefined) {
          const parsedDefault = preferencesApi.parsePreferenceValue(
            definition.default_value,
            definition.data_type
          );
          return parsedDefault as T;
        }

        // Return provided default or undefined
        return (defaultValue !== undefined ? defaultValue : undefined) as T;
      },

      /**
       * Update a single preference value
       * Automatically serializes value and syncs with API
       */
      updatePreference: async (keyName: string, value: any) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // Optimistic update - update local state immediately
        set(state => ({
          preferences: { ...state.preferences, [keyName]: value }
        }));

        try {
          // Serialize value for API
          const serializedValue = preferencesApi.serializePreferenceValue(value);

          await preferencesApi.updateUserPreference(userId, keyName, {
            value: serializedValue,
          });
        } catch (error: any) {
          console.error('Failed to update preference:', error);

          // Revert optimistic update on error
          // We need to reload to get the correct state
          const { loadPreferences } = get();
          await loadPreferences(userId);

          throw error;
        }
      },

      /**
       * Update multiple preferences at once
       * More efficient than calling updatePreference multiple times
       */
      bulkUpdatePreferences: async (updates: Record<string, any>) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        // Optimistic update
        set(state => ({
          preferences: { ...state.preferences, ...updates }
        }));

        try {
          // Convert updates to API format
          const preferences = Object.entries(updates).map(([key_name, value]) => ({
            key_name,
            value: preferencesApi.serializePreferenceValue(value),
          }));

          await preferencesApi.bulkUpdateUserPreferences(userId, { preferences });
        } catch (error: any) {
          console.error('Failed to bulk update preferences:', error);

          // Revert on error
          const { loadPreferences } = get();
          await loadPreferences(userId);

          throw error;
        }
      },

      /**
       * Reset a single preference to its default value
       */
      resetPreference: async (keyName: string) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          await preferencesApi.resetUserPreference(userId, keyName);

          // Get default value from definition
          const definition = get().definitions.find(d => d.key_name === keyName);
          const defaultValue = definition?.default_value
            ? preferencesApi.parsePreferenceValue(
                definition.default_value,
                definition.data_type
              )
            : undefined;

          // Update local state with default
          set(state => ({
            preferences: { ...state.preferences, [keyName]: defaultValue }
          }));
        } catch (error: any) {
          console.error('Failed to reset preference:', error);
          throw error;
        }
      },

      /**
       * Reset all preferences to their default values
       */
      resetAllPreferences: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          throw new Error('User not authenticated');
        }

        try {
          await preferencesApi.resetAllUserPreferences(userId);

          // Reload preferences from API to get defaults
          await get().loadPreferences(userId);
        } catch (error: any) {
          console.error('Failed to reset all preferences:', error);
          throw error;
        }
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Internal: Set preferences directly (used by persist middleware)
       */
      _setPreferences: (preferences: Record<string, any>) => {
        set({ preferences });
      },

      /**
       * Internal: Set definitions directly
       */
      _setDefinitions: (definitions: PreferenceDefinition[]) => {
        set({ definitions });
      },
    }),
    {
      name: 'preferences-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        definitions: state.definitions,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

/**
 * Hook to get a specific preference value with type safety
 * Usage: const theme = usePreference('ui.theme', 'light');
 */
export const usePreference = <T = any>(
  keyName: string,
  defaultValue?: T
): T => {
  return usePreferencesStore(state => state.getPreference(keyName, defaultValue));
};

/**
 * Hook to update a preference value
 * Returns a stable function that doesn't change between renders
 */
export const useUpdatePreference = () => {
  return usePreferencesStore(state => state.updatePreference);
};

/**
 * Hook to get all preferences for a specific category/group
 * Usage: const uiPrefs = usePreferencesByGroup('appearance');
 */
export const usePreferencesByGroup = (groupName: string): Record<string, any> => {
  return usePreferencesStore(state => {
    const definitions = state.definitions.filter(d => d.group_name === groupName);
    const result: Record<string, any> = {};

    definitions.forEach(def => {
      result[def.key_name] = state.getPreference(def.key_name);
    });

    return result;
  });
};
