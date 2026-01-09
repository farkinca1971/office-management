/**
 * Object Relation Types Lookup Page
 */

'use client';

import React from 'react';
import { ObjectRelationTypesTable } from '@/components/ui/ObjectRelationTypesTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { LookupItem } from '@/types/common';

export default function ObjectRelationTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [objectTypes, setObjectTypes] = React.useState<LookupItem[]>([]);
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
      const [relationTypesResponse, typesResponse] = await Promise.all([
        lookupApi.getObjectRelationTypes(language),
        lookupApi.getObjectTypes(language)
      ]);
      
      if (relationTypesResponse.success) {
        // Enrich data with mirrored type codes for display
        const enrichedData = relationTypesResponse.data.map((item: any) => {
          if (item.mirrored_type_id) {
            const mirroredType = relationTypesResponse.data.find((rt: any) => rt.id === item.mirrored_type_id);
            if (mirroredType) {
              item.mirrored_type_code = mirroredType.code;
            }
          }
          return item;
        });
        setData(enrichedData);
      } else {
        setError('Failed to load object relation types');
      }
      
      if (typesResponse.success) {
        setObjectTypes(typesResponse.data);
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load object relation types');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { 
    code: string; 
    is_active?: boolean; 
    text?: string; 
    language_id?: number; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
    mirrored_type_id?: number | null;
  }) => {
    const createPayload: any = {
      code: item.code,
      is_active: item.is_active !== undefined ? item.is_active : true,
      text: item.text,
      language_id: item.language_id,
      parent_object_type_id: item.parent_object_type_id !== undefined ? item.parent_object_type_id : undefined,
      child_object_type_id: item.child_object_type_id !== undefined ? item.child_object_type_id : undefined,
      mirrored_type_id: item.mirrored_type_id !== undefined ? item.mirrored_type_id : null,
    };
    const response = await lookupApi.createObjectRelationType(createPayload);
    if (!response.success) {
      throw new Error('Failed to create object relation type');
    }
  };

  const handleUpdate = async (id: number, item: { 
    code?: string; 
    is_active?: boolean; 
    text?: string; 
    language_id?: number; 
    parent_object_type_id?: number;
    child_object_type_id?: number;
    update_all_languages?: boolean | number; 
    old_code?: string;
    new_code?: string;
    old_is_active?: boolean;
    new_is_active?: boolean;
    old_parent_object_type_id?: number;
    new_parent_object_type_id?: number;
    old_child_object_type_id?: number;
    new_child_object_type_id?: number;
    old_text?: string; 
    new_text?: string;
    old_mirrored_type_id?: number | null;
    new_mirrored_type_id?: number | null;
  }) => {
    // Request body with old/new value pairs
    const updatePayload: any = {
      update_all_languages: item.update_all_languages === true || item.update_all_languages === 1 ? 1 : 0,
      language_id: item.language_id,
      old_code: item.old_code !== undefined ? item.old_code : '',
      new_code: item.new_code !== undefined ? item.new_code : '',
      old_is_active: item.old_is_active !== undefined ? item.old_is_active : true,
      new_is_active: item.new_is_active !== undefined ? item.new_is_active : true,
      old_text: item.old_text !== undefined ? item.old_text : '',
      new_text: item.new_text !== undefined ? item.new_text : ''
    };

    // Add parent and child object type fields
    updatePayload.old_parent_object_type_id = item.old_parent_object_type_id !== undefined ? item.old_parent_object_type_id : null;
    updatePayload.new_parent_object_type_id = item.new_parent_object_type_id !== undefined ? item.new_parent_object_type_id : null;
    updatePayload.old_child_object_type_id = item.old_child_object_type_id !== undefined ? item.old_child_object_type_id : null;
    updatePayload.new_child_object_type_id = item.new_child_object_type_id !== undefined ? item.new_child_object_type_id : null;
    
    // Add mirrored_type_id fields
    updatePayload.old_mirrored_type_id = item.old_mirrored_type_id !== undefined ? item.old_mirrored_type_id : null;
    updatePayload.new_mirrored_type_id = item.new_mirrored_type_id !== undefined ? item.new_mirrored_type_id : null;
    
    const response = await lookupApi.updateObjectRelationType(id, updatePayload);
    if (!response.success) {
      throw new Error('Failed to update object relation type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteObjectRelationType(id);
    if (!response.success) {
      throw new Error('Failed to delete object relation type');
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
    <ObjectRelationTypesTable
      title={t('nav.objectRelationTypes')}
      data={data}
      isLoading={isLoading}
      error={error}
      onLoad={loadData}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      objectTypes={objectTypes}
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

