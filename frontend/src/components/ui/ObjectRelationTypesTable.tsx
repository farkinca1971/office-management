/**
 * ObjectRelationTypesTable Component - Specialized table for object relation types
 * Features: Separate columns for parent/child object types and mirrored type
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
import { useTranslation } from '@/lib/i18n';
import { Pagination } from './Pagination';
import { Select } from './Select';

interface ObjectRelationTypeItem extends LookupItem {
  parent_object_type_id?: number;
  child_object_type_id?: number;
  mirrored_type_id?: number;
  mirrored_type_code?: string;
}

export interface ObjectRelationTypesTableProps {
  title: string;
  data: LookupItem[];
  isLoading?: boolean;
  error?: string | null;
  onLoad: () => Promise<void>;
  onCreate: (data: { 
    code: string; 
    is_active?: boolean; 
    text?: string; 
    language_id?: number; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
  }) => Promise<void>;
  onUpdate: (id: number, data: { 
    code?: string; 
    is_active?: boolean; 
    text?: string; 
    language_id?: number; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
    update_all_languages?: boolean | number; 
    old_code?: string;
    new_code?: string;
    old_is_active?: boolean;
    new_is_active?: boolean;
    old_parent_object_type_id?: number;
    new_parent_object_type_id?: number;
    old_child_object_type_id?: number;
    new_child_object_type_id?: number;
    old_text?: string; 
    new_text?: string;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  objectTypes?: LookupItem[];
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
  };
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
  parent_type: string;
  child_type: string;
  mirrored_type: string;
}

export const ObjectRelationTypesTable: React.FC<ObjectRelationTypesTableProps> = ({
  title,
  data,
  isLoading = false,
  error = null,
  onLoad,
  onCreate,
  onUpdate,
  onDelete,
  objectTypes = [],
  pagination,
}) => {
  const language = useLanguageStore((state) => state.language);
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ 
    code: string; 
    is_active: boolean; 
    name: string; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
  }>({ 
    code: '', 
    is_active: true, 
    name: '',
    parent_object_type_id: undefined,
    child_object_type_id: undefined,
  });
  const [originalValues, setOriginalValues] = useState<{ 
    code: string; 
    is_active: boolean; 
    name: string; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
  }>({ 
    code: '', 
    is_active: true, 
    name: '',
    parent_object_type_id: undefined,
    child_object_type_id: undefined,
  });
  const [updateAllLanguages, setUpdateAllLanguages] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newItem, setNewItem] = useState<{ 
    code: string; 
    is_active: boolean; 
    name: string; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
  }>({ 
    code: '', 
    is_active: true, 
    name: '',
    parent_object_type_id: undefined,
    child_object_type_id: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [sort, setSort] = useState<SortState>({ field: null, direction: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    id: '',
    code: '',
    name: '',
    is_active: 'all',
    parent_type: '',
    child_type: '',
    mirrored_type: '',
  });

  // Helper function to get object type name from ID
  const getObjectTypeName = (objectTypeId?: number): string | undefined => {
    if (objectTypeId === null || objectTypeId === undefined) {
      return undefined;
    }
    const objectType = objectTypes.find(ot => ot.id === objectTypeId);
    return objectType?.name || objectType?.code || undefined;
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (filters.id) {
      result = result.filter(item => String(item.id).includes(filters.id));
    }
    if (filters.code) {
      result = result.filter(item => item.code.toLowerCase().includes(filters.code.toLowerCase()));
    }
    if (filters.name) {
      result = result.filter(item => (item.name || '').toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.is_active !== 'all') {
      result = result.filter(item => item.is_active === (filters.is_active === 'active'));
    }
    if (filters.parent_type) {
      const filterLower = filters.parent_type.toLowerCase();
      result = result.filter(item => {
        const relationItem = item as ObjectRelationTypeItem;
        const parentTypeName = getObjectTypeName(relationItem.parent_object_type_id);
        return parentTypeName?.toLowerCase().includes(filterLower);
      });
    }
    if (filters.child_type) {
      const filterLower = filters.child_type.toLowerCase();
      result = result.filter(item => {
        const relationItem = item as ObjectRelationTypeItem;
        const childTypeName = getObjectTypeName(relationItem.child_object_type_id);
        return childTypeName?.toLowerCase().includes(filterLower);
      });
    }
    if (filters.mirrored_type) {
      const filterLower = filters.mirrored_type.toLowerCase();
      result = result.filter(item => {
        const relationItem = item as ObjectRelationTypeItem;
        return relationItem.mirrored_type_code?.toLowerCase().includes(filterLower);
      });
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
  }, [data, filters, sort, objectTypes]);

  // Apply pagination
  const processedData = useMemo(() => {
    if (pagination) {
      const startIndex = (pagination.page - 1) * pagination.perPage;
      const endIndex = startIndex + pagination.perPage;
      return filteredAndSortedData.slice(startIndex, endIndex);
    }
    return filteredAndSortedData;
  }, [filteredAndSortedData, pagination]);

  const hasActiveFilters = filters.id || filters.code || filters.name || filters.is_active !== 'all' || 
    filters.parent_type || filters.child_type || filters.mirrored_type;

  const clearFilters = () => {
    setFilters({
      id: '',
      code: '',
      name: '',
      is_active: 'all',
      parent_type: '',
      child_type: '',
      mirrored_type: '',
    });
  };

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      if (sort.direction === 'asc') {
        setSort({ field, direction: 'desc' });
      } else if (sort.direction === 'desc') {
        setSort({ field: null, direction: null });
      } else {
        setSort({ field, direction: 'asc' });
      }
    } else {
      setSort({ field, direction: 'asc' });
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />;
    }
    if (sort.direction === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />;
    }
    if (sort.direction === 'desc') {
      return <ArrowDown className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />;
    }
    return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />;
  };

  const handleEdit = (item: LookupItem) => {
    setEditingId(item.id);
    const relationItem = item as ObjectRelationTypeItem;
    const currentData = { 
      code: item.code, 
      is_active: item.is_active,
      name: item.name || '',
      parent_object_type_id: relationItem.parent_object_type_id,
      child_object_type_id: relationItem.child_object_type_id,
    };
    setEditingData(currentData);
    setOriginalValues({ ...currentData });
    setUpdateAllLanguages(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
    setOriginalValues({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
    setUpdateAllLanguages(false);
    setShowNewForm(false);
    setNewItem({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
  };

  const handleSave = async () => {
    if (editingId) {
      setSaving(true);
      try {
        let currentLanguageId: number | undefined = undefined;
        const hasTranslationChanged = editingData.name !== originalValues.name && editingData.name.trim();
        
        if (hasTranslationChanged) {
          try {
            const languagesResponse = await lookupApi.getLanguages();
            if (languagesResponse.success) {
              const currentLanguage = languagesResponse.data.find(
                l => l.code.toLowerCase() === language.toLowerCase()
              );
              if (currentLanguage) {
                currentLanguageId = currentLanguage.id;
              }
            }
          } catch (err) {
            console.warn('Failed to get language ID:', err);
          }
        }

        if (updateAllLanguages && hasTranslationChanged && editingData.name.trim()) {
          try {
            const languagesResponse = await lookupApi.getLanguages();
            if (languagesResponse.success) {
              const targetLanguages = languagesResponse.data.filter(
                l => ['en', 'de', 'hu'].includes(l.code.toLowerCase())
              );
              
              const translationPromises = targetLanguages.map(async (lang) => {
                try {
                  await lookupApi.updateTranslation(editingData.code, lang.id, { text: editingData.name });
                } catch (updateErr: any) {
                  if (updateErr?.error?.code === 'NOT_FOUND' || updateErr?.status === 404) {
                    try {
                      await lookupApi.createTranslation({
                        code: editingData.code,
                        language_id: lang.id,
                        text: editingData.name
                      });
                    } catch (createErr) {
                      console.error(`Failed to create translation for ${lang.code}:`, createErr);
                      throw createErr;
                    }
                  } else {
                    throw updateErr;
                  }
                }
              });
              
              await Promise.all(translationPromises);
            }
          } catch (err) {
            console.error('Failed to update translations for all languages:', err);
          }
        }

        await onUpdate(editingId, { 
          update_all_languages: updateAllLanguages && hasTranslationChanged ? 1 : 0,
          language_id: currentLanguageId,
          old_code: originalValues.code || '',
          new_code: editingData.code || '',
          old_is_active: originalValues.is_active,
          new_is_active: editingData.is_active,
          old_parent_object_type_id: originalValues.parent_object_type_id !== undefined ? originalValues.parent_object_type_id : undefined,
          new_parent_object_type_id: editingData.parent_object_type_id !== undefined ? editingData.parent_object_type_id : undefined,
          old_child_object_type_id: originalValues.child_object_type_id !== undefined ? originalValues.child_object_type_id : undefined,
          new_child_object_type_id: editingData.child_object_type_id !== undefined ? editingData.child_object_type_id : undefined,
          old_text: originalValues.name || '',
          new_text: editingData.name || ''
        });

        // Reload data after successful update
        await onLoad();
        
        setEditingId(null);
        setEditingData({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
        setOriginalValues({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
        setUpdateAllLanguages(false);
      } catch (err) {
        console.error('Failed to update:', err);
        throw err;
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!newItem.code.trim()) return;
    setSaving(true);
    try {
      let currentLanguageId: number | undefined = undefined;
      if (newItem.name.trim()) {
        try {
          const languagesResponse = await lookupApi.getLanguages();
          if (languagesResponse.success) {
            const currentLanguage = languagesResponse.data.find(
              l => l.code.toLowerCase() === language.toLowerCase()
            );
            if (currentLanguage) {
              currentLanguageId = currentLanguage.id;
            }
          }
        } catch (err) {
          console.warn('Failed to get language ID:', err);
        }
      }

      await onCreate({
        code: newItem.code,
        is_active: newItem.is_active,
        text: newItem.name.trim() || undefined,
        language_id: currentLanguageId,
        parent_object_type_id: newItem.parent_object_type_id !== undefined ? newItem.parent_object_type_id : undefined,
        child_object_type_id: newItem.child_object_type_id !== undefined ? newItem.child_object_type_id : undefined,
      });

      // Reload data after successful create
      await onLoad();
      
      setShowNewForm(false);
      setNewItem({ code: '', is_active: true, name: '', parent_object_type_id: undefined, child_object_type_id: undefined });
    } catch (err: any) {
      console.error('Failed to create:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('lookup.deleteConfirm'))) return;
    setDeleting(id);
    try {
      await onDelete(id);
      // Reload data after successful delete
      await onLoad();
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

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
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('lookup.manageData').replace('{title}', title)}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={clearFilters}
            >
              <XCircle className="h-4 w-4" />
              {t('lookup.clearFilters')}
            </Button>
          )}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? t('lookup.hideFilters') : t('lookup.filters')}
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                {t('lookup.activeFilters')}
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
              {t('lookup.addNew')}
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
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('lookup.code')}
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                placeholder={t('lookup.enterCode')}
                required
              />
              <Input
                label={`${t('lookup.translation')} (${language.toUpperCase()})`}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder={t('lookup.enterTranslation')}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Parent Object Type"
                value={newItem.parent_object_type_id ? String(newItem.parent_object_type_id) : ''}
                onChange={(e) => setNewItem({ ...newItem, parent_object_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                options={objectTypes.map(ot => ({ value: ot.id, label: ot.name || ot.code }))}
                placeholder="Select parent object type (optional)"
              />
              <Select
                label="Child Object Type"
                value={newItem.child_object_type_id ? String(newItem.child_object_type_id) : ''}
                onChange={(e) => setNewItem({ ...newItem, child_object_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                options={objectTypes.map(ot => ({ value: ot.id, label: ot.name || ot.code }))}
                placeholder="Select child object type (optional)"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="new-active"
                  checked={newItem.is_active}
                  onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="new-active" className="text-sm text-gray-700 dark:text-gray-300">
                  {t('lookup.active')}
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      await handleCreate();
                    } catch (err: any) {
                      console.error('Error creating item:', err);
                    }
                  }}
                  disabled={!newItem.code.trim() || saving}
                  isLoading={saving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('lookup.save')}
                </Button>
                <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  {t('lookup.cancel')}
                </Button>
              </div>
            </div>
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
            <p>{t('lookup.noDataAvailable')}</p>
            <p className="text-sm mt-2">{t('lookup.clickAddNew')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <SortableHeader field="id" className="w-20">{t('lookup.id')}</SortableHeader>
                  <SortableHeader field="code">{t('lookup.code')}</SortableHeader>
                  <SortableHeader field="name">{t('lookup.translation')}</SortableHeader>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Parent Object Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Child Object Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Mirrored Type
                  </th>
                  <SortableHeader field="is_active" className="w-28">{t('lookup.active')}</SortableHeader>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider w-28">
                    {t('lookup.actions')}
                  </th>
                </tr>
                
                {showFilters && (
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.id}
                        onChange={(e) => setFilters({ ...filters, id: e.target.value })}
                        placeholder={t('lookup.filter')}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.code}
                        onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                        placeholder={t('lookup.filterByCode')}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.name}
                        onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                        placeholder={t('lookup.filterByTranslation')}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.parent_type}
                        onChange={(e) => setFilters({ ...filters, parent_type: e.target.value })}
                        placeholder="Filter by parent type"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.child_type}
                        onChange={(e) => setFilters({ ...filters, child_type: e.target.value })}
                        placeholder="Filter by child type"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={filters.mirrored_type}
                        onChange={(e) => setFilters({ ...filters, mirrored_type: e.target.value })}
                        placeholder="Filter by mirrored type"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={filters.is_active}
                        onChange={(e) => setFilters({ ...filters, is_active: e.target.value as 'all' | 'active' | 'inactive' })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="all">{t('lookup.all')}</option>
                        <option value="active">{t('lookup.active')}</option>
                        <option value="inactive">{t('lookup.inactive')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          title={t('lookup.clearAllFilters')}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          {t('lookup.clearFilters')}
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Filter className="h-8 w-8 opacity-40" />
                        {hasActiveFilters ? (
                          <>
                            <p>{t('lookup.noResultsMatch')}</p>
                            <button
                              onClick={clearFilters}
                              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                            >
                              {t('lookup.clearAllFilters')}
                            </button>
                          </>
                        ) : pagination && filteredAndSortedData.length === 0 && data.length > 0 ? (
                          <p>{t('lookup.noDataOnPage')}</p>
                        ) : (
                          <p>{t('lookup.noDataAvailable')}</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedData.map((item) => {
                    const relationItem = item as ObjectRelationTypeItem;
                    return (
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
                              placeholder={t('lookup.enterTranslation')}
                              className="w-full"
                            />
                          ) : item.name ? (
                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                          ) : (
                            <span className="text-sm italic text-gray-400 dark:text-gray-500">{t('lookup.noTranslation')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === item.id ? (
                            <Select
                              value={editingData.parent_object_type_id ? String(editingData.parent_object_type_id) : ''}
                              onChange={(e) => setEditingData({ ...editingData, parent_object_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                              options={objectTypes.map(ot => ({ value: ot.id, label: ot.name || ot.code }))}
                              placeholder="Select parent type"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {getObjectTypeName(relationItem.parent_object_type_id) || <span className="italic text-gray-400 dark:text-gray-500">—</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === item.id ? (
                            <Select
                              value={editingData.child_object_type_id ? String(editingData.child_object_type_id) : ''}
                              onChange={(e) => setEditingData({ ...editingData, child_object_type_id: e.target.value ? parseInt(e.target.value) : undefined })}
                              options={objectTypes.map(ot => ({ value: ot.id, label: ot.name || ot.code }))}
                              placeholder="Select child type"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {getObjectTypeName(relationItem.child_object_type_id) || <span className="italic text-gray-400 dark:text-gray-500">—</span>}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {relationItem.mirrored_type_code ? (
                              <span className="font-medium">{relationItem.mirrored_type_code}</span>
                            ) : (
                              <span className="italic text-gray-400 dark:text-gray-500">—</span>
                            )}
                          </span>
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
                              {item.is_active ? t('lookup.active') : t('lookup.inactive')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingId === item.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center gap-1.5 mr-2">
                                <input
                                  type="checkbox"
                                  id={`update-all-languages-${item.id}`}
                                  checked={updateAllLanguages}
                                  onChange={(e) => setUpdateAllLanguages(e.target.checked)}
                                  disabled={saving}
                                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <label 
                                  htmlFor={`update-all-languages-${item.id}`}
                                  className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                                  title={t('lookup.translations')}
                                >
                                  {t('lookup.translations')}
                                </label>
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await handleSave();
                                  } catch (err: any) {
                                    console.error('Error saving item:', err);
                                  }
                                }}
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
                    );
                  })
                )}
              </tbody>
            </table>
            
            {pagination && filteredAndSortedData.length > 0 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={Math.ceil(filteredAndSortedData.length / pagination.perPage)}
                perPage={pagination.perPage}
                total={filteredAndSortedData.length}
                onPageChange={pagination.onPageChange}
                onPerPageChange={pagination.onPerPageChange}
              />
            )}

            {!pagination && data.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>
                    {t('lookup.showing')} <span className="font-medium text-gray-900 dark:text-gray-100">{processedData.length}</span>
                    {hasActiveFilters && (
                      <> {t('lookup.of')} <span className="font-medium text-gray-900 dark:text-gray-100">{data.length}</span></>
                    )}
                    {' '}{data.length !== 1 ? t('lookup.itemsPlural') : t('lookup.items')}
                  </span>
                  {sort.field && (
                    <span className="text-xs">
                      {t('lookup.sortedBy')} <span className="font-medium">{sort.field}</span> ({sort.direction})
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

