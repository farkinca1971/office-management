/**
 * NoteFormModal Component - Modal for creating/editing notes
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X } from 'lucide-react';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

export interface NoteFormData {
  note_type_id?: number;
  subject: string;
  note_text: string;
  is_pinned?: boolean;
}

export interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NoteFormData) => Promise<void>;
  noteTypes: LookupItem[];
  isSubmitting?: boolean;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  noteTypes,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<NoteFormData>({
    subject: '',
    note_text: '',
    is_pinned: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof NoteFormData, string>>>({});

  const handleChange = (field: keyof NoteFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof NoteFormData, string>> = {};

    if (!formData.note_text.trim()) {
      newErrors.note_text = t('notes.noteTextRequired');
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
        subject: '',
        note_text: '',
        is_pinned: false,
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to submit note:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      subject: '',
      note_text: '',
      is_pinned: false,
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
            {t('notes.addNew')}
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
          {/* Note Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('notes.type')}
            </label>
            <select
              value={formData.note_type_id?.toString() || ''}
              onChange={(e) => handleChange('note_type_id', e.target.value ? parseInt(e.target.value) : undefined as any)}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">{t('notes.selectType')}</option>
              {noteTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name || type.code}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('notes.subject')}
            </label>
            <Input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder={t('notes.subjectPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          {/* Note Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('notes.noteText')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.note_text}
              onChange={(e) => handleChange('note_text', e.target.value)}
              placeholder={t('notes.noteTextPlaceholder')}
              disabled={isSubmitting}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${
                errors.note_text ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.note_text && (
              <p className="mt-1 text-sm text-red-500">{errors.note_text}</p>
            )}
          </div>

          {/* Is Pinned */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_pinned"
              checked={formData.is_pinned || false}
              onChange={(e) => handleChange('is_pinned', e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="is_pinned" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('notes.pinNote')}
            </label>
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
              {isSubmitting ? t('notes.creating') : t('notes.createNote')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
