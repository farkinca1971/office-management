/**
 * AddressesTable Component
 *
 * Features:
 * - Sortable columns (click headers to toggle asc/desc/none)
 * - Filterable by address type, area type, country, and active status
 * - Inline editing with Save/Cancel buttons
 * - Soft delete with confirmation
 * - Display address type, area type, and country name from lookup data
 * - Timestamp formatting (created_at, updated_at)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { TextColumnFilter, SelectColumnFilter, CheckboxColumnFilter } from '@/components/ui/ColumnFilters';
import { formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import type { Address } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AddressUpdatePayload {
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

interface AddressesTableProps {
  addresses: Address[];
  addressTypes: LookupItem[];
  addressAreaTypes: LookupItem[];
  countries: LookupItem[];
  onUpdate: (id: number, data: AddressUpdatePayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  filterActive: boolean | '';
  onFilterActiveChange: (value: boolean | '') => void;
}

type SortField = 'id' | 'address_type_id' | 'city' | 'country_id' | 'created_at' | 'is_active';
type SortDirection = 'asc' | 'desc' | null;

interface EditData {
  address_type_id: number;
  street_address_1: string;
  street_address_2?: string;
  address_area_type_id?: number;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_id: number;
  is_active: boolean;
}

export default function AddressesTable({
  addresses,
  addressTypes,
  addressAreaTypes,
  countries,
  onUpdate,
  onDelete,
  isLoading = false,
  error = null,
  filterActive,
  onFilterActiveChange,
}: AddressesTableProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [originalData, setOriginalData] = useState<EditData | null>(null);
  const [filterAddressType, setFilterAddressType] = useState<number | ''>('');
  const [filterCity, setFilterCity] = useState('');
  const [filterPostalCode, setFilterPostalCode] = useState('');
  const [filterCountry, setFilterCountry] = useState<number | ''>('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Get lookup name by ID
  const getLookupName = (lookupItems: LookupItem[], id?: number): string => {
    if (!id) return '-';
    const item = lookupItems.find(l => l.id === id);
    return item?.name || item?.code || t('addresses.unknown');
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null (original)
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortField('id'); // Reset to default
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4 inline ml-1" />;
    if (sortDirection === 'desc') return <ChevronDown className="h-4 w-4 inline ml-1" />;
    return null;
  };

  // Filter and sort addresses
  const filteredAndSortedAddresses = useMemo(() => {
    if (!Array.isArray(addresses)) {
      console.warn('[AddressesTable] addresses prop is not an array:', addresses);
      return [];
    }

    let result = [...addresses];

    // Apply client-side filters
    if (filterAddressType !== '') {
      result = result.filter(a => a.address_type_id === filterAddressType);
    }
    if (filterCity) {
      result = result.filter(a =>
        a.city?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }
    if (filterPostalCode) {
      result = result.filter(a =>
        a.postal_code?.toLowerCase().includes(filterPostalCode.toLowerCase())
      );
    }
    if (filterCountry !== '') {
      result = result.filter(a => a.country_id === filterCountry);
    }

    // Apply sorting
    if (sortDirection !== null) {
      result.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle lookup sorting by name
        if (sortField === 'address_type_id') {
          aValue = getLookupName(addressTypes, a.address_type_id);
          bValue = getLookupName(addressTypes, b.address_type_id);
        } else if (sortField === 'country_id') {
          aValue = getLookupName(countries, a.country_id);
          bValue = getLookupName(countries, b.country_id);
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric/boolean comparison
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [addresses, filterAddressType, filterCity, filterPostalCode, filterCountry, sortField, sortDirection, addressTypes, countries]);

  // Handle edit start
  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    const initialData: EditData = {
      address_type_id: address.address_type_id,
      street_address_1: address.street_address_1,
      street_address_2: address.street_address_2 || '',
      address_area_type_id: address.address_area_type_id,
      city: address.city,
      state_province: address.state_province || '',
      postal_code: address.postal_code || '',
      country_id: address.country_id,
      is_active: address.is_active,
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
  const handleSave = async (id: number) => {
    if (!editData || !originalData) return;

    try {
      // Send both old and new values for all editable fields
      const updatePayload: AddressUpdatePayload = {
        address_type_id_old: originalData.address_type_id,
        address_type_id_new: editData.address_type_id,
        street_address_1_old: originalData.street_address_1,
        street_address_1_new: editData.street_address_1,
        street_address_2_old: originalData.street_address_2,
        street_address_2_new: editData.street_address_2,
        address_area_type_id_old: originalData.address_area_type_id,
        address_area_type_id_new: editData.address_area_type_id,
        city_old: originalData.city,
        city_new: editData.city,
        state_province_old: originalData.state_province,
        state_province_new: editData.state_province,
        postal_code_old: originalData.postal_code,
        postal_code_new: editData.postal_code,
        country_id_old: originalData.country_id,
        country_id_new: editData.country_id,
        is_active_old: originalData.is_active,
        is_active_new: editData.is_active,
      };

      await onUpdate(id, updatePayload);
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('addresses.loading')}
      </div>
    );
  }

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {/* Header Row */}
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                {t('common.id')} <SortIcon field="id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('address_type_id')}
              >
                {t('addresses.type')} <SortIcon field="address_type_id" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('addresses.address')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('city')}
              >
                {t('addresses.city')} <SortIcon field="city" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('country_id')}
              >
                {t('addresses.country')} <SortIcon field="country_id" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('is_active')}
              >
                {t('common.active')} <SortIcon field="is_active" />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                {t('common.createdAt')} <SortIcon field="created_at" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for ID */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterAddressType}
                  onChange={(val) => setFilterAddressType(val === '' || val === 0 ? '' : val as number)}
                  options={addressTypes.map(type => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                  placeholder={t('addresses.allTypes')}
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterPostalCode}
                  onChange={setFilterPostalCode}
                  placeholder="Postal code..."
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterCity}
                  onChange={setFilterCity}
                  placeholder="City..."
                />
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterCountry}
                  onChange={(val) => setFilterCountry(val === '' || val === 0 ? '' : val as number)}
                  options={countries.map(country => ({
                    value: country.id,
                    label: country.name || country.code
                  }))}
                  placeholder={t('addresses.allCountries')}
                />
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
                {/* No filter for actions */}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedAddresses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  {t('addresses.noAddresses')}
                </td>
              </tr>
            ) : (
              filteredAndSortedAddresses.map((address) => {
                const isEditing = editingId === address.id;
                const fullAddress = [
                  address.street_address_1,
                  address.street_address_2,
                  address.postal_code,
                ].filter(Boolean).join(', ');

                return (
                  <tr key={address.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {address.id}
                    </td>

                    {/* Address Type */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Select
                          value={editData?.address_type_id.toString() || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, address_type_id: Number(e.target.value) } : null)}
                          className="w-full"
                          options={addressTypes.map((type) => ({
                            value: type.id,
                            label: type.name || type.code
                          }))}
                        />
                      ) : (
                        getLookupName(addressTypes, address.address_type_id)
                      )}
                    </td>

                    {/* Address - condensed view in non-edit mode */}
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="text"
                            value={editData?.street_address_1 || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, street_address_1: e.target.value } : null)}
                            placeholder="Street Address 1"
                            className="w-full"
                          />
                          <Input
                            type="text"
                            value={editData?.street_address_2 || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, street_address_2: e.target.value } : null)}
                            placeholder="Street Address 2"
                            className="w-full"
                          />
                          <Input
                            type="text"
                            value={editData?.postal_code || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, postal_code: e.target.value } : null)}
                            placeholder="Postal Code"
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <span className="text-sm">{fullAddress}</span>
                      )}
                    </td>

                    {/* City */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editData?.city || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, city: e.target.value } : null)}
                          className="w-full"
                        />
                      ) : (
                        address.city
                      )}
                    </td>

                    {/* Country */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {isEditing ? (
                        <Select
                          value={editData?.country_id.toString() || ''}
                          onChange={(e) => setEditData(prev => prev ? { ...prev, country_id: Number(e.target.value) } : null)}
                          className="w-full"
                          options={countries.map((country) => ({
                            value: country.id,
                            label: country.name || country.code
                          }))}
                        />
                      ) : (
                        getLookupName(countries, address.country_id)
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          address.is_active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {address.is_active ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>

                    {/* Created At */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(address.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => handleSave(address.id)}
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
                            onClick={() => handleEdit(address)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === address.id ? (
                            <>
                              <span className="text-xs text-gray-600 dark:text-gray-400">Delete?</span>
                              <Button
                                variant="ghost"
                                onClick={() => handleDelete(address.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Confirm Delete"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(address.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
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

      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('addresses.showing')} {filteredAndSortedAddresses.length} {t('addresses.of')} {addresses.length} {t('persons.addresses').toLowerCase()}
      </div>
    </div>
  );
}
