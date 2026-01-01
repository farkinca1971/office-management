/**
 * ContactsTable Component
 *
 * Features:
 * - Sortable columns (click headers to toggle asc/desc/none)
 * - Filterable by contact type and active status
 * - Inline editing with Save/Cancel buttons
 * - Soft delete with confirmation
 * - Display contact type name from lookup data
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
import type { Contact } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface ContactUpdatePayload {
  contact_type_id_old: number;
  contact_type_id_new: number;
  contact_value_old: string;
  contact_value_new: string;
  is_active_old: boolean;
  is_active_new: boolean;
}

interface ContactsTableProps {
  contacts: Contact[];
  contactTypes: LookupItem[];
  onUpdate: (id: number, data: ContactUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  filterActive: boolean | '';
  onFilterActiveChange: (value: boolean | '') => void;
}

type SortField = 'id' | 'contact_type_id' | 'contact_value' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

export default function ContactsTable({
  contacts,
  contactTypes,
  onUpdate,
  onDelete,
  isLoading = false,
  error = null,
  filterActive,
  onFilterActiveChange,
}: ContactsTableProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ contact_type_id: number; contact_value: string; is_active: boolean } | null>(null);
  const [originalData, setOriginalData] = useState<{ contact_type_id: number; contact_value: string; is_active: boolean } | null>(null);
  const [filterContactType, setFilterContactType] = useState<number | ''>('');
  const [filterContactValue, setFilterContactValue] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Get contact type name by ID
  const getContactTypeName = (contactTypeId: number): string => {
    const contactType = contactTypes.find(ct => ct.id === contactTypeId);
    return contactType?.name || contactType?.code || 'Unknown';
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

  // Filter and sort contacts
  const filteredAndSortedContacts = useMemo(() => {
    // Ensure contacts is always an array
    if (!Array.isArray(contacts)) {
      console.warn('[ContactsTable] contacts prop is not an array:', contacts);
      return [];
    }

    let result = [...contacts];

    // Apply client-side filters
    if (filterContactType !== '') {
      result = result.filter(c => c.contact_type_id === filterContactType);
    }
    if (filterContactValue) {
      result = result.filter(c =>
        c.contact_value?.toLowerCase().includes(filterContactValue.toLowerCase())
      );
    }

    // Apply sorting
    if (sortDirection !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle contact_type_id sorting by name
        if (sortField === 'contact_type_id') {
          aValue = getContactTypeName(a.contact_type_id);
          bValue = getContactTypeName(b.contact_type_id);
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
  }, [contacts, filterContactType, filterContactValue, sortField, sortDirection, contactTypes]);

  // Handle edit start
  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    const initialData = {
      contact_type_id: contact.contact_type_id,
      contact_value: contact.contact_value,
      is_active: contact.is_active,
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
        contact_type_id_old: originalData.contact_type_id,
        contact_type_id_new: editData.contact_type_id,
        contact_value_old: originalData.contact_value,
        contact_value_new: editData.contact_value,
        is_active_old: originalData.is_active,
        is_active_new: editData.is_active,
      };

      await onUpdate(id, updatePayload);
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (error) {
      console.error('Failed to update contact:', error);
      // Error handling is done in parent component
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete contact:', error);
      // Error handling is done in parent component
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('contacts.loading')}
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
                ID <SortIcon field="id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('contact_type_id')}
              >
                Contact Type <SortIcon field="contact_type_id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('contact_value')}
              >
                Contact Value <SortIcon field="contact_value" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('is_active')}
              >
                Active <SortIcon field="is_active" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                Created At <SortIcon field="created_at" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for ID */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterContactType}
                  onChange={(val) => setFilterContactType(val === '' || val === 0 ? '' : val as number)}
                  options={contactTypes.map(type => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                  placeholder={t('contacts.allTypes')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterContactValue}
                  onChange={setFilterContactValue}
                  placeholder={t('contacts.valuePlaceholder')}
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
            {filteredAndSortedContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('contacts.noContacts')}
                </td>
              </tr>
            ) : (
              filteredAndSortedContacts.map((contact) => {
                const isEditing = editingId === contact.id;

                return (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {contact.id}
                    </td>

                    {/* Contact Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Select
                          value={editData?.contact_type_id.toString() || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, contact_type_id: Number(e.target.value) } : null)}
                          className="w-full"
                          options={contactTypes.map((type) => ({
                            value: type.id,
                            label: type.name || type.code
                          }))}
                        />
                      ) : (
                        getContactTypeName(contact.contact_type_id)
                      )}
                    </td>

                    {/* Contact Value */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editData?.contact_value || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, contact_value: e.target.value } : null)}
                          className="w-full"
                        />
                      ) : (
                        contact.contact_value
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contact.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {contact.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(contact.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleSave(contact.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleEdit(contact)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === contact.id ? (
                            <>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Delete?</span>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(contact.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Confirm Delete"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(contact.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
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
        {t('contacts.showing')} {filteredAndSortedContacts.length} {t('contacts.of')} {contacts.length} {contacts.length === 1 ? t('contacts.newContact').toLowerCase() : t('contacts.title').toLowerCase()}
      </div>
    </div>
  );
}
