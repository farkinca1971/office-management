'use client';

/**
 * PreferenceCategoryPanel Component
 *
 * Displays all preferences for a specific category
 * Groups preferences by their group_name
 */

import type { PreferenceDefinition } from '@/types/entities';
import PreferenceEditor from './PreferenceEditor';

interface PreferenceCategoryPanelProps {
  categoryCode: string;
  definitions: PreferenceDefinition[];
  preferences: Record<string, any>;
}

export default function PreferenceCategoryPanel({
  categoryCode,
  definitions,
  preferences,
}: PreferenceCategoryPanelProps) {
  // Group definitions by group_name
  const groupedDefinitions = definitions.reduce((acc, def) => {
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

  if (definitions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">
          No preferences available in this category.
        </p>
      </div>
    );
  }

  return (
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
    </div>
  );
}
