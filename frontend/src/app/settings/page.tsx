'use client';

/**
 * Settings Page
 *
 * User preferences management interface
 * Organized by categories and groups
 */

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useLanguageStore } from '@/store/languageStore';
import { getLanguageId } from '@/lib/utils';
import MainLayout from '@/components/layout/MainLayout';
import PreferenceCategoryPanel from '@/components/preferences/PreferenceCategoryPanel';
import PreferenceEditor from '@/components/preferences/PreferenceEditor';
import type { PreferenceCategory, PreferenceDefinition } from '@/types/entities';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const {
    preferences,
    definitions,
    isLoading,
    error,
    loadPreferences,
    loadDefinitions,
  } = usePreferencesStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('ui');
  const [categories, setCategories] = useState<PreferenceCategory[]>([]);

  // Load preferences and definitions on mount
  useEffect(() => {
    if (user?.id) {
      const languageId = getLanguageId(language);
      loadPreferences(user.id, languageId);
      loadDefinitions(languageId);
    }
  }, [user?.id, language]);

  // Group definitions by category
  const definitionsByCategory = definitions.reduce((acc, def) => {
    const categoryId = def.category_id.toString();
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(def);
    return acc;
  }, {} as Record<string, PreferenceDefinition[]>);

  // Extract unique categories from definitions
  useEffect(() => {
    const uniqueCategories = Array.from(
      new Set(definitions.map(d => d.category?.code).filter(Boolean))
    ).map(code => {
      const def = definitions.find(d => d.category?.code === code);
      return def?.category;
    }).filter(Boolean) as PreferenceCategory[];

    setCategories(uniqueCategories);

    // Set initial category if not set
    if (!selectedCategory && uniqueCategories.length > 0) {
      setSelectedCategory(uniqueCategories[0].code);
    }
  }, [definitions]);

  // Get definitions for selected category
  const selectedDefinitions = definitions.filter(
    def => def.category?.code === selectedCategory && def.is_user_editable
  );

  // Group definitions by group_name
  const groupedDefinitions = selectedDefinitions.reduce((acc, def) => {
    const group = def.group_name || 'general';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(def);
    return acc;
  }, {} as Record<string, PreferenceDefinition[]>);

  // Sort groups by the minimum sort_order within each group
  const sortedGroups = Object.entries(groupedDefinitions).sort(([, defsA], [, defsB]) => {
    const minSortA = Math.min(...defsA.map(d => d.sort_order));
    const minSortB = Math.min(...defsB.map(d => d.sort_order));
    return minSortA - minSortB;
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="p-6">
          <p className="text-red-600">Please log in to access settings.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your preferences and application settings
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Settings Content */}
        {!isLoading && (
          <div className="grid grid-cols-12 gap-6">
            {/* Category Sidebar */}
            <div className="col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                  Categories
                </h2>
                <nav className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.code}
                      onClick={() => setSelectedCategory(category.code)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCategory === category.code
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.description || category.code}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Preference Panels */}
            <div className="col-span-9">
              <div className="space-y-6">
                {sortedGroups.map(([groupName, groupDefinitions]) => (
                  <div
                    key={groupName}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                      {groupName.replace(/_/g, ' ')}
                    </h2>
                    <div className="space-y-4">
                      {groupDefinitions
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((definition) => (
                          <PreferenceEditor
                            key={definition.key_name}
                            definition={definition}
                            value={preferences[definition.key_name]}
                          />
                        ))}
                    </div>
                  </div>
                ))}

                {sortedGroups.length === 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      No preferences available in this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
