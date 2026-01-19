/**
 * AddDocumentRelationModal Component
 *
 * Modal for creating a new document relation for an object
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { documentsApi, objectRelationApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { Document } from '@/types/entities';
import type { SearchableSelectOption } from '@/components/ui/SearchableSelect';

interface AddDocumentRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  objectId: number;
  objectRelationTypeId?: number;
  onSuccess?: () => void | Promise<void>;
}

export default function AddDocumentRelationModal({
  isOpen,
  onClose,
  objectId,
  objectRelationTypeId,
  onSuccess,
}: AddDocumentRelationModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      // Reset form
      setSelectedDocumentId(null);
      setNote('');
      setError(null);
    }
  }, [isOpen, language]);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await documentsApi.getAll({
        is_active: 1,
        language_code: language,
      });

      // Handle n8n array wrapper
      let documentsData = response;
      if (Array.isArray(response) && response.length > 0) {
        documentsData = response[0];
      }

      const documentsList = (documentsData.success && documentsData.data) ? documentsData.data : [];
      setDocuments(Array.isArray(documentsList) ? documentsList : []);
    } catch (err: any) {
      console.error('[AddDocumentRelationModal] Error loading documents:', err);
      setError(err?.error?.message || t('documents.loadFailed'));
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocumentId) {
      setError(t('documents.selectDocumentRequired') || 'Please select a document');
      return;
    }

    if (!objectRelationTypeId) {
      setError(t('documents.relationTypeRequired') || 'Relation type is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await objectRelationApi.create({
        object_from_id: objectId,
        object_to_id: selectedDocumentId,
        object_relation_type_id: objectRelationTypeId,
        note: note || undefined,
      });

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err: any) {
      console.error('[AddDocumentRelationModal] Error creating relation:', err);
      setError(err?.error?.message || t('documents.relationCreateFailed') || 'Failed to create relation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const documentOptions: SearchableSelectOption[] = documents.map((doc) => ({
    value: doc.id,
    label: `${doc.title}${doc.document_number ? ` (${doc.document_number})` : ''}`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('documents.addRelation')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          {isLoadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <SearchableSelect
                label={t('documents.selectDocument') || 'Select Document'}
                value={selectedDocumentId}
                onChange={(value) => setSelectedDocumentId(value as number | null)}
                options={documentOptions}
                placeholder={t('documents.searchDocuments') || 'Search documents...'}
                required
                error={!selectedDocumentId && error ? t('documents.selectDocumentRequired') || 'Please select a document' : undefined}
              />

              <Input
                label={t('notes.note') || 'Note'}
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('common.optional') || 'Optional note...'}
              />
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoadingDocuments || !selectedDocumentId}
            >
              {t('common.create') || 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

