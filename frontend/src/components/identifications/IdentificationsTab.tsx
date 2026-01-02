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
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import IdentificationsTable from './IdentificationsTable';
import { IdentificationCard } from './IdentificationCard';
import { IdentificationFormModal } from './IdentificationFormModal';
import type { IdentificationFormData } from './IdentificationFormModal';
import { identificationApi, lookupApi, userApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';
import type { Identification, User } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface IdentificationsTabProps {
  objectId: number;
  objectTypeId?: number;
  onDataChange?: () => void | Promise<void>;
}

export default function IdentificationsTab({ objectId, objectTypeId, onDataChange }: IdentificationsTabProps) {
  console.log('🔵 IdentificationsTab component rendered with objectId:', objectId);

  const { t } = useTranslation();
  const [identifications, setIdentifications] = useState<Identification[]>([]);
  const [identificationTypes, setIdentificationTypes] = useState<LookupItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state (managed here for server-side filtering)
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      // Load identifications, identification types, and users in parallel
      const [identificationsResponse, typesResponse, usersResponse] = await Promise.all([
        identificationApi.getByObjectId(objectId, params),
        lookupApi.getIdentificationTypes(language, objectTypeId),
        userApi.getAll(),
      ]);

      console.log('[IdentificationsTab] Identifications response:', identificationsResponse);
      console.log('[IdentificationsTab] Identifications response RAW:', JSON.stringify(identificationsResponse, null, 2));
      console.log('[IdentificationsTab] Types response:', typesResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const identificationsData = identificationsResponse?.data;
      const typesData = typesResponse?.data;
      const usersData = usersResponse?.data;

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
      setUsers(Array.isArray(usersData) ? usersData : []);

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

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

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

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

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
  const handleCreateIdentification = async (data: IdentificationFormData) => {
    setIsCreating(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await identificationApi.create(objectId, {
        object_id: objectId,
        identification_type_id: data.identification_type_id,
        identification_value: data.identification_value.trim(),
      });

      if (response.success && response.data) {
        // Close modal
        setIsModalOpen(false);

        // Reload identifications to get the complete data with proper IDs
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('identifications.created'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating identification:', err);
      setError(err?.error?.message || t('identifications.loadFailed'));
      throw err;
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
            users={users}
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

      {/* New Identification Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('identifications.addNew')}
        </Button>
      </div>

      {/* Identification Form Modal */}
      <IdentificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateIdentification}
        identificationTypes={identificationTypes}
        isSubmitting={isCreating}
      />
    </div>
  );
}
