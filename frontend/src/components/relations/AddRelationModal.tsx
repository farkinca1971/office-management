/**
 * AddRelationModal Component
 *
 * Modal for creating new object relations
 * Features:
 * - Smart filtering: only shows valid relation types for current object
 * - Determines valid target object types from relation type selection
 * - Advanced object search for target selection
 * - Optional note field
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AdvancedObjectSearchModal from '@/components/search/AdvancedObjectSearchModal';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { ObjectSearchResult } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AddRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    object_relation_type_id: number;
    object_to_id: number;
    note?: string;
  }) => Promise<void>;
  currentObjectId: number;
  currentObjectTypeId: number;
}

export default function AddRelationModal({
  isOpen,
  onClose,
  onSubmit,
  currentObjectId,
  currentObjectTypeId,
}: AddRelationModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [relationTypes, setRelationTypes] = useState<LookupItem[]>([]);
  const [selectedRelationTypeId, setSelectedRelationTypeId] = useState<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<ObjectSearchResult | null>(null);
  const [note, setNote] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load relation types filtered by current object type
  useEffect(() => {
    const loadRelationTypes = async () => {
      try {
        const response = await lookupApi.getObjectRelationTypes(language);
        const allTypes = response?.data || [];

        // Filter to only show relation types where parent_object_type_id matches current object
        const filtered = Array.isArray(allTypes)
          ? allTypes.filter((type: any) =>
              type.parent_object_type_id === currentObjectTypeId && type.is_active
            )
          : [];

        setRelationTypes(filtered);
      } catch (err) {
        console.error('Failed to load relation types:', err);
        setRelationTypes([]);
      }
    };

    if (isOpen) {
      loadRelationTypes();
    }
  }, [isOpen, currentObjectTypeId, language]);

  // Get selected relation type object
  const selectedRelationType = useMemo(() => {
    if (!selectedRelationTypeId) return null;
    return relationTypes.find(type => type.id === selectedRelationTypeId);
  }, [selectedRelationTypeId, relationTypes]);

  // Get allowed object types for search based on selected relation type
  const allowedTargetObjectTypeIds = useMemo(() => {
    if (!selectedRelationType) return undefined;
    // child_object_type_id defines what type of object can be the target
    const childTypeId = (selectedRelationType as any).child_object_type_id;
    return childTypeId ? [childTypeId] : undefined;
  }, [selectedRelationType]);

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedRelationTypeId) {
      setError('Please select a relation type');
      return;
    }
    if (!selectedObject) {
      setError('Please select a target object');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        object_relation_type_id: selectedRelationTypeId,
        object_to_id: selectedObject.id,
        note: note.trim() || undefined,
      });

      handleClose();
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to create relation');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedRelationTypeId(null);
    setSelectedObject(null);
    setNote('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('relations.addRelation')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            {/* Relation Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.relationType')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedRelationTypeId?.toString() || ''}
                onChange={(e) => {
                  setSelectedRelationTypeId(Number(e.target.value) || null);
                  setSelectedObject(null); // Reset selection when type changes
                }}
                options={[
                  { value: '', label: t('common.select') },
                  ...relationTypes.map((type) => ({
                    value: type.id,
                    label: type.name || type.code,
                  })),
                ]}
              />
              {relationTypes.length === 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('relations.noValidRelationTypes')}
                </p>
              )}
            </div>

            {/* Target Object Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.targetObject')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    readOnly
                    value={selectedObject ? selectedObject.display_name : ''}
                    placeholder={t('relations.selectTargetObject')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setIsSearchModalOpen(true)}
                  disabled={!selectedRelationTypeId}
                >
                  <Search className="h-4 w-4 mr-1" />
                  {t('common.search')}
                </Button>
              </div>
              {!selectedRelationTypeId && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('relations.selectRelationTypeFirst')}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.note')}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('relations.addOptionalNote')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
            <Button variant="secondary" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !selectedRelationTypeId || !selectedObject}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : t('relations.createRelation')}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedObjectSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={setSelectedObject}
        allowedObjectTypeIds={allowedTargetObjectTypeIds}
        title={t('relations.selectTargetObject')}
      />
    </>
  );
}
