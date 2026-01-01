/**
 * AddressFormModal Component - Modal for creating/editing addresses
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { LookupItem } from '@/types/common';

export interface AddressFormData {
  address_type_id: number;
  street_address_1: string;
  street_address_2?: string;
  address_area_type_id?: number;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_id: number;
}

export interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<void>;
  addressTypes: LookupItem[];
  addressAreaTypes: LookupItem[];
  countries: LookupItem[];
  isSubmitting?: boolean;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addressTypes,
  addressAreaTypes,
  countries,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<AddressFormData>({
    address_type_id: 0,
    street_address_1: '',
    street_address_2: '',
    address_area_type_id: undefined,
    city: '',
    state_province: '',
    postal_code: '',
    country_id: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const handleChange = (field: keyof AddressFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.address_type_id) {
      newErrors.address_type_id = t('addresses.typeRequired');
    }

    if (!formData.street_address_1.trim()) {
      newErrors.street_address_1 = t('addresses.streetAddress1Required');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('addresses.cityRequired');
    }

    if (!formData.country_id) {
      newErrors.country_id = t('addresses.countryRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        address_type_id: 0,
        street_address_1: '',
        street_address_2: '',
        address_area_type_id: undefined,
        city: '',
        state_province: '',
        postal_code: '',
        country_id: 0,
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit address:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      address_type_id: 0,
      street_address_1: '',
      street_address_2: '',
      address_area_type_id: undefined,
      city: '',
      state_province: '',
      postal_code: '',
      country_id: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('addresses.addNew')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.addressType')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.address_type_id.toString()}
                onChange={(e) => handleChange('address_type_id', e.target.value ? parseInt(e.target.value) : 0)}
                disabled={isSubmitting}
                options={addressTypes
                  .filter(type => type.is_active)
                  .map((type) => ({
                    value: type.id,
                    label: type.name || type.code
                  }))}
                placeholder={t('addresses.selectAddressType')}
              />
              {errors.address_type_id && (
                <p className="mt-1 text-sm text-red-500">{errors.address_type_id}</p>
              )}
            </div>

            {/* Street Address 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.streetAddress1')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.street_address_1}
                onChange={(e) => handleChange('street_address_1', e.target.value)}
                placeholder={t('addresses.streetAddress1Placeholder')}
                disabled={isSubmitting}
                className={errors.street_address_1 ? 'border-red-500' : ''}
              />
              {errors.street_address_1 && (
                <p className="mt-1 text-sm text-red-500">{errors.street_address_1}</p>
              )}
            </div>

            {/* Street Address 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.streetAddress2')}
              </label>
              <Input
                type="text"
                value={formData.street_address_2 || ''}
                onChange={(e) => handleChange('street_address_2', e.target.value)}
                placeholder={t('addresses.streetAddress2Placeholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Address Area Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.addressAreaType')}
              </label>
              <Select
                value={formData.address_area_type_id?.toString() || ''}
                onChange={(e) => handleChange('address_area_type_id', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={isSubmitting}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.city')} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder={t('addresses.cityPlaceholder')}
                disabled={isSubmitting}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            {/* State/Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.stateProvince')}
              </label>
              <Input
                type="text"
                value={formData.state_province || ''}
                onChange={(e) => handleChange('state_province', e.target.value)}
                placeholder={t('addresses.stateProvincePlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.postalCode')}
              </label>
              <Input
                type="text"
                value={formData.postal_code || ''}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder={t('addresses.postalCodePlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('addresses.country')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.country_id.toString()}
                onChange={(e) => handleChange('country_id', e.target.value ? parseInt(e.target.value) : 0)}
                disabled={isSubmitting}
                options={countries
                  .filter(country => country.is_active)
                  .map((country) => ({
                    value: country.id,
                    label: country.name || country.code
                  }))}
                placeholder={t('addresses.selectCountry')}
              />
              {errors.country_id && (
                <p className="mt-1 text-sm text-red-500">{errors.country_id}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('addresses.creating') : t('addresses.createAddress')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
