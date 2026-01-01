/**
 * ContactFormModal Component - Modal for creating/editing contacts
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { X } from 'lucide-react';
import type { LookupItem } from '@/types/common';

export interface ContactFormData {
  contact_type_id: number;
  contact_value: string;
}

export interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
  contactTypes: LookupItem[];
  isSubmitting?: boolean;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contactTypes,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    contact_type_id: 0,
    contact_value: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (field: keyof ContactFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.contact_type_id) {
      newErrors.contact_type_id = 'Contact type is required';
    }

    if (!formData.contact_value.trim()) {
      newErrors.contact_value = 'Contact value is required';
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
        contact_type_id: 0,
        contact_value: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit contact:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      contact_type_id: 0,
      contact_value: '',
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
            Add New Contact
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
          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.contact_type_id.toString()}
              onChange={(e) => handleChange('contact_type_id', e.target.value ? parseInt(e.target.value) : 0)}
              disabled={isSubmitting}
              options={contactTypes
                .filter(type => type.is_active)
                .map((type) => ({
                  value: type.id,
                  label: type.name || type.code
                }))}
              placeholder="Select contact type..."
            />
            {errors.contact_type_id && (
              <p className="mt-1 text-sm text-red-500">{errors.contact_type_id}</p>
            )}
          </div>

          {/* Contact Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Value <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.contact_value}
              onChange={(e) => handleChange('contact_value', e.target.value)}
              placeholder="e.g., email@example.com or +1-555-1234"
              disabled={isSubmitting}
              className={errors.contact_value ? 'border-red-500' : ''}
            />
            {errors.contact_value && (
              <p className="mt-1 text-sm text-red-500">{errors.contact_value}</p>
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Contact'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
