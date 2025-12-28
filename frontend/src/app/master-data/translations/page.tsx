/**
 * Translations Lookup Page
 * Note: Translations have a different structure (code, language_id, text)
 * This page uses a simplified version of the LookupTable pattern
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Plus, Save, X, Trash2, Edit2, ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle } from 'lucide-react';
import { lookupApi } from '@/lib/api';
import type { Translation } from '@/types/common';
import { Pagination } from '@/components/ui/Pagination';

export default function TranslationsPage() {
  const [data, setData] = React.useState<Translation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const [editingKey, setEditingKey] = React.useState<{ code: string; languageId: number } | null>(null);
  const [editingData, setEditingData] = React.useState<{ text: string }>({ text: '' });
  const [newItem, setNewItem] = React.useState<{ code: string; language_id: number; text: string }>({
    code: '',
    language_id: 1,
    text: '',
  });
  const [showNewForm, setShowNewForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  
  // Sorting state
  type SortField = 'code' | 'language_id' | 'text';
  type SortDirection = 'asc' | 'desc' | null;
  const [sort, setSort] = React.useState<{ field: SortField | null; direction: SortDirection }>({ 
    field: null, 
    direction: null 
  });
  
  // Filter state
  const [filters, setFilters] = React.useState<{
    code: string;
    language_id: string;
    text: string;
  }>({
    code: '',
    language_id: '',
    text: '',
  });
  
  // Show/hide filter row
  const [showFilters, setShowFilters] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getTranslations();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load translations');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load translations');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

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

  // Check if any filters are active
  const hasActiveFilters = filters.code || filters.language_id || filters.text;

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      code: '',
      language_id: '',
      text: '',
    });
  };

  // Filter and sort data (without pagination for total count)
  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.code) {
      result = result.filter((item) =>
        item.code.toLowerCase().includes(filters.code.toLowerCase())
      );
    }
    if (filters.language_id) {
      result = result.filter((item) =>
        item.language_id.toString().includes(filters.language_id)
      );
    }
    if (filters.text) {
      result = result.filter((item) =>
        item.text.toLowerCase().includes(filters.text.toLowerCase())
      );
    }

    // Apply sorting
    if (sort.field && sort.direction) {
      result.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sort.field) {
          case 'code':
            aVal = a.code.toLowerCase();
            bVal = b.code.toLowerCase();
            break;
          case 'language_id':
            aVal = a.language_id;
            bVal = b.language_id;
            break;
          case 'text':
            aVal = a.text.toLowerCase();
            bVal = b.text.toLowerCase();
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

  // Reset to page 1 when filtered/sorted data changes
  React.useEffect(() => {
    setPage(1);
  }, [filteredAndSortedData.length]);

  // Calculate paginated data from filtered/sorted data
  const paginatedData = React.useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, page, perPage]);

  const handleEdit = (item: Translation) => {
    setEditingKey({ code: item.code, languageId: item.language_id });
    setEditingData({ text: item.text });
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const response = await lookupApi.updateTranslation(editingKey.code, editingKey.languageId, editingData);
      if (response.success) {
        await loadData();
        setEditingKey(null);
        setEditingData({ text: '' });
      } else {
        throw new Error('Failed to update translation');
      }
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newItem.code.trim() || !newItem.text.trim()) return;
    setSaving(true);
    try {
      const response = await lookupApi.createTranslation(newItem);
      if (response.success) {
        await loadData();
        setShowNewForm(false);
        setNewItem({ code: '', language_id: 1, text: '' });
      } else {
        throw new Error('Failed to create translation');
      }
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string, languageId: number) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;
    try {
      const response = await lookupApi.deleteTranslation(code, languageId);
      if (response.success) {
        await loadData();
      } else {
        throw new Error('Failed to delete translation');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Translations</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage translation data</p>
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
          <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowNewForm(true)}>
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
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Code"
              value={newItem.code}
              onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
              placeholder="Enter code"
              required
            />
            <Input
              label="Language ID"
              type="number"
              value={newItem.language_id}
              onChange={(e) => setNewItem({ ...newItem, language_id: parseInt(e.target.value) || 1 })}
              required
            />
            <Input
              label="Text"
              value={newItem.text}
              onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
              placeholder="Enter translation text"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={handleCreate} disabled={!newItem.code.trim() || !newItem.text.trim() || saving} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="secondary" onClick={() => { setShowNewForm(false); setNewItem({ code: '', language_id: 1, text: '' }); }} disabled={saving}>
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {/* Sorting headers row */}
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-1.5">
                      Code
                      {getSortIcon('code')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('language_id')}
                  >
                    <div className="flex items-center gap-1.5">
                      Language ID
                      {getSortIcon('language_id')}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none group hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleSort('text')}
                  >
                    <div className="flex items-center gap-1.5">
                      Text
                      {getSortIcon('text')}
                    </div>
                  </th>
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
                        value={filters.code}
                        onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                        placeholder="Filter by code..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.language_id}
                        onChange={(e) => setFilters({ ...filters, language_id: e.target.value })}
                        placeholder="Filter by language ID..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.text}
                        onChange={(e) => setFilters({ ...filters, text: e.target.value })}
                        placeholder="Filter by text..."
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
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
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 opacity-40" />
                        {hasActiveFilters ? (
                          <>
                            <p>No results match your filters</p>
                            <button
                              onClick={clearFilters}
                              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                            >
                              Clear all filters
                            </button>
                          </>
                        ) : filteredAndSortedData.length === 0 && data.length > 0 ? (
                          <p>No data available on this page</p>
                        ) : (
                          <p>No translations found</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, idx) => {
                  const isEditing = editingKey?.code === item.code && editingKey?.languageId === item.language_id;
                  return (
                    <tr key={`${item.code}-${item.language_id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.language_id}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            value={editingData.text}
                            onChange={(e) => setEditingData({ text: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-gray-100">{item.text}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="primary" size="sm" onClick={handleSave} disabled={!editingData.text.trim() || saving} isLoading={saving}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => { setEditingKey(null); setEditingData({ text: '' }); }} disabled={saving}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.code, item.language_id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            {filteredAndSortedData.length > 0 && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(filteredAndSortedData.length / perPage)}
                perPage={perPage}
                total={filteredAndSortedData.length}
                onPageChange={setPage}
                onPerPageChange={(newPerPage) => {
                  setPerPage(newPerPage);
                  setPage(1);
                }}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

