/**
 * IdentificationsTable Component
 *
 * Features:
 * - Sortable columns (click headers to toggle asc/desc/none)
 * - Filterable by identification type and active status
 * - Inline editing with Save/Cancel buttons
 * - Soft delete with confirmation
 * - Display identification type name from lookup data
 * - Timestamp formatting (created_at, updated_at)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { TextColumnFilter, SelectColumnFilter, CheckboxColumnFilter } from '@/components/ui/ColumnFilters';
import { formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Identification } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface IdentificationUpdatePayload {
  identification_type_id_old: number;
  identification_type_id_new: number;
  identification_value_old: string;
  identification_value_new: string;
  is_active_old: boolean;
  is_active_new: boolean;
}

interface IdentificationsTableProps {
  identifications: Identification[];
  identificationTypes: LookupItem[];
  onUpdate: (id: number, data: IdentificationUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  filterActive: boolean | '';
  onFilterActiveChange: (value: boolean | '') => void;
}

type SortField = 'id' | 'identification_type_id' | 'identification_value' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

export default function IdentificationsTable({
  identifications,
  identificationTypes,
  onUpdate,
  onDelete,
  isLoading = false,
  error = null,
  filterActive,
  onFilterActiveChange,
}: IdentificationsTableProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ identification_type_id: number; identification_value: string; is_active: boolean } | null>(null);
  const [originalData, setOriginalData] = useState<{ identification_type_id: number; identification_value: string; is_active: boolean } | null>(null);
  const [filterIdentificationType, setFilterIdentificationType] = useState<number | ''>('');
  const [filterIdentificationValue, setFilterIdentificationValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Get identification type name by ID
  const getIdentificationTypeName = (identificationTypeId: number): string => {
    const identificationType = identificationTypes.find(it => it.id === identificationTypeId);
    return identificationType?.name || identificationType?.code || t('identifications.unknown');
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null (original)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('id'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4 inline ml-1" />;
    if (sortDirection === 'desc') return <ChevronDown className="h-4 w-4 inline ml-1" />;
    return null;
  };

  // Filter and sort identifications
  const filteredAndSortedIdentifications = useMemo(() => {
    // Ensure identifications is always an array
    if (!Array.isArray(identifications)) {
      console.warn('[IdentificationsTable] identifications prop is not an array:', identifications);
      return [];
    }

    let result = [...identifications];

    // Apply client-side filters
    if (filterIdentificationType !== '') {
      result = result.filter(i => i.identification_type_id === filterIdentificationType);
    }
    if (filterIdentificationValue) {
      result = result.filter(i =>
        i.identification_value?.toLowerCase().includes(filterIdentificationValue.toLowerCase())
      );
    }

    // Apply sorting
    if (sortDirection !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle identification_type_id sorting by name
        if (sortField === 'identification_type_id') {
          aValue = getIdentificationTypeName(a.identification_type_id);
          bValue = getIdentificationTypeName(b.identification_type_id);
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric/boolean comparison
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [identifications, filterIdentificationType, filterIdentificationValue, sortField, sortDirection, identificationTypes, t]);

  // Handle edit start
  const handleEdit = (identification: Identification) => {
    setEditingId(identification.id);
    const initialData = {
      identification_type_id: identification.identification_type_id,
      identification_value: identification.identification_value,
      is_active: identification.is_active,
    };
    setEditData(initialData);
    setOriginalData(initialData);
  };

  // Handle edit cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
    setOriginalData(null);
  };

  // Handle save
  const handleSave = async (id: number) => {
    if (!editData || !originalData) return;

    try {
      // Send both old and new values for all editable fields
      const updatePayload = {
        identification_type_id_old: originalData.identification_type_id,
        identification_type_id_new: editData.identification_type_id,
        identification_value_old: originalData.identification_value,
        identification_value_new: editData.identification_value,
        is_active_old: originalData.is_active,
        is_active_new: editData.is_active,
      };

      await onUpdate(id, updatePayload);
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (error) {
      console.error('Failed to update identification:', error);
      // Error handling is done in parent component
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete identification:', error);
      // Error handling is done in parent component
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('identifications.loading')}
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {/* Header Row */}
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                {t('table.id')} <SortIcon field="id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('identification_type_id')}
              >
                {t('identifications.identificationType')} <SortIcon field="identification_type_id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('identification_value')}
              >
                {t('identifications.identificationValue')} <SortIcon field="identification_value" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('is_active')}
              >
                {t('table.active')} <SortIcon field="is_active" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                {t('table.createdAt')} <SortIcon field="created_at" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('table.actions')}
              </th>
            </tr>
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for ID */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterIdentificationType}
                  onChange={(val) => setFilterIdentificationType(val === '' || val === 0 ? '' : val as number)}
                  options={identificationTypes.map(type => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                  placeholder={t('identifications.allTypes')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterIdentificationValue}
                  onChange={setFilterIdentificationValue}
                  placeholder="ID number..."
                />
              </th>
              <th className="px-6 py-2">
                <CheckboxColumnFilter
                  checked={filterActive === '' ? null : filterActive}
                  onChange={(val) => onFilterActiveChange(val === null ? '' : val)}
                />
              </th>
              <th className="px-6 py-2">
                {/* No filter for created_at */}
              </th>
              <th className="px-6 py-2">
                {/* No filter for actions */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedIdentifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('identifications.noIdentifications')}
                </td>
              </tr>
            ) : (
              filteredAndSortedIdentifications.map((identification) => {
                const isEditing = editingId === identification.id;

                return (
                  <tr key={identification.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {identification.id}
                    </td>

                    {/* Identification Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Select
                          value={editData?.identification_type_id.toString() || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, identification_type_id: Number(e.target.value) } : null)}
                          className="w-full"
                          options={identificationTypes.map((type) => ({
                            value: type.id,
                            label: type.name || type.code
                          }))}
                        />
                      ) : (
                        getIdentificationTypeName(identification.identification_type_id)
                      )}
                    </td>

                    {/* Identification Value */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editData?.identification_value || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, identification_value: e.target.value } : null)}
                          className="w-full"
                        />
                      ) : (
                        identification.identification_value
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          identification.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {identification.is_active ? t('table.active') : t('table.inactive')}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(identification.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleSave(identification.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title={t('table.save')}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title={t('table.cancel')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(identification)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('table.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === identification.id ? (
                            <>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{t('table.delete')}?</span>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(identification.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title={t('common.confirm')}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                title={t('table.cancel')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(identification.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('table.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('identifications.showing')} {filteredAndSortedIdentifications.length} {t('identifications.of')} {identifications.length} {t('identifications.title').toLowerCase()}
      </div>
    </div>
  );
}
