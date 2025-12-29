/**
 * Add New Employee Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import { employeeApi } from '@/lib/api/employees';
import { personApi } from '@/lib/api/persons';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';
import type { Person, CreateEmployeeRequest } from '@/types/entities';

export default function NewEmployeePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateEmployeeRequest>({
    object_type_id: 0,
    object_status_id: 0,
    person_id: 0,
  });

  // Lookup data
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes, personsRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
          personApi.getAll(),
        ]);

        const types = typesRes?.data || typesRes || [];
        const statuses = statusesRes?.data || statusesRes || [];
        const personsList = personsRes?.data || personsRes || [];

        setObjectTypes(Array.isArray(types) ? types : []);
        setObjectStatuses(Array.isArray(statuses) ? statuses : []);
        setPersons(Array.isArray(personsList) ? personsList : []);

        // Find Employee object type and set as default
        const employeeType = (Array.isArray(types) ? types : []).find(
          (t: LookupItem) => t.code?.toLowerCase() === 'employee'
        );
        if (employeeType) {
          setFormData(prev => ({ ...prev, object_type_id: employeeType.id }));
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

  // Filter statuses to only show employee-related statuses
  const filteredStatuses = objectStatuses.filter(status =>
    status.is_active && status.code?.toLowerCase().startsWith('employee_')
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.person_id) {
      setError(t('forms.employee.personRequired'));
      return;
    }
    if (!formData.object_status_id) {
      setError(t('forms.statusRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await employeeApi.create(formData);
      if (response) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/employees');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to create employee:', err);
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

  const getPersonName = (person: Person): string => {
    const parts = [person.first_name, person.middle_name, person.last_name].filter(Boolean);
    return parts.join(' ') || `Person #${person.id}`;
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
        <Link href="/employees">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('forms.employee.title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('forms.employee.subtitle')}</p>
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
              message={t('forms.employee.createdSuccess')}
            />
          )}

          {/* Employee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('forms.employee.employeeInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('forms.employee.person')} <span className="text-red-500">*</span>
                </label>
                <select
                  name="person_id"
                  value={formData.person_id || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('forms.employee.selectPerson')}</option>
                  {persons.map(person => (
                    <option key={person.id} value={person.id}>
                      {getPersonName(person)}
                    </option>
                  ))}
                </select>
                {persons.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                    {t('forms.employee.noPersons')}
                  </p>
                )}
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
            <Link href="/employees">
              <Button type="button" variant="secondary">
                {t('common.cancel')}
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || success || persons.length === 0}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {t('forms.employee.createButton')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
