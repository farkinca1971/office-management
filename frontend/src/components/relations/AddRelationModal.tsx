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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { objectRelationApi } from '@/lib/api/objectRelations';
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
  existingRelationIds?: number[]; // IDs of objects already related to current object
}

export default function AddRelationModal({
  isOpen,
  onClose,
  onSubmit,
  currentObjectId,
  currentObjectTypeId,
  existingRelationIds = [],
}: AddRelationModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [relationTypes, setRelationTypes] = useState<LookupItem[]>([]);
  const [selectedRelationTypeId, setSelectedRelationTypeId] = useState<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<ObjectSearchResult | null>(null);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object search state
  const [availableObjects, setAvailableObjects] = useState<ObjectSearchResult[]>([]);
  const [isLoadingObjects, setIsLoadingObjects] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Load available objects when relation type changes
  const loadAvailableObjects = useCallback(async (query: string = '') => {
    if (!allowedTargetObjectTypeIds || allowedTargetObjectTypeIds.length === 0) {
      setAvailableObjects([]);
      return;
    }

    try {
      setIsLoadingObjects(true);
      const response = await objectRelationApi.searchObjects({
        query: query.trim() || undefined,
        object_type_ids: allowedTargetObjectTypeIds,
        page: 1,
        per_page: 50,
      });

      if (response.success && response.data) {
        // Filter out objects that already have a relation with the current object
        const filteredObjects = response.data.filter(
          obj => !existingRelationIds.includes(obj.id)
        );
        setAvailableObjects(filteredObjects);
      } else {
        setAvailableObjects([]);
      }
    } catch (err) {
      console.error('Failed to load objects:', err);
      setAvailableObjects([]);
    } finally {
      setIsLoadingObjects(false);
    }
  }, [allowedTargetObjectTypeIds, existingRelationIds]);

  // Load objects when relation type is selected
  useEffect(() => {
    if (selectedRelationTypeId && allowedTargetObjectTypeIds) {
      loadAvailableObjects('');
    } else {
      setAvailableObjects([]);
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRelationTypeId, allowedTargetObjectTypeIds]);

  // Debounce search query
  useEffect(() => {
    if (!selectedRelationTypeId || !allowedTargetObjectTypeIds) return;

    if (searchQuery === '') {
      // If search is cleared, reload immediately
      loadAvailableObjects('');
      return;
    }

    // Debounce search input
    const timeoutId = setTimeout(() => {
      loadAvailableObjects(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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
    setSearchQuery('');
    setAvailableObjects([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
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

            {/* Target Object Searchable Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.targetObject')} <span className="text-red-500">*</span>
              </label>
              {!selectedRelationTypeId ? (
                <div>
                  <input
                    type="text"
                    disabled
                    placeholder={t('relations.selectRelationTypeFirst')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('relations.selectRelationTypeFirst')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('relations.searchPlaceholder')}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  {/* Objects Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedObject?.id || ''}
                      onChange={(e) => {
                        const objectId = Number(e.target.value);
                        const object = availableObjects.find(obj => obj.id === objectId);
                        setSelectedObject(object || null);
                      }}
                      disabled={isLoadingObjects}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                    >
                      <option value="">{isLoadingObjects ? t('common.loading') : t('common.select')}</option>
                      {availableObjects.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {obj.display_name}
                        </option>
                      ))}
                    </select>
                    {isLoadingObjects && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                  {availableObjects.length === 0 && !isLoadingObjects && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {searchQuery ? t('common.noResultsFound') : t('relations.noObjectsAvailable')}
                    </p>
                  )}
                </div>
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
  );
}
