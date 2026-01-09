/**
 * DocumentRelationsTab Component
 *
 * Manages object relations for a document
 * Features:
 * - Loads relations from the document to other objects
 * - Displays related objects (persons, companies, transactions, etc.)
 * - Allows adding/removing relations
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, User, Building2, Receipt, CreditCard, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { documentsApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import type { ObjectRelation } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface DocumentRelationsTabProps {
  documentId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function DocumentRelationsTab({ documentId, onDataChange }: DocumentRelationsTabProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [relations, setRelations] = useState<ObjectRelation[]>([]);
  const [relationTypes, setRelationTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [relationsResponse, typesResponse] = await Promise.all([
        documentsApi.getRelations(documentId),
        lookupApi.getObjectRelationTypes(language),
      ]);

      const relationsData = (relationsResponse.success && relationsResponse.data) ? relationsResponse.data : [];
      const typesData = typesResponse?.data;

      let relationsArray: ObjectRelation[] = [];
      if (Array.isArray(relationsData)) {
        relationsArray = relationsData;
      } else if (relationsData && typeof relationsData === 'object') {
        relationsArray = [relationsData as ObjectRelation];
      }

      setRelations(relationsArray);
      setRelationTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err: any) {
      console.error('[DocumentRelationsTab] Error loading relations:', err);
      setError(err?.error?.message || t('documents.relationsLoadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, language, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveRelation = async (relationId: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await documentsApi.removeRelation(documentId, relationId);

      await loadData();

      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('documents.relationRemoved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[DocumentRelationsTab] Error removing relation:', err);
      setError(err?.error?.message || t('documents.relationRemoveFailed'));
    }
  };

  const getRelationTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const relType = relationTypes.find(t => t.id === typeId);
    return relType?.name || relType?.code || '-';
  };

  const getObjectIcon = (objectTypeCode?: string): React.ReactNode => {
    switch (objectTypeCode) {
      case 'person':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'company':
        return <Building2 className="h-5 w-5 text-purple-500" />;
      case 'transaction':
        return <Receipt className="h-5 w-5 text-green-500" />;
      case 'invoice':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return <Link2 className="h-5 w-5 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Relations Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.relatedObject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.relationType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('notes.note')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('audits.createdAt')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lookup.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {relations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('documents.noRelations')}
                  </td>
                </tr>
              ) : (
                relations.map((relation) => (
                  <tr key={relation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {getObjectIcon()}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t('documents.objectId')}: {relation.object_to_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {getRelationTypeName(relation.object_relation_type_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <span className="line-clamp-2">{relation.note || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(relation.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveRelation(relation.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title={t('documents.removeRelation')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Relation Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => {
            // TODO: Open add relation modal
            console.log('Open add relation modal');
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('documents.addRelation')}
        </Button>
      </div>
    </div>
  );
}
