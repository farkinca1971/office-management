/**
 * NotesTable Component - Display notes for an object
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown, Pin, PinOff, Plus } from 'lucide-react';
import type { ObjectNote } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';

export interface NotesTableProps {
  notes: ObjectNote[];
  isLoading?: boolean;
  error?: string | null;
  noteTypes?: LookupItem[];
  onTogglePin?: (noteId: number, isPinned: boolean) => void;
  onAddNote?: () => void;
}

type SortField = 'id' | 'created_at' | 'note_type_id' | 'is_pinned';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export const NotesTable: React.FC<NotesTableProps> = ({
  notes,
  isLoading = false,
  error = null,
  noteTypes = [],
  onTogglePin,
  onAddNote,
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: 'created_at', direction: 'desc' });

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

  // Sorting
  const sortedNotes = useMemo(() => {
    let result = [...notes];

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
  }, [notes, sortState]);

  const handlePinClick = (noteId: number, currentPinStatus: boolean) => {
    if (onTogglePin) {
      onTogglePin(noteId, !currentPinStatus);
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {sortedNotes.length} {sortedNotes.length === 1 ? t('notes.note') : t('notes.notes')}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                {t('notes.pin')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  {t('lookup.id')}
                  {getSortIcon('id')}
                </div>
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedNotes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('notes.noNotes')}
                </td>
              </tr>
            ) : (
              sortedNotes.map((note) => (
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
                    >
                      {note.is_pinned ? (
                        <Pin className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      ) : (
                        <PinOff className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {note.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                      {getNoteTypeName(note.note_type_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium max-w-xs">
                    <div className="whitespace-pre-wrap break-words">
                      {note.subject || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                    <div className="whitespace-pre-wrap break-words line-clamp-3">
                      {note.note_text}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDateTime(note.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {note.created_by_username || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Note Button */}
      {onAddNote && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={onAddNote}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('notes.addNew')}
          </Button>
        </div>
      )}
    </Card>
  );
};
