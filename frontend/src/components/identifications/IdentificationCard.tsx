/**
 * IdentificationCard Component
 * Displays identification information in card format (mobile-friendly)
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, CreditCard, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { Identification } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface IdentificationCardProps {
  identification: Identification;
  identificationTypes: LookupItem[];
  onEdit: (identification: Identification) => void;
  onDelete: (id: number) => void;
}

export const IdentificationCard: React.FC<IdentificationCardProps> = ({
  identification,
  identificationTypes,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getIdentificationTypeName = (identificationTypeId: number): string => {
    const identificationType = identificationTypes.find(it => it.id === identificationTypeId);
    return identificationType?.name || identificationType?.code || t('identifications.unknown');
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <div className="p-4 space-y-3">
        {/* Header with Status */}
        <div className="flex items-start justify-end">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              identification.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {identification.is_active ? t('table.active') : t('table.inactive')}
          </span>
        </div>

        {/* Identification Type and Value */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {getIdentificationTypeName(identification.identification_type_id)}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-all">
              {identification.identification_value}
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{t('common.created')}: {formatDateTime(identification.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(identification)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={t('table.edit')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(identification.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title={t('table.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
