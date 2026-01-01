/**
 * AddressesTab Component
 *
 * Manages addresses for a given object (employee, person, company, etc.)
 * Features:
 * - Loads addresses from API
 * - Loads address types, area types, and countries (lookup data)
 * - Handles create, update, delete operations
 * - Shows AddressesTable with all data
 * - New address form at the bottom
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import AddressesTable from './AddressesTable';
import { AddressCard } from './AddressCard';
import { AddressFormModal } from './AddressFormModal';
import type { AddressFormData } from './AddressFormModal';
import { addressApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';
import type { Address } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AddressesTabProps {
  objectId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function AddressesTab({ objectId, onDataChange }: AddressesTabProps) {
  console.log('🔵 AddressesTab component rendered with objectId:', objectId);

  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressTypes, setAddressTypes] = useState<LookupItem[]>([]);
  const [addressAreaTypes, setAddressAreaTypes] = useState<LookupItem[]>([]);
  const [countries, setCountries] = useState<LookupItem[]>([]);
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
  const { viewMode, toggleViewMode } = useViewMode('addresses-view-mode');

  // Load addresses and lookup data
  const loadData = useCallback(async () => {
    console.log('[AddressesTab] loadData called for objectId:', objectId, 'filterActive:', filterActive);
    try {
      setIsLoading(true);
      setError(null);

      // Build params based on filter
      // Convert boolean to 0/1 for API
      const params: { is_active?: number } = {};
      if (filterActive !== '') {
        params.is_active = filterActive ? 1 : 0;
      }

      console.log('[AddressesTab] Making API calls with params:', params);

      // Load addresses and lookup data in parallel
      const [addressesResponse, typesResponse, areaTypesResponse, countriesResponse] = await Promise.all([
        addressApi.getByObjectId(objectId, params),
        lookupApi.getAddressTypes(language),
        lookupApi.getAddressAreaTypes(language),
        lookupApi.getCountries(language),
      ]);

      console.log('[AddressesTab] Addresses response:', addressesResponse);
      console.log('[AddressesTab] Types response:', typesResponse);
      console.log('[AddressesTab] Area types response:', areaTypesResponse);
      console.log('[AddressesTab] Countries response:', countriesResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const addressesData = addressesResponse?.data;
      const typesData = typesResponse?.data;
      const areaTypesData = areaTypesResponse?.data;
      const countriesData = countriesResponse?.data;

      // Handle both array and single object responses
      let addressesArray: Address[] = [];
      if (Array.isArray(addressesData)) {
        addressesArray = addressesData;
      } else if (addressesData && typeof addressesData === 'object') {
        // Single object returned, wrap it in an array
        addressesArray = [addressesData as Address];
      }

      setAddresses(addressesArray);
      setAddressTypes(Array.isArray(typesData) ? typesData : []);
      setAddressAreaTypes(Array.isArray(areaTypesData) ? areaTypesData : []);
      setCountries(Array.isArray(countriesData) ? countriesData : []);

      console.log('[AddressesTab] State set - addresses count:', addressesArray.length);
    } catch (err: any) {
      console.error('[AddressesTab] Error loading addresses:', err);
      setError(err?.error?.message || t('addresses.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [objectId, language, filterActive, t]);

  useEffect(() => {
    console.log('[AddressesTab] useEffect triggered');
    loadData();
  }, [loadData]);

  // Handle address update
  const handleUpdate = async (
    id: number,
    data: {
      address_type_id_old: number;
      address_type_id_new: number;
      street_address_1_old: string;
      street_address_1_new: string;
      street_address_2_old?: string;
      street_address_2_new?: string;
      address_area_type_id_old?: number;
      address_area_type_id_new?: number;
      city_old: string;
      city_new: string;
      state_province_old?: string;
      state_province_new?: string;
      postal_code_old?: string;
      postal_code_new?: string;
      country_id_old: number;
      country_id_new: number;
      is_active_old: boolean;
      is_active_new: boolean;
    }
  ) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Send the full payload with old and new values to the API
      const response = await addressApi.update(id, data);

      if (response.success) {
        // Reload addresses to get the complete updated data
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('addresses.updated'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating address:', err);
      setError(err?.error?.message || t('addresses.loadFailed'));
      throw err; // Re-throw to let AddressesTable handle it
    }
  };

  // Handle address delete (soft delete)
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await addressApi.delete(id);

      // Reload addresses to reflect the soft delete (is_active = false)
      await loadData();

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('addresses.deleted'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting address:', err);
      setError(err?.error?.message || t('addresses.loadFailed'));
      throw err; // Re-throw to let AddressesTable handle it
    }
  };

  // Handle create new address
  const handleCreateAddress = async (data: AddressFormData) => {
    setIsCreating(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await addressApi.create(objectId, {
        object_id: objectId,
        address_type_id: data.address_type_id,
        street_address_1: data.street_address_1.trim(),
        street_address_2: data.street_address_2?.trim() || undefined,
        address_area_type_id: data.address_area_type_id,
        city: data.city.trim(),
        state_province: data.state_province?.trim() || undefined,
        postal_code: data.postal_code?.trim() || undefined,
        country_id: data.country_id,
      });

      if (response.success && response.data) {
        // Close modal
        setIsModalOpen(false);

        // Reload addresses to get the complete data with proper IDs
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('addresses.created'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating address:', err);
      setError(err?.error?.message || t('addresses.loadFailed'));
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

      {/* Addresses View - Table or Card Grid */}
      {viewMode === 'grid' ? (
        <Card>
          <AddressesTable
            addresses={addresses}
            addressTypes={addressTypes}
            addressAreaTypes={addressAreaTypes}
            countries={countries}
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
              Loading addresses...
            </div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No addresses found
            </div>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                addressTypes={addressTypes}
                addressAreaTypes={addressAreaTypes}
                countries={countries}
                onEdit={(a) => {
                  // For card view, we'll need to implement a modal/form for editing
                  // For now, just log
                  console.log('Edit address:', a);
                }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* New Address Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('addresses.addNew')}
        </Button>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAddress}
        addressTypes={addressTypes}
        addressAreaTypes={addressAreaTypes}
        countries={countries}
        isSubmitting={isCreating}
      />
    </div>
  );
}
