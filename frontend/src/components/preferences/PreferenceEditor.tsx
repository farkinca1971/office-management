'use client';

/**
 * PreferenceEditor Component
 *
 * Generic editor for a single preference
 * Automatically renders appropriate input based on data type
 */

import { useState, useEffect } from 'react';
import { useUpdatePreference } from '@/store/preferencesStore';
import type { PreferenceDefinition } from '@/types/entities';

interface PreferenceEditorProps {
  definition: PreferenceDefinition;
  value: any;
}

export default function PreferenceEditor({
  definition,
  value,
}: PreferenceEditorProps) {
  const updatePreference = useUpdatePreference();
  const [localValue, setLocalValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = async (newValue: any) => {
    setLocalValue(newValue);
    setError(null);
    setIsSaving(true);

    try {
      await updatePreference(definition.key_name, newValue);
    } catch (err: any) {
      setError(err.message || 'Failed to update preference');
      // Revert to previous value on error
      setLocalValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  // Render input based on data type
  const renderInput = () => {
    switch (definition.data_type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localValue || false}
              onChange={(e) => handleChange(e.target.checked)}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            value={localValue || ''}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
          />
        );

      case 'string':
        // Check if validation rules suggest a select/enum
        if (definition.validation_rules?.enum) {
          return (
            <select
              value={localValue || ''}
              onChange={(e) => handleChange(e.target.value)}
              disabled={isSaving}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
            >
              {definition.validation_rules.enum.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        }

        return (
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
          />
        );

      case 'json':
        return (
          <textarea
            value={typeof localValue === 'string' ? localValue : JSON.stringify(localValue, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange(parsed);
              } catch {
                // Invalid JSON, keep as string for now
                setLocalValue(e.target.value);
              }
            }}
            disabled={isSaving}
            rows={4}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full font-mono text-sm"
          />
        );

      default:
        return (
          <input
            type="text"
            value={localValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSaving}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full"
          />
        );
    }
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1 mr-4">
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          {definition.display_name || definition.key_name}
          {isSaving && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Saving...)
            </span>
          )}
        </label>
        {definition.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {definition.description}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-2">
            {error}
          </p>
        )}
      </div>
      <div className="w-64">{renderInput()}</div>
    </div>
  );
}
