/**
 * Contact Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { LookupItem } from '@/types/common';

export default function ContactTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const language = useLanguageStore((state) => state.language);
  const { t } = useTranslation();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getContactTypes(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load contact types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load contact types');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.createContactType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create contact type');
    }
  };

  const handleUpdate = async (id: number, item: { 
    code?: string; 
    is_active?: boolean; 
    text?: string; 
    language_id?: number; 
    object_type_id?: number; 
    update_all_languages?: boolean | number; 
    old_code?: string;
    new_code?: string;
    old_is_active?: boolean;
    new_is_active?: boolean;
    old_object_type_id?: number;
    new_object_type_id?: number;
    old_text?: string; 
    new_text?: string;
  }) => {
    // Handle update_all_languages if needed (check for both boolean and number)
    const shouldUpdateAll = item.update_all_languages === true || item.update_all_languages === 1;
    if (shouldUpdateAll && item.new_text && item.new_code) {
      // Update translations for all languages
      try {
        const languagesResponse = await lookupApi.getLanguages();
        if (languagesResponse.success) {
          const languages = languagesResponse.data;
          // Update translation for all languages
          const updatePromises = languages.map(lang => 
            lookupApi.updateTranslation(item.new_code!, lang.id, { text: item.new_text! })
          );
          await Promise.all(updatePromises);
        }
      } catch (err) {
        console.error('Failed to update translations for all languages:', err);
        // Continue with the update even if all languages update fails
      }
    }
    
    // Request body only includes old/new value pairs, update_all_languages, and language_id
    const updatePayload = {
      update_all_languages: shouldUpdateAll ? 1 : 0,
      language_id: item.language_id,
      old_code: item.old_code !== undefined ? item.old_code : '',
      new_code: item.new_code !== undefined ? item.new_code : '',
      old_is_active: item.old_is_active !== undefined ? item.old_is_active : true,
      new_is_active: item.new_is_active !== undefined ? item.new_is_active : true,
      old_object_type_id: item.old_object_type_id !== undefined ? item.old_object_type_id : 0,
      new_object_type_id: item.new_object_type_id !== undefined ? item.new_object_type_id : 0,
      old_text: item.old_text !== undefined ? item.old_text : '',
      new_text: item.new_text !== undefined ? item.new_text : ''
    };
    
    const response = await lookupApi.updateContactType(id, updatePayload);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update contact type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteContactType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete contact type');
    }
  };

  React.useEffect(() => {
    if (data.length > 0) {
      const maxPage = Math.ceil(data.length / perPage) || 1;
      if (page > maxPage || page < 1) {
        setPage(1);
      }
    }
  }, [data.length, perPage]);

  return (
    <LookupTable
      title={t('nav.contactTypes')}
      data={data}
      isLoading={isLoading}
      error={error}
      onLoad={loadData}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      pagination={data.length > 0 ? {
        page,
        perPage,
        total: data.length,
        totalPages: Math.ceil(data.length / perPage),
        onPageChange: setPage,
        onPerPageChange: (newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        },
      } : undefined}
    />
  );
}

