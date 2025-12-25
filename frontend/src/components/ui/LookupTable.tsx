/**
 * LookupTable Component - Editable grid for lookup table data
 * Features: Sorting, Filtering, CRUD operations
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { Plus, Save, X, Trash2, Edit2, ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle } from 'lucide-react';
import type { LookupItem } from '@/types/common';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';

export interface LookupTableProps {
  title: string;
  data: LookupItem[];
  isLoading?: boolean;
  error?: string | null;
  onLoad: () => Promise<void>;
  onCreate: (data: { code: string; is_active?: boolean }) => Promise<void>;
  onUpdate: (id: number, data: { code?: string; is_active?: boolean }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdateTranslation?: (code: string, text: string) => Promise<void>;
}

type SortField = 'id' | 'code' | 'name' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterState {
  id: string;
  code: string;
  name: string;
  is_active: 'all' | 'active' | 'inactive';
}

export const LookupTable: React.FC<LookupTableProps> = ({
  title,
  data,
  isLoading = false,
  error = null,
  onLoad,
  onCreate,
  onUpdate,
  onDelete,
  onUpdateTranslation,
}) => {
  const language = useLanguageStore((state) => state.language);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ code: string; is_active: boolean; name: string }>({ 
    code: '', 
    is_active: true,
    name: ''
  });
  const [originalName, setOriginalName] = useState<string>('');
  const [newItem, setNewItem] = useState<{ code: string; is_active: boolean }>({ code: '', is_active: true });
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Sorting state
  const [sort, setSort] = useState<SortState>({ field: null, direction: null });
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    id: '',
    code: '',
    name: '',
    is_active: 'all',
  });
  
  // Show/hide filter row
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    onLoad();
  }, []); // Only run once on mount - onLoad is stable

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    setSort((prev) => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />;
    }
    if (sort.direction === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-primary-500" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 text-primary-500" />;
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.id) {
      result = result.filter((item) => 
        item.id.toString().includes(filters.id)
      );
    }
    if (filters.code) {
      result = result.filter((item) =>
        item.code.toLowerCase().includes(filters.code.toLowerCase())
      );
    }
    if (filters.name) {
      result = result.filter((item) =>
        (item.name || '').toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.is_active !== 'all') {
      const isActive = filters.is_active === 'active';
      result = result.filter((item) => item.is_active === isActive);
    }

    // Apply sorting
    if (sort.field && sort.direction) {
      result.sort((a, b) => {
        let aVal: string | number | boolean;
        let bVal: string | number | boolean;

        switch (sort.field) {
          case 'id':
            aVal = a.id;
            bVal = b.id;
            break;
          case 'code':
            aVal = a.code.toLowerCase();
            bVal = b.code.toLowerCase();
            break;
          case 'name':
            aVal = (a.name || '').toLowerCase();
            bVal = (b.name || '').toLowerCase();
            break;
          case 'is_active':
            aVal = a.is_active ? 1 : 0;
            bVal = b.is_active ? 1 : 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, filters, sort]);

  // Check if any filters are active
  const hasActiveFilters = filters.id || filters.code || filters.name || filters.is_active !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      id: '',
      code: '',
      name: '',
      is_active: 'all',
    });
  };

  const handleEdit = (item: LookupItem) => {
    setEditingId(item.id);
    setEditingData({ 
      code: item.code, 
      is_active: item.is_active,
      name: item.name || ''
    });
    setOriginalName(item.name || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ code: '', is_active: true, name: '' });
    setOriginalName('');
    setShowNewForm(false);
    setNewItem({ code: '', is_active: true });
  };

  const handleSave = async () => {
    if (editingId) {
      setSaving(true);
      try {
        // Update the lookup item (code, is_active)
        await onUpdate(editingId, { 
          code: editingData.code, 
          is_active: editingData.is_active 
        });

        // If translation changed and onUpdateTranslation is provided, update translations for all languages
        if (onUpdateTranslation && editingData.name !== originalName) {
          await onUpdateTranslation(editingData.code, editingData.name);
        } else if (editingData.name !== originalName) {
          // Default behavior: update translation for current language and create/update for all other languages
          await updateTranslationsForAllLanguages(editingData.code, editingData.name);
        }

        setEditingId(null);
        setEditingData({ code: '', is_active: true, name: '' });
        setOriginalName('');
        // Reload data to reflect changes
        await onLoad();
      } catch (err) {
        console.error('Failed to update:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  // Helper function to update translations for all languages
  const updateTranslationsForAllLanguages = async (code: string, text: string) => {
    try {
      // Get all languages (without language filter to get all)
      const languagesResponse = await lookupApi.getLanguages();
      if (!languagesResponse.success) {
        throw new Error('Failed to fetch languages');
      }

      const languages = languagesResponse.data;
      
      // Get current language ID - find by code match
      const currentLanguage = languages.find(l => l.code.toLowerCase() === language.toLowerCase());
      if (!currentLanguage) {
        throw new Error(`Current language ${language} not found`);
      }

      // Get all existing translations for this code
      const translationsResponse = await lookupApi.getTranslations(code);
      const existingTranslations = translationsResponse.success ? translationsResponse.data : [];

      // Update/create translations for all languages
      const translationPromises = languages.map(async (lang) => {
        const existingTranslation = existingTranslations.find(
          t => t.language_id === lang.id
        );

        if (lang.id === currentLanguage.id) {
          // Update current language's translation
          if (existingTranslation) {
            return lookupApi.updateTranslation(code, lang.id, { text });
          } else {
            return lookupApi.createTranslation({ code, language_id: lang.id, text });
          }
        } else {
          // For other languages, create translation if it doesn't exist
          // Use the same text as default (or leave existing if present)
          if (!existingTranslation) {
            return lookupApi.createTranslation({ 
              code, 
              language_id: lang.id, 
              text: text // Use the same text as default for other languages
            });
          }
          // If translation exists for other language, don't update it
          return Promise.resolve({ success: true });
        }
      });

      await Promise.all(translationPromises);
    } catch (err) {
      console.error('Failed to update translations for all languages:', err);
      throw err;
    }
  };

  const handleCreate = async () => {
    if (!newItem.code.trim()) return;
    setSaving(true);
    try {
      await onCreate(newItem);
      setShowNewForm(false);
      setNewItem({ code: '', is_active: true });
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeleting(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  // Sortable column header component
  const SortableHeader: React.FC<{
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }> = ({ field, children, className = '' }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage {title.toLowerCase()} data</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Clear filters button - visible when filters are active */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={clearFilters}
            >
              <XCircle className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          {/* Filter toggle button */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Filters'}
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                Active
              </span>
            )}
          </Button>
          {!showNewForm && (
            <Button
              variant="primary"
              className="flex items-center gap-2"
              onClick={() => setShowNewForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {showNewForm && (
        <Card className="mb-4 p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Code"
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                placeholder="Enter code"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="new-active"
                checked={newItem.is_active}
                onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="new-active" className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newItem.code.trim() || saving}
              isLoading={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No data available</p>
            <p className="text-sm mt-2">Click "Add New" to create your first item</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {/* Sorting headers row */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <SortableHeader field="id" className="w-20">ID</SortableHeader>
                  <SortableHeader field="code">Code</SortableHeader>
                  <SortableHeader field="name">Translation</SortableHeader>
                  <SortableHeader field="is_active" className="w-28">Active</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    Actions
                  </th>
                </tr>
                
                {/* Filter row */}
                {showFilters && (
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.id}
                        onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                        placeholder="Filter..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.code}
                        onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                        placeholder="Filter by code..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        placeholder="Filter by translation..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={filters.is_active}
                        onChange={(e) => setFilters({ ...filters, is_active: e.target.value as 'all' | 'active' | 'inactive' })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">All</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title="Clear all filters"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Clear
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 opacity-40" />
                        <p>No results match your filters</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                          >
                            Clear all filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {item.id}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <Input
                            value={editingData.code}
                            onChange={(e) => setEditingData({ ...editingData, code: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.code}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <Input
                            value={editingData.name}
                            onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                            placeholder="Enter translation..."
                            className="w-full"
                          />
                        ) : item.name ? (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                        ) : (
                          <span className="text-sm italic text-gray-400 dark:text-gray-500">No translation</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="checkbox"
                            checked={editingData.is_active}
                            onChange={(e) => setEditingData({ ...editingData, is_active: e.target.checked })}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                        ) : (
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSave}
                              disabled={!editingData.code.trim() || saving}
                              isLoading={saving}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              disabled={deleting === item.id}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleting === item.id}
                              isLoading={deleting === item.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Results summary */}
            {data.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>
                    Showing <span className="font-medium text-gray-900 dark:text-gray-100">{processedData.length}</span>
                    {hasActiveFilters && (
                      <> of <span className="font-medium text-gray-900 dark:text-gray-100">{data.length}</span></>
                    )}
                    {' '}item{data.length !== 1 ? 's' : ''}
                  </span>
                  {sort.field && (
                    <span className="text-xs">
                      Sorted by <span className="font-medium">{sort.field}</span> ({sort.direction})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
