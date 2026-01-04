/**
 * DocumentFormModal Component - Modal for creating/editing documents
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';
import type { LookupItem } from '@/types/common';

export interface DocumentFormData {
  title: string;
  description?: string;
  document_type_id?: number;
  document_date?: string;
  document_number?: string;
  expiry_date?: string;
  issuer?: string;
  reference_number?: string;
  external_reference?: string;
}

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  documentTypes: LookupItem[];
  isSubmitting?: boolean;
  initialData?: DocumentFormData;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  documentTypes,
  isSubmitting = false,
  initialData,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<DocumentFormData>({
    title: '',
    description: '',
    document_type_id: undefined,
    document_date: '',
    document_number: '',
    expiry_date: '',
    issuer: '',
    reference_number: '',
    external_reference: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        title: '',
        description: '',
        document_type_id: undefined,
        document_date: '',
        document_number: '',
        expiry_date: '',
        issuer: '',
        reference_number: '',
        external_reference: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError(t('documents.titleRequired'));
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.error?.message || t('documents.saveFailed'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {initialData ? t('documents.editDocument') : t('documents.addNew')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('documents.title')} *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('documents.titlePlaceholder')}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('documents.description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('documents.descriptionPlaceholder')}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.documentType')}
                  </label>
                  <select
                    value={formData.document_type_id?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_type_id: parseInt(e.target.value) || undefined }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">{t('forms.select')}</option>
                    {documentTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name || type.code}</option>
                    ))}
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.documentNumber')}
                  </label>
                  <Input
                    type="text"
                    value={formData.document_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                    placeholder={t('documents.documentNumberPlaceholder')}
                  />
                </div>

                {/* Document Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.documentDate')}
                  </label>
                  <Input
                    type="date"
                    value={formData.document_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_date: e.target.value }))}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.expiryDate')}
                  </label>
                  <Input
                    type="date"
                    value={formData.expiry_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                  />
                </div>

                {/* Issuer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.issuer')}
                  </label>
                  <Input
                    type="text"
                    value={formData.issuer || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder={t('documents.issuerPlaceholder')}
                  />
                </div>

                {/* Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.referenceNumber')}
                  </label>
                  <Input
                    type="text"
                    value={formData.reference_number || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                    placeholder={t('documents.referenceNumberPlaceholder')}
                  />
                </div>
              </div>

              {/* External Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('documents.externalReference')}
                </label>
                <Input
                  type="text"
                  value={formData.external_reference || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, external_reference: e.target.value }))}
                  placeholder={t('documents.externalReferencePlaceholder')}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('forms.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('forms.saving') : (initialData ? t('forms.save') : t('forms.create'))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
