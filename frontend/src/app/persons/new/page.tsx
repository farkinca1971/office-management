/**
 * Add New Person Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, User } from 'lucide-react';
import { personApi } from '@/lib/api/persons';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';
import type { CreatePersonRequest } from '@/types/entities';

export default function NewPersonPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePersonRequest>({
    object_type_id: 0,
    object_status_id: 0,
    first_name: '',
    middle_name: '',
    last_name: '',
    mother_name: '',
    sex_id: undefined,
    salutation_id: undefined,
    birth_date: '',
  });

  // Lookup data
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [sexes, setSexes] = useState<LookupItem[]>([]);
  const [salutations, setSalutations] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes, sexesRes, salutationsRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getSexes(language),
          lookupApi.getSalutations(language),
        ]);

        // Extract data from responses
        const types = typesRes?.data || typesRes || [];
        const statuses = statusesRes?.data || statusesRes || [];
        const sexesList = sexesRes?.data || sexesRes || [];
        const salutationsList = salutationsRes?.data || salutationsRes || [];

        setObjectTypes(Array.isArray(types) ? types : []);
        setObjectStatuses(Array.isArray(statuses) ? statuses : []);
        setSexes(Array.isArray(sexesList) ? sexesList : []);
        setSalutations(Array.isArray(salutationsList) ? salutationsList : []);

        // Find Person object type and set as default
        const personType = (Array.isArray(types) ? types : []).find(
          (t: LookupItem) => t.code?.toLowerCase() === 'person'
        );
        if (personType) {
          setFormData(prev => ({ ...prev, object_type_id: personType.id }));
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

  // Filter statuses to only show person-related statuses
  const filteredStatuses = objectStatuses.filter(status =>
    status.is_active && status.code?.toLowerCase().startsWith('person_')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (
        ['object_type_id', 'object_status_id', 'sex_id', 'salutation_id'].includes(name)
          ? parseInt(value, 10)
          : value
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.first_name.trim()) {
      setError(t('forms.person.firstNameRequired'));
      return;
    }
    if (!formData.last_name.trim()) {
      setError(t('forms.person.lastNameRequired'));
      return;
    }
    if (!formData.object_status_id) {
      setError(t('forms.statusRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await personApi.create(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/persons');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create person:', err);
      setError(err?.error?.message || err?.message || t('forms.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get translation text from lookup item
  const getTranslationText = (item: LookupItem): string => {
    return item.name || item.code;
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
        <Link href="/persons">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('forms.person.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('forms.person.subtitle')}</p>
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
              message={t('forms.person.createdSuccess')}
            />
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('forms.person.basicInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.salutation')}
                </label>
                <select
                  name="salutation_id"
                  value={formData.salutation_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.person.selectSalutation')}</option>
                  {salutations.filter(s => s.is_active).map(salutation => (
                    <option key={salutation.id} value={salutation.id}>
                      {getTranslationText(salutation)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.sex')}
                </label>
                <select
                  name="sex_id"
                  value={formData.sex_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.person.selectSex')}</option>
                  {sexes.filter(s => s.is_active).map(sex => (
                    <option key={sex.id} value={sex.id}>
                      {getTranslationText(sex)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.firstName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder={t('forms.person.enterFirstName')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.middleName')}
                </label>
                <Input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name || ''}
                  onChange={handleInputChange}
                  placeholder={t('forms.person.enterMiddleName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.lastName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder={t('forms.person.enterLastName')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.motherName')}
                </label>
                <Input
                  type="text"
                  name="mother_name"
                  value={formData.mother_name || ''}
                  onChange={handleInputChange}
                  placeholder={t('forms.person.enterMotherName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.person.birthDate')}
                </label>
                <Input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date || ''}
                  onChange={handleInputChange}
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
            <Link href="/persons">
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
              {t('forms.person.createButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
