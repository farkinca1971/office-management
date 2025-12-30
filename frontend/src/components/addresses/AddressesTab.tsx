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
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import AddressesTable from './AddressesTable';
import { AddressCard } from './AddressCard';
import { addressApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';
import type { Address } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AddressesTabProps {
  objectId: number;
}

export default function AddressesTab({ objectId }: AddressesTabProps) {
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

  // New address form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAddressType, setNewAddressType] = useState<number | ''>('');
  const [newStreetAddress1, setNewStreetAddress1] = useState('');
  const [newStreetAddress2, setNewStreetAddress2] = useState('');
  const [newAddressAreaType, setNewAddressAreaType] = useState<number | ''>('');
  const [newCity, setNewCity] = useState('');
  const [newStateProvince, setNewStateProvince] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState<number | ''>('');
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
      const params: { is_active?: boolean } = {};
      if (filterActive !== '') {
        params.is_active = filterActive;
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
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAddressType || !newStreetAddress1.trim() || !newCity.trim() || !newCountry) {
      setError(t('common.fillRequiredFields'));
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      setSuccessMessage(null);

      const response = await addressApi.create(objectId, {
        object_id: objectId,
        address_type_id: Number(newAddressType),
        street_address_1: newStreetAddress1.trim(),
        street_address_2: newStreetAddress2.trim() || undefined,
        address_area_type_id: newAddressAreaType ? Number(newAddressAreaType) : undefined,
        city: newCity.trim(),
        state_province: newStateProvince.trim() || undefined,
        postal_code: newPostalCode.trim() || undefined,
        country_id: Number(newCountry),
      });

      if (response.success && response.data) {
        // Reload addresses to get the complete data with proper IDs
        await loadData();

        // Reset form
        setNewAddressType('');
        setNewStreetAddress1('');
        setNewStreetAddress2('');
        setNewAddressAreaType('');
        setNewCity('');
        setNewStateProvince('');
        setNewPostalCode('');
        setNewCountry('');
        setShowNewForm(false);
        setSuccessMessage(t('addresses.created'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating address:', err);
      setError(err?.error?.message || t('addresses.loadFailed'));
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

      {/* New Address Section */}
      <div className="border-t pt-4">
        {!showNewForm ? (
          <Button
            variant="primary"
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('addresses.addNew')}
          </Button>
        ) : (
          <Card>
            <form onSubmit={handleCreateAddress} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('addresses.newAddress')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.addressType')} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newAddressType.toString()}
                    onChange={(e) => setNewAddressType(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    options={addressTypes
                      .filter(type => type.is_active)
                      .map((type) => ({
                        value: type.id,
                        label: type.name || type.code
                      }))}
                    placeholder={t('addresses.selectAddressType')}
                  />
                </div>

                {/* Street Address 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.streetAddress1')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newStreetAddress1}
                    onChange={(e) => setNewStreetAddress1(e.target.value)}
                    placeholder={t('addresses.streetAddress1Placeholder')}
                    required
                  />
                </div>

                {/* Street Address 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.streetAddress2')}
                  </label>
                  <Input
                    type="text"
                    value={newStreetAddress2}
                    onChange={(e) => setNewStreetAddress2(e.target.value)}
                    placeholder={t('addresses.streetAddress2Placeholder')}
                  />
                </div>

                {/* Address Area Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.addressAreaType')}
                  </label>
                  <Select
                    value={newAddressAreaType.toString()}
                    onChange={(e) => setNewAddressAreaType(e.target.value === '' ? '' : Number(e.target.value))}
                    options={[
                      { value: '', label: t('addresses.none') },
                      ...addressAreaTypes
                        .filter(type => type.is_active)
                        .map((type) => ({
                          value: type.id,
                          label: type.name || type.code
                        }))
                    ]}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.city')} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder={t('addresses.cityPlaceholder')}
                    required
                  />
                </div>

                {/* State/Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.stateProvince')}
                  </label>
                  <Input
                    type="text"
                    value={newStateProvince}
                    onChange={(e) => setNewStateProvince(e.target.value)}
                    placeholder={t('addresses.stateProvincePlaceholder')}
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.postalCode')}
                  </label>
                  <Input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder={t('addresses.postalCodePlaceholder')}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('addresses.country')} <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newCountry.toString()}
                    onChange={(e) => setNewCountry(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    options={countries
                      .filter(country => country.is_active)
                      .map((country) => ({
                        value: country.id,
                        label: country.name || country.code
                      }))}
                    placeholder={t('addresses.selectCountry')}
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
                  {isCreating ? t('addresses.creating') : t('addresses.createAddress')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewAddressType('');
                    setNewStreetAddress1('');
                    setNewStreetAddress2('');
                    setNewAddressAreaType('');
                    setNewCity('');
                    setNewStateProvince('');
                    setNewPostalCode('');
                    setNewCountry('');
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
