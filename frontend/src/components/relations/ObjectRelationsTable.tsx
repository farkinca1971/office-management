/**
 * ObjectRelationsTable Component
 *
 * Features:
 * - Display object relations in table format
 * - Show direction indicators (→ outgoing, ← incoming)
 * - Inline note editing with old/new values
 * - Delete with confirmation
 * - Click related objects to navigate
 * - Sort by relation type and created_at
 * - Filter by relation type
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  FileText,
  Users,
  Briefcase,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { TextColumnFilter, SelectColumnFilter, CheckboxColumnFilter } from '@/components/ui/ColumnFilters';
import { formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { ObjectRelation, User as UserType } from '@/types/entities';
import type { LookupItem } from '@/types/common';

// Update payload interface following the inline editing pattern
interface RelationUpdatePayload {
  note_old?: string;
  note_new?: string;
}

interface ObjectRelationsTableProps {
  relations: ObjectRelation[];
  relationTypes: LookupItem[];
  objectTypes: LookupItem[];
  users?: UserType[];
  currentObjectId: number;
  onUpdate: (id: number, data: RelationUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onAddNew?: () => void;
  isLoading?: boolean;
  error?: string | null;
  filterActive: boolean | '';
  onFilterActiveChange: (value: boolean | '') => void;
}

type SortField = 'object_relation_type_id' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

interface EditData {
  note?: string;
}

// Helper to get object type icon
const getObjectTypeIcon = (objectTypeCode?: string) => {
  if (!objectTypeCode) return <FileText className="h-4 w-4" />;

  switch (objectTypeCode.toLowerCase()) {
    case 'person':
      return <User className="h-4 w-4" />;
    case 'company':
      return <Building2 className="h-4 w-4" />;
    case 'employee':
      return <Briefcase className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'group':
      return <Users className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

// Helper to get navigation path for an object
const getObjectNavigationPath = (objectId: number, objectTypeCode?: string): string | null => {
  if (!objectTypeCode) return null;

  switch (objectTypeCode.toLowerCase()) {
    case 'person':
      return `/persons?id=${objectId}`;
    case 'company':
      return `/companies?id=${objectId}`;
    case 'employee':
      return `/employees?id=${objectId}`;
    case 'document':
      return `/documents?id=${objectId}`;
    default:
      return null;
  }
};

export default function ObjectRelationsTable({
  relations,
  relationTypes,
  objectTypes,
  users = [],
  currentObjectId,
  onUpdate,
  onDelete,
  onAddNew,
  isLoading = false,
  error = null,
  filterActive,
  onFilterActiveChange,
}: ObjectRelationsTableProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [originalData, setOriginalData] = useState<EditData | null>(null);
  const [filterRelationType, setFilterRelationType] = useState<number | ''>('');
  const [filterRelatedObject, setFilterRelatedObject] = useState('');
  const [filterNote, setFilterNote] = useState('');
  const [filterCreatedAt, setFilterCreatedAt] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Get username by user ID
  const getUsername = (userId?: number | string): string => {
    if (!userId) return '-';
    const user = users.find(u => u.id === Number(userId));
    return user?.username || '-';
  };

  // Get lookup name by ID
  const getLookupName = (lookupItems: LookupItem[], id?: number): string => {
    if (!id) return '-';
    const item = lookupItems.find(l => l.id === id);
    return item?.name || item?.code || t('relations.unknown');
  };

  // Get object type code by ID
  const getObjectTypeCode = (objectTypeId?: number): string | undefined => {
    if (!objectTypeId) return undefined;
    const type = objectTypes.find(t => t.id === objectTypeId);
    return type?.code;
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null (original)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('created_at'); // Reset to default
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

  // Filter and sort relations
  const filteredAndSortedRelations = useMemo(() => {
    if (!Array.isArray(relations)) {
      console.warn('[ObjectRelationsTable] relations prop is not an array:', relations);
      return [];
    }

    let result = [...relations];

    // Apply client-side filters
    if (filterRelationType !== '') {
      result = result.filter(r => r.object_relation_type_id === filterRelationType);
    }
    if (filterRelatedObject) {
      result = result.filter(r => {
        // Filter by related object name (either from or to)
        const relatedObjectName = r.object_from_id === currentObjectId
          ? r.object_to_name || ''
          : r.object_from_name || '';
        return relatedObjectName.toLowerCase().includes(filterRelatedObject.toLowerCase());
      });
    }
    if (filterNote) {
      result = result.filter(r =>
        r.note?.toLowerCase().includes(filterNote.toLowerCase())
      );
    }
    if (filterCreatedAt) {
      result = result.filter(r =>
        r.created_at?.toLowerCase().includes(filterCreatedAt.toLowerCase())
      );
    }

    // Apply sorting
    if (sortDirection !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle relation type sorting by name
        if (sortField === 'object_relation_type_id') {
          aValue = getLookupName(relationTypes, a.object_relation_type_id);
          bValue = getLookupName(relationTypes, b.object_relation_type_id);
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
  }, [relations, filterRelationType, filterRelatedObject, filterNote, filterCreatedAt, sortField, sortDirection, relationTypes, currentObjectId]);

  // Handle edit start
  const handleEdit = (relation: ObjectRelation) => {
    setEditingId(relation.id);
    const initialData: EditData = {
      note: relation.note || '',
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
      // Send both old and new values for note field
      const updatePayload: RelationUpdatePayload = {
        note_old: originalData.note,
        note_new: editData.note,
      };

      await onUpdate(id, updatePayload);
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (error) {
      console.error('Failed to update relation:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete relation:', error);
    }
  };

  // Handle navigation to related object
  const handleNavigateToObject = (objectId: number, objectTypeCode?: string) => {
    const path = getObjectNavigationPath(objectId, objectTypeCode);
    if (path) {
      router.push(path);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('relations.loading')}
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="space-y-4">
      {/* Header with New Relation Button */}
      {onAddNew && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onAddNew}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('relations.addNew')}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {/* Header Row */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('relations.direction')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('object_relation_type_id')}
              >
                {t('relations.relationType')} <SortIcon field="object_relation_type_id" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('relations.relatedObject')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('relations.note')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                {t('common.createdAt')} <SortIcon field="created_at" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.createdBy')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('is_active')}
              >
                {t('common.active')} <SortIcon field="is_active" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for direction */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterRelationType}
                  onChange={(val) => setFilterRelationType(val === '' || val === 0 ? '' : val as number)}
                  options={relationTypes.map(type => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                  placeholder={t('relations.allTypes')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterRelatedObject}
                  onChange={setFilterRelatedObject}
                  placeholder={t('relations.filterRelatedObject')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterNote}
                  onChange={setFilterNote}
                  placeholder={t('relations.note')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterCreatedAt}
                  onChange={setFilterCreatedAt}
                  placeholder={t('common.createdAt')}
                />
              </th>
              <th className="px-6 py-2">
                {/* No filter for created_by */}
              </th>
              <th className="px-6 py-2">
                <CheckboxColumnFilter
                  checked={filterActive === '' ? null : filterActive}
                  onChange={(val) => onFilterActiveChange(val === null ? '' : val)}
                />
              </th>
              <th className="px-6 py-2">
                {/* No filter for actions */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedRelations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('relations.noRelations')}
                </td>
              </tr>
            ) : (
              filteredAndSortedRelations.map((relation) => {
                const isEditing = editingId === relation.id;
                const isOutgoing = relation.object_from_id === currentObjectId;
                const relatedObjectId = isOutgoing ? relation.object_to_id : relation.object_from_id;
                const relatedObjectName = isOutgoing ? relation.object_to_name : relation.object_from_name;
                const relatedObjectTypeId = isOutgoing ? relation.object_to_type_id : relation.object_from_type_id;
                const relatedObjectTypeCode = getObjectTypeCode(relatedObjectTypeId);
                const navigationPath = getObjectNavigationPath(relatedObjectId, relatedObjectTypeCode);

                return (
                  <tr key={relation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* 1. Direction */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-1">
                        {isOutgoing ? (
                          <>
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('relations.outgoing')}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowLeft className="h-4 w-4 text-green-500" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('relations.incoming')}
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* 2. Relation Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getLookupName(relationTypes, relation.object_relation_type_id)}
                    </td>

                    {/* 3. Related Object */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-2">
                        {getObjectTypeIcon(relatedObjectTypeCode)}
                        {navigationPath ? (
                          <button
                            onClick={() => handleNavigateToObject(relatedObjectId, relatedObjectTypeCode)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                          >
                            {relatedObjectName || `Object #${relatedObjectId}`}
                          </button>
                        ) : (
                          <span>{relatedObjectName || `Object #${relatedObjectId}`}</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Note */}
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editData?.note || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, note: e.target.value } : null)}
                          className="w-full"
                          placeholder={t('relations.notePlaceholder')}
                        />
                      ) : (
                        <div className="max-w-xs truncate">
                          {relation.note || '-'}
                        </div>
                      )}
                    </td>

                    {/* 5. Created At */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(relation.created_at)}
                    </td>

                    {/* 6. Created By */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getUsername(relation.created_by)}
                    </td>

                    {/* 7. Active Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          relation.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {relation.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>

                    {/* 8. Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleSave(relation.id)}
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
                            onClick={() => handleEdit(relation)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === relation.id ? (
                            <>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Delete?</span>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(relation.id)}
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
                              onClick={() => setDeleteConfirmId(relation.id)}
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
        {t('relations.showing')} {filteredAndSortedRelations.length} {t('relations.of')} {relations.length} {t('relations.relations').toLowerCase()}
      </div>
    </div>
  );
}
