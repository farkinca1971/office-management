/**
 * Create New Transaction Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, ArrowLeftRight } from 'lucide-react';
import { transactionApi } from '@/lib/api/transactions';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';
import type { CreateTransactionRequest } from '@/types/entities';

export default function NewTransactionPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateTransactionRequest>({
    object_type_id: 0,
    object_status_id: 0,
    transaction_type_id: 0,
    transaction_date_start: new Date().toISOString().split('T')[0],
    transaction_date_end: '',
    note: '',
  });

  // Lookup data
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes, transactionTypesRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getTransactionTypes(language),
        ]);

        const types = typesRes?.data || typesRes || [];
        const statuses = statusesRes?.data || statusesRes || [];
        const txTypes = transactionTypesRes?.data || transactionTypesRes || [];

        setObjectStatuses(Array.isArray(statuses) ? statuses : []);
        setTransactionTypes(Array.isArray(txTypes) ? txTypes : []);

        // Find Transaction object type and set as default
        const transactionType = (Array.isArray(types) ? types : []).find(
          (t: LookupItem) => t.code?.toLowerCase() === 'object_type_transaction' || t.code?.toLowerCase() === 'transaction'
        );
        if (transactionType) {
          setFormData(prev => ({ ...prev, object_type_id: transactionType.id }));
        }
      } catch (err) {
        console.error('Failed to load lookup data:', err);
        setError(t('forms.loadFailed'));
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [t, language]);

  // Filter statuses to only show transaction-related statuses
  const filteredStatuses = objectStatuses.filter(status =>
    status.is_active && status.code?.toLowerCase().startsWith('transaction_')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['object_type_id', 'object_status_id', 'transaction_type_id'].includes(name)
        ? parseInt(value, 10)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.transaction_type_id) {
      setError(t('forms.transaction.transactionTypeRequired'));
      return;
    }
    if (!formData.transaction_date_start) {
      setError(t('forms.transaction.startDateRequired'));
      return;
    }
    if (!formData.object_status_id) {
      setError(t('forms.statusRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await transactionApi.create(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/transactions');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create transaction:', err);
      setError(err?.error?.message || err?.message || t('forms.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTranslationText = (item: LookupItem): string => {
    // Prefer the 'name' property which contains the translation for the current language
    if (item.name) {
      return item.name;
    }
    // Fall back to translations array if name is not available
    if (item.translations && item.translations.length > 0) {
      return item.translations[0].text || item.code;
    }
    // Last resort: use the code
    return item.code;
  };

  if (loadingLookups) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/transactions">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('forms.transaction.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('forms.transaction.subtitle')}</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          {success && (
            <Alert
              type="success"
              message={t('forms.transaction.createdSuccess')}
            />
          )}

          {/* Transaction Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              {t('forms.transaction.transactionDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.transaction.transactionType')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="transaction_type_id"
                  value={formData.transaction_type_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.transaction.selectTransactionType')}</option>
                  {transactionTypes.filter(t => t.is_active).map(type => (
                    <option key={type.id} value={type.id}>
                      {getTranslationText(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.transaction.startDate')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="transaction_date_start"
                  value={formData.transaction_date_start || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.transaction.endDate')}
                </label>
                <Input
                  type="date"
                  name="transaction_date_end"
                  value={formData.transaction_date_end || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('forms.notes')}
            </label>
            <textarea
              name="note"
              value={formData.note || ''}
              onChange={handleInputChange}
              placeholder={t('forms.enterNotes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* System Fields */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('forms.systemSettings')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.status')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="object_status_id"
                  value={formData.object_status_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.selectStatus')}</option>
                  {filteredStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {getTranslationText(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link href="/transactions">
              <Button type="button" variant="secondary">
                {t('common.cancel')}
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || success}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {t('forms.transaction.createButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
