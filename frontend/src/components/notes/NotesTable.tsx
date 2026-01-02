/**
 * NotesTable Component - Display notes for an object
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TextColumnFilter, SelectColumnFilter, CheckboxColumnFilter } from '@/components/ui/ColumnFilters';
import { ArrowUp, ArrowDown, ArrowUpDown, Pin, PinOff, Pencil, Trash2, Save, X } from 'lucide-react';
import type { ObjectNote } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';

interface NoteUpdatePayload {
  note_type_id_old?: number;
  note_type_id_new?: number;
  subject_old?: string;
  subject_new?: string;
  note_text_old: string;
  note_text_new: string;
}

export interface NotesTableProps {
  notes: ObjectNote[];
  isLoading?: boolean;
  error?: string | null;
  noteTypes?: LookupItem[];
  onTogglePin?: (noteId: number, isPinned: boolean) => void;
  onUpdate?: (noteId: number, data: NoteUpdatePayload) => Promise<void>;
  onDelete?: (noteId: number) => void;
  filterActive: boolean | '';
  onFilterActiveChange: (value: boolean | '') => void;
}

type SortField = 'created_at' | 'note_type_id' | 'is_pinned' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface EditData {
  note_type_id?: number;
  subject?: string;
  note_text: string;
}

export const NotesTable: React.FC<NotesTableProps> = ({
  notes,
  isLoading = false,
  error = null,
  noteTypes = [],
  onTogglePin,
  onUpdate,
  onDelete,
  filterActive,
  onFilterActiveChange,
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: 'created_at', direction: 'desc' });
  const [filterNoteType, setFilterNoteType] = useState<number | ''>('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterPinned, setFilterPinned] = useState<boolean | ''>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [originalData, setOriginalData] = useState<EditData | null>(null);

  const getNoteTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const noteType = noteTypes.find(nt => nt.id === typeId);
    return noteType?.name || noteType?.code || t('notes.unknownType');
  };

  // Sorting logic
  const handleSort = (field: SortField) => {
    setSortState(prev => {
      if (prev.field === field) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortState.direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortState.direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Filtering and Sorting
  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];

    // Apply client-side filters
    if (filterNoteType !== '') {
      result = result.filter(n => n.note_type_id === filterNoteType);
    }
    if (filterSubject) {
      result = result.filter(n =>
        n.subject?.toLowerCase().includes(filterSubject.toLowerCase())
      );
    }
    if (filterPinned !== '') {
      result = result.filter(n => n.is_pinned === filterPinned);
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof ObjectNote;
        const aVal = a[field] ?? '';
        const bVal = b[field] ?? '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    } else {
      // Default sort: pinned first, then by created_at DESC
      result.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return a.is_pinned ? -1 : 1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return result;
  }, [notes, sortState, filterNoteType, filterSubject, filterPinned]);

  const handlePinClick = (noteId: number, currentPinStatus: boolean) => {
    if (onTogglePin) {
      onTogglePin(noteId, !currentPinStatus);
    }
  };

  // Handle edit start
  const handleEdit = (note: ObjectNote) => {
    setEditingId(note.id);
    const initialData: EditData = {
      note_type_id: note.note_type_id,
      subject: note.subject || '',
      note_text: note.note_text,
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
  const handleSave = async (noteId: number) => {
    if (!editData || !originalData || !onUpdate) return;

    console.log('[NotesTable] handleSave called:', { noteId, editData, originalData });

    try {
      // Send both old and new values for all editable fields
      const updatePayload: NoteUpdatePayload = {
        note_type_id_old: originalData.note_type_id,
        note_type_id_new: editData.note_type_id,
        subject_old: originalData.subject,
        subject_new: editData.subject,
        note_text_old: originalData.note_text,
        note_text_new: editData.note_text,
      };

      console.log('[NotesTable] Calling onUpdate with payload:', updatePayload);
      await onUpdate(noteId, updatePayload);
      console.log('[NotesTable] Update successful, clearing edit state');
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (error) {
      console.error('[NotesTable] Failed to update note:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedNotes.length} {filteredAndSortedNotes.length === 1 ? t('notes.note') : t('notes.notes')}
            {filteredAndSortedNotes.length !== notes.length && (
              <span className="ml-2 text-gray-500">
                (filtered from {notes.length})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {/* Header Row */}
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                {t('notes.pin')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('note_type_id')}
              >
                <div className="flex items-center gap-2">
                  {t('notes.type')}
                  {getSortIcon('note_type_id')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('notes.subject')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('notes.noteText')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('is_active')}
              >
                <div className="flex items-center gap-2">
                  Active
                  {getSortIcon('is_active')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  {t('notes.createdAt')}
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('notes.createdBy')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('table.actions')}
              </th>
            </tr>
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for pin */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterNoteType}
                  onChange={(val) => setFilterNoteType(val === '' || val === 0 ? '' : val as number)}
                  options={noteTypes.map(type => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                  placeholder="All Types"
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterSubject}
                  onChange={setFilterSubject}
                  placeholder="Subject..."
                />
              </th>
              <th className="px-6 py-2">
                {/* No filter for note text */}
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
                {/* No filter for created_by */}
              </th>
              <th className="px-6 py-2">
                <CheckboxColumnFilter
                  checked={filterPinned === '' ? null : filterPinned}
                  onChange={(val) => setFilterPinned(val === null ? '' : val)}
                  label="Pinned"
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedNotes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {notes.length === 0 ? t('notes.noNotes') : 'No notes match the current filters'}
                </td>
              </tr>
            ) : (
              filteredAndSortedNotes.map((note) => {
                const isEditing = editingId === note.id;
                return (
                  <tr
                    key={note.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      note.is_pinned ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePinClick(note.id, note.is_pinned)}
                        className="text-gray-400 hover:text-yellow-500 transition-colors"
                        title={note.is_pinned ? t('notes.unpin') : t('notes.pin')}
                        disabled={isEditing}
                      >
                        {note.is_pinned ? (
                          <Pin className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <PinOff className="h-5 w-5" />
                        )}
                      </button>
                    </td>

                    {/* Note Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {isEditing ? (
                        <Select
                          value={editData?.note_type_id?.toString() || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, note_type_id: e.target.value ? Number(e.target.value) : undefined } : null)}
                          className="w-full"
                          options={[
                            { value: '', label: '-' },
                            ...noteTypes.map((type) => ({
                              value: type.id,
                              label: type.name || type.code
                            }))
                          ]}
                        />
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                          {getNoteTypeName(note.note_type_id)}
                        </span>
                      )}
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium max-w-xs">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editData?.subject || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, subject: e.target.value } : null)}
                          placeholder="Subject..."
                          className="w-full"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words">
                          {note.subject || '-'}
                        </div>
                      )}
                    </td>

                    {/* Note Text */}
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                      {isEditing ? (
                        <textarea
                          value={editData?.note_text || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, note_text: e.target.value } : null)}
                          placeholder="Note text..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100"
                        />
                      ) : (
                        <div className="whitespace-pre-wrap break-words line-clamp-3">
                          {note.note_text}
                        </div>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          note.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {note.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(note.created_at)}
                    </td>

                    {/* Created By */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {note.created_by_username || '-'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleSave(note.id)}
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
                            onClick={() => handleEdit(note)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title={t('table.edit')}
                            disabled={!onUpdate}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === note.id ? (
                            <>
                              <span className="text-xs text-gray-600 dark:text-gray-400">{t('table.delete')}?</span>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  if (onDelete) {
                                    onDelete(note.id);
                                    setDeleteConfirmId(null);
                                  }
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title={t('common.confirm')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                title={t('table.cancel')}
                              >
                                ✕
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(note.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title={t('table.delete')}
                              disabled={!onDelete}
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

    </Card>
  );
};
