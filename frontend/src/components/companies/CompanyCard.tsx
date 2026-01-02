/**
 * CompanyCard Component
 * Displays company information in card format (mobile-friendly)
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Building2, Hash } from 'lucide-react';
import type { Company } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface CompanyCardProps {
  company: Company;
  isSelected?: boolean;
  onSelect?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  statuses?: LookupItem[];
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();

  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
  };

  const getStatusColor = (statusId?: number): string => {
    const status = statuses.find(s => s.id === statusId);
    // You can customize this based on your status codes
    if (status?.code === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (status?.code === 'inactive') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={() => onSelect?.(company)}
    >
      <div className="p-4 space-y-3">
        {/* Header with Status */}
        <div className="flex items-start justify-end">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.object_status_id)}`}>
            {getStatusName(company.object_status_id)}
          </span>
        </div>

        {/* Company Name */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {company.company_name}
            </h3>
          </div>
        </div>

        {/* Details Grid */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('companies.companyId')}</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {company.company_id}
            </p>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                title={t('lookup.actions')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(company);
                }}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title={t('lookup.actions')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
