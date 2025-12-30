/**
 * IdentificationsTab Component
 *
 * Manages identifications for a given object (employee, person, company, etc.)
 * Features:
 * - Loads identifications from API
 * - Loads identification types (lookup data)
 * - Handles create, update, delete operations
 * - Shows IdentificationsTable with all data
 * - New identification form at the bottom
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import IdentificationsTable from './IdentificationsTable';
import { IdentificationCard } from './IdentificationCard';
import { identificationApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';
import type { Identification } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface IdentificationsTabProps {
  objectId: number;
  objectTypeId?: number;
}

export default function IdentificationsTab({ objectId, objectTypeId }: IdentificationsTabProps) {
  console.log('🔵 IdentificationsTab component rendered with objectId:', objectId);

  const { t } = useTranslation();
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [identificationTypes, setIdentificationTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state (managed here for server-side filtering)
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // New identification form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newIdentificationType, setNewIdentificationType] = useState<number | ''>('');
  const [newIdentificationValue, setNewIdentificationValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const language = useLanguageStore((state) => state.language);

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('identifications-view-mode');

  // Load identifications and identification types
  const loadData = useCallback(async () => {
    console.log('[IdentificationsTab] loadData called for objectId:', objectId, 'filterActive:', filterActive);
    try {
      setIsLoading(true);
      setError(null);

      // Build params based on filter
      const params: { is_active?: boolean } = {};
      if (filterActive !== '') {
        params.is_active = filterActive;
      }

      console.log('[IdentificationsTab] Making API calls with params:', params);

      // Load identifications and identification types in parallel
      const [identificationsResponse, typesResponse] = await Promise.all([
        identificationApi.getByObjectId(objectId, params),
        lookupApi.getIdentificationTypes(language, objectTypeId),
      ]);

      console.log('[IdentificationsTab] Identifications response:', identificationsResponse);
      console.log('[IdentificationsTab] Identifications response RAW:', JSON.stringify(identificationsResponse, null, 2));
      console.log('[IdentificationsTab] Types response:', typesResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const identificationsData = identificationsResponse?.data;
      const typesData = typesResponse?.data;

      console.log('[IdentificationsTab] identificationsData:', identificationsData);
      console.log('[IdentificationsTab] identificationsData is array?', Array.isArray(identificationsData));
      console.log('[IdentificationsTab] identificationsData length:', identificationsData?.length);

      // Handle both array and single object responses
      let identificationsArray: Identification[] = [];
      if (Array.isArray(identificationsData)) {
        identificationsArray = identificationsData;
      } else if (identificationsData && typeof identificationsData === 'object') {
        // Single object returned, wrap it in an array
        identificationsArray = [identificationsData as Identification];
      }

      setIdentifications(identificationsArray);
      setIdentificationTypes(Array.isArray(typesData) ? typesData : []);

      console.log('[IdentificationsTab] State set - identifications count:', identificationsArray.length);
    } catch (err: any) {
      console.error('[IdentificationsTab] Error loading identifications:', err);
      setError(err?.error?.message || t('identifications.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [objectId, language, filterActive, objectTypeId, t]);

  useEffect(() => {
    console.log('[IdentificationsTab] useEffect triggered');
    loadData();
  }, [loadData]);

  // Handle identification update
  const handleUpdate = async (
    id: number,
    data: {
      identification_type_id_old: number;
      identification_type_id_new: number;
      identification_value_old: string;
      identification_value_new: string;
      is_active_old: boolean;
      is_active_new: boolean;
    }
  ) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Send the full payload with old and new values to the API
      const response = await identificationApi.update(id, data);

      if (response.success) {
        // Reload identifications to get the complete updated data
        await loadData();
        setSuccessMessage(t('identifications.updated'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating identification:', err);
      setError(err?.error?.message || t('identifications.loadFailed'));
      throw err; // Re-throw to let IdentificationsTable handle it
    }
  };

  // Handle identification delete (soft delete)
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await identificationApi.delete(id);

      // Reload identifications to reflect the soft delete (is_active = false)
      await loadData();
      setSuccessMessage(t('identifications.deleted'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting identification:', err);
      setError(err?.error?.message || t('identifications.loadFailed'));
      throw err; // Re-throw to let IdentificationsTable handle it
    }
  };

  // Handle create new identification
  const handleCreateIdentification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIdentificationType || !newIdentificationValue.trim()) {
      setError(t('forms.fillAllFields'));
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      setSuccessMessage(null);

      const response = await identificationApi.create(objectId, {
        object_id: objectId,
        identification_type_id: Number(newIdentificationType),
        identification_value: newIdentificationValue.trim(),
      });

      if (response.success && response.data) {
        // Reload identifications to get the complete data with proper IDs
        await loadData();

        // Reset form
        setNewIdentificationType('');
        setNewIdentificationValue('');
        setShowNewForm(false);
        setSuccessMessage(t('identifications.created'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating identification:', err);
      setError(err?.error?.message || t('identifications.loadFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* View Toggle */}
      <div className="flex justify-end">
        <ViewToggle
          viewMode={viewMode}
          onToggle={toggleViewMode}
          gridLabel="Table View"
          cardLabel="Card View"
        />
      </div>

      {/* Identifications View - Table or Card Grid */}
      {viewMode === 'grid' ? (
        <Card>
          <IdentificationsTable
            identifications={identifications}
            identificationTypes={identificationTypes}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={error}
            filterActive={filterActive}
            onFilterActiveChange={setFilterActive}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              Loading identifications...
            </div>
          ) : identifications.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No identifications found
            </div>
          ) : (
            identifications.map((identification) => (
              <IdentificationCard
                key={identification.id}
                identification={identification}
                identificationTypes={identificationTypes}
                onEdit={(i) => {
                  // For card view, we'll need to implement a modal/form for editing
                  // For now, just log
                  console.log('Edit identification:', i);
                }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* New Identification Section */}
      <div className="border-t pt-4">
        {!showNewForm ? (
          <Button
            variant="primary"
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('identifications.addNew')}
          </Button>
        ) : (
          <Card>
            <form onSubmit={handleCreateIdentification} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('identifications.newIdentification')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Identification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('identifications.identificationType')} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newIdentificationType.toString()}
                    onChange={(e) => setNewIdentificationType(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    options={identificationTypes
                      .filter(type => type.is_active)
                      .map((type) => ({
                        value: type.id,
                        label: type.name || type.code
                      }))}
                    placeholder={t('forms.selectStatus')}
                  />
                </div>

                {/* Identification Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('identifications.identificationValue')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newIdentificationValue}
                    onChange={(e) => setNewIdentificationValue(e.target.value)}
                    placeholder={t('identifications.valuePlaceholder')}
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isCreating}
                  className="flex items-center gap-2"
                >
                  {isCreating ? t('identifications.creating') : t('identifications.createIdentification')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewIdentificationType('');
                    setNewIdentificationValue('');
                    setError(null);
                  }}
                  disabled={isCreating}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
