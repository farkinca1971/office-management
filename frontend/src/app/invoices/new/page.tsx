/**
 * Create New Invoice Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { invoiceApi } from '@/lib/api/invoices';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';
import type { CreateInvoiceRequest } from '@/types/entities';

export default function NewInvoicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    object_type_id: 0,
    object_status_id: 0,
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency_id: 0,
    netto_amount: 0,
    tax: 0,
    final_amount: 0,
    note: '',
    reference_number: '',
  });

  // Lookup data
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [currencies, setCurrencies] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes, currenciesRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getCurrencies(language),
        ]);

        const types = typesRes?.data || typesRes || [];
        const statuses = statusesRes?.data || statusesRes || [];
        const currenciesList = currenciesRes?.data || currenciesRes || [];

        setObjectStatuses(Array.isArray(statuses) ? statuses : []);
        setCurrencies(Array.isArray(currenciesList) ? currenciesList : []);

        // Find Document object type and set as default (invoices are documents)
        const documentType = (Array.isArray(types) ? types : []).find(
          (t: LookupItem) => t.code?.toLowerCase() === 'document'
        );
        if (documentType) {
          setFormData(prev => ({ ...prev, object_type_id: documentType.id }));
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

  // Filter statuses to only show document-related statuses
  const filteredStatuses = objectStatuses.filter(status =>
    status.is_active && status.code?.toLowerCase().startsWith('document_')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['object_type_id', 'object_status_id', 'currency_id'].includes(name)
        ? parseInt(value, 10)
        : ['netto_amount', 'tax', 'final_amount'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  // Auto-calculate final amount
  useEffect(() => {
    const netto = formData.netto_amount || 0;
    const tax = formData.tax || 0;
    setFormData(prev => ({
      ...prev,
      final_amount: netto + tax,
    }));
  }, [formData.netto_amount, formData.tax]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.invoice_number.trim()) {
      setError(t('forms.invoice.invoiceNumberRequired'));
      return;
    }
    if (!formData.issue_date) {
      setError(t('forms.invoice.issueDateRequired'));
      return;
    }
    if (!formData.currency_id) {
      setError(t('forms.invoice.currencyRequired'));
      return;
    }
    if (!formData.object_status_id) {
      setError(t('forms.statusRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await invoiceApi.create(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/invoices');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create invoice:', err);
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
        <Link href="/invoices">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('forms.invoice.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('forms.invoice.subtitle')}</p>
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
              message={t('forms.invoice.createdSuccess')}
            />
          )}

          {/* Invoice Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('forms.invoice.invoiceDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.invoiceNumber')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleInputChange}
                  placeholder={t('forms.invoice.enterInvoiceNumber')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.referenceNumber')}
                </label>
                <Input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number || ''}
                  onChange={handleInputChange}
                  placeholder={t('forms.invoice.enterReferenceNumber')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.currency')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="currency_id"
                  value={formData.currency_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.invoice.selectCurrency')}</option>
                  {currencies.filter(c => c.is_active).map(currency => (
                    <option key={currency.id} value={currency.id}>
                      {currency.code} - {getTranslationText(currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.issueDate')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.dueDate')}
                </label>
                <Input
                  type="date"
                  name="due_date"
                  value={formData.due_date || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('forms.invoice.amounts')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.netAmount')}
                </label>
                <Input
                  type="number"
                  name="netto_amount"
                  value={formData.netto_amount || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.tax')}
                </label>
                <Input
                  type="number"
                  name="tax"
                  value={formData.tax || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.invoice.finalAmount')}
                </label>
                <Input
                  type="number"
                  name="final_amount"
                  value={formData.final_amount || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled
                  className="bg-gray-100 dark:bg-gray-700"
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
            <Link href="/invoices">
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
              {t('forms.invoice.createButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
