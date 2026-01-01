/**
 * IdentificationFormModal Component - Modal for creating/editing identifications
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import type { LookupItem } from '@/types/common';

export interface IdentificationFormData {
  identification_type_id: number;
  identification_value: string;
}

export interface IdentificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IdentificationFormData) => Promise<void>;
  identificationTypes: LookupItem[];
  isSubmitting?: boolean;
}

export const IdentificationFormModal: React.FC<IdentificationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  identificationTypes,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<IdentificationFormData>({
    identification_type_id: 0,
    identification_value: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IdentificationFormData, string>>>({});

  const handleChange = (field: keyof IdentificationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof IdentificationFormData, string>> = {};

    if (!formData.identification_type_id) {
      newErrors.identification_type_id = t('identifications.typeRequired');
    }

    if (!formData.identification_value.trim()) {
      newErrors.identification_value = t('identifications.valueRequired');
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
        identification_type_id: 0,
        identification_value: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit identification:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      identification_type_id: 0,
      identification_value: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('identifications.addNew')}
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
          {/* Identification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('identifications.identificationType')} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.identification_type_id.toString()}
              onChange={(e) => handleChange('identification_type_id', e.target.value ? parseInt(e.target.value) : 0)}
              disabled={isSubmitting}
              options={identificationTypes
                .filter(type => type.is_active)
                .map((type) => ({
                  value: type.id,
                  label: type.name || type.code
                }))}
              placeholder={t('forms.selectStatus')}
            />
            {errors.identification_type_id && (
              <p className="mt-1 text-sm text-red-500">{errors.identification_type_id}</p>
            )}
          </div>

          {/* Identification Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('identifications.identificationValue')} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.identification_value}
              onChange={(e) => handleChange('identification_value', e.target.value)}
              placeholder={t('identifications.valuePlaceholder')}
              disabled={isSubmitting}
              className={errors.identification_value ? 'border-red-500' : ''}
            />
            {errors.identification_value && (
              <p className="mt-1 text-sm text-red-500">{errors.identification_value}</p>
            )}
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
              {isSubmitting ? t('identifications.creating') : t('identifications.createIdentification')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
