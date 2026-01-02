/**
 * NotesTab Component
 *
 * Manages notes for a given object (employee, person, company, etc.)
 * Features:
 * - Loads notes from API with server-side filtering
 * - Loads note types (lookup data)
 * - Handles create, toggle pin operations
 * - Shows NotesTable with all data
 * - New note button with modal
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { NotesTable } from './NotesTable';
import { NoteFormModal } from './NoteFormModal';
import type { NoteFormData } from './NoteFormModal';
import { notesApi, lookupApi, userApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { ObjectNote, User } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface NotesTabProps {
  objectId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function NotesTab({ objectId, onDataChange }: NotesTabProps) {
  console.log('🔵 NotesTab component rendered with objectId:', objectId);

  const { t } = useTranslation();
  const [notes, setNotes] = useState<ObjectNote[]>([]);
  const [noteTypes, setNoteTypes] = useState<LookupItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state (managed here for server-side filtering)
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<ObjectNote | null>(null);

  const language = useLanguageStore((state) => state.language);

  // Load notes and note types
  const loadData = useCallback(async () => {
    console.log('[NotesTab] loadData called for objectId:', objectId, 'filterActive:', filterActive);
    try {
      setIsLoading(true);
      setError(null);

      // Build params based on filter
      // Convert boolean to 0/1 for API
      const params: { is_active?: number } = {};
      if (filterActive !== '') {
        params.is_active = filterActive ? 1 : 0;
      }

      console.log('[NotesTab] Making API calls with params:', params);

      // Load notes, note types, and users in parallel
      const [notesResponse, typesResponse, usersResponse] = await Promise.all([
        notesApi.getByObjectId(objectId, params),
        lookupApi.getNoteTypes(language),
        userApi.getAll(),
      ]);

      console.log('[NotesTab] Notes response:', notesResponse);
      console.log('[NotesTab] Types response:', typesResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const notesData = notesResponse?.data;
      const typesData = typesResponse?.data;
      const usersData = usersResponse?.data;

      // Handle both array and single object responses
      let notesArray: ObjectNote[] = [];
      if (Array.isArray(notesData)) {
        notesArray = notesData;
      } else if (notesData && typeof notesData === 'object') {
        // Single object returned, wrap it in an array
        notesArray = [notesData as ObjectNote];
      }

      setNotes(notesArray);
      setNoteTypes(Array.isArray(typesData) ? typesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);

      console.log('[NotesTab] State set - notes count:', notesArray.length);
    } catch (err: any) {
      console.error('[NotesTab] Error loading notes:', err);
      setError(err?.error?.message || t('notes.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [objectId, language, filterActive, t]);

  useEffect(() => {
    console.log('[NotesTab] useEffect triggered');
    loadData();
  }, [loadData]);

  // Handle note pin toggle
  const handleTogglePin = async (noteId: number, isPinned: boolean) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await notesApi.togglePin(noteId, isPinned);

      // Reload notes to reflect the change
      await loadData();

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('notes.pinToggled'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error toggling note pin:', err);
      setError(err?.error?.message || t('notes.pinToggleFailed'));
    }
  };

  // Handle create new note
  const handleCreateNote = async (data: NoteFormData) => {
    setIsCreating(true);
    try {
      setError(null);
      setSuccessMessage(null);

      // Generate unique translation codes using timestamp and random suffix
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const subjectCode = data.subject ? `note_subject_${timestamp}_${randomSuffix}` : undefined;
      const noteTextCode = `note_text_${timestamp}_${randomSuffix}`;

      const response = await notesApi.create(objectId, {
        note_type_id: data.note_type_id,
        subject_code: subjectCode,
        subject: data.subject,
        note_text_code: noteTextCode,
        note_text: data.note_text,
        is_pinned: data.is_pinned || false,
      });

      if (response.success && response.data) {
        // Close modal
        setIsModalOpen(false);

        // Reload notes to get the complete data with proper IDs
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('notes.createSuccess'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating note:', err);
      setError(err?.error?.message || t('notes.createFailed'));
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Handle inline update note (from table)
  const handleUpdateNote = async (noteId: number, data: {
    note_type_id_old?: number;
    note_type_id_new?: number;
    subject_old?: string;
    subject_new?: string;
    note_text_old: string;
    note_text_new: string;
  }) => {
    console.log('[NotesTab] handleUpdateNote called:', { noteId, data });
    try {
      setError(null);
      setSuccessMessage(null);

      // Send the full payload with old and new values to the API
      const response = await notesApi.update(noteId, data);
      console.log('[NotesTab] Update response:', response);

      // Reload notes
      await loadData();

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('notes.updateSuccess'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[NotesTab] Error updating note:', err);
      setError(err?.error?.message || t('notes.updateFailed'));
      throw err;
    }
  };

  // Handle modal-based create/update (for new note button)
  const handleModalSubmit = async (data: NoteFormData) => {
    if (editingNote) {
      // Update existing note via modal - use old/new pattern
      setIsCreating(true);
      try {
        setError(null);
        setSuccessMessage(null);

        await notesApi.update(editingNote.id, {
          note_type_id_old: editingNote.note_type_id,
          note_type_id_new: data.note_type_id,
          subject_old: editingNote.subject || '',
          subject_new: data.subject,
          note_text_old: editingNote.note_text,
          note_text_new: data.note_text,
        });

        // Close modal
        setIsModalOpen(false);
        setEditingNote(null);

        // Reload notes
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('notes.updateSuccess'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
        console.error('Error updating note:', err);
        setError(err?.error?.message || t('notes.updateFailed'));
        throw err;
      } finally {
        setIsCreating(false);
      }
    } else {
      // Create new note
      await handleCreateNote(data);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await notesApi.delete(noteId);

      // Reload notes
      await loadData();

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('notes.deleteSuccess'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(err?.error?.message || t('notes.deleteFailed'));
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Notes Table */}
      <NotesTable
        notes={notes}
        isLoading={isLoading}
        error={error}
        noteTypes={noteTypes}
        users={users}
        onTogglePin={handleTogglePin}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        filterActive={filterActive}
        onFilterActiveChange={setFilterActive}
      />

      {/* New Note Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('notes.addNew')}
        </Button>
      </div>

      {/* Note Form Modal */}
      <NoteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        noteTypes={noteTypes}
        isSubmitting={isCreating}
        initialData={editingNote ? {
          note_type_id: editingNote.note_type_id,
          subject: editingNote.subject || '',
          note_text: editingNote.note_text,
          is_pinned: editingNote.is_pinned,
        } : undefined}
      />
    </div>
  );
}
