/**
 * Add New Company Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { companyApi } from '@/lib/api/companies';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';
import type { CreateCompanyRequest } from '@/types/entities';

export default function NewCompanyPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    object_type_id: 0,
    object_status_id: 0,
    company_id: '',
    company_name: '',
  });

  // Lookup data
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
        ]);

        const types = typesRes?.data || typesRes || [];
        const statuses = statusesRes?.data || statusesRes || [];

        setObjectTypes(Array.isArray(types) ? types : []);
        setObjectStatuses(Array.isArray(statuses) ? statuses : []);

        // Find Company object type and set as default
        const companyType = (Array.isArray(types) ? types : []).find(
          (t: LookupItem) => t.code?.toLowerCase() === 'company'
        );
        if (companyType) {
          setFormData(prev => ({ ...prev, object_type_id: companyType.id }));
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

  // Filter statuses to only show company-related statuses
  const filteredStatuses = objectStatuses.filter(status =>
    status.is_active && status.code?.toLowerCase().startsWith('company_')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['object_type_id', 'object_status_id'].includes(name)
        ? parseInt(value, 10)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.company_name.trim()) {
      setError(t('forms.company.companyNameRequired'));
      return;
    }
    if (!formData.company_id.trim()) {
      setError(t('forms.company.companyIdRequired'));
      return;
    }
    if (!formData.object_status_id) {
      setError(t('forms.statusRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await companyApi.create(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/companies');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create company:', err);
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
        <Link href="/companies">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('forms.company.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('forms.company.subtitle')}</p>
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
              message={t('forms.company.createdSuccess')}
            />
          )}

          {/* Company Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t('forms.company.companyInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.company.companyId')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  placeholder={t('forms.company.enterCompanyId')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.company.companyName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder={t('forms.company.enterCompanyName')}
                  required
                />
              </div>
            </div>
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
            <Link href="/companies">
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
              {t('forms.company.createButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
