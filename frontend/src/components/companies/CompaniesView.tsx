/**
 * CompaniesView Component
 * Handles both grid (table) and card view modes for companies
 */

'use client';

import React from 'react';
import { CompaniesTable } from './CompaniesTable';
import { CompanyCard } from './CompanyCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import type { Company } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import type { ViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';

interface CompaniesViewProps {
  companies: Company[];
  isLoading?: boolean;
  error?: string | null;
  viewMode: ViewMode;
  onCompanySelect?: (company: Company) => void;
  selectedCompanyId?: number;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  statuses?: LookupItem[];
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  isLoading = false,
  error = null,
  viewMode,
  onCompanySelect,
  selectedCompanyId,
  onEdit,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  // Grid view - use existing table component
  if (viewMode === 'grid') {
    return (
      <CompaniesTable
        companies={companies}
        isLoading={isLoading}
        error={error}
        onCompanySelect={onCompanySelect}
        selectedCompanyId={selectedCompanyId}
        onEdit={onEdit}
        onDelete={onDelete}
        statuses={statuses}
      />
    );
  }

  // Card view - responsive grid layout
  return (
    <div>
      {companies.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t('lookup.noDataAvailable')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isSelected={selectedCompanyId === company.id}
              onSelect={onCompanySelect}
              onEdit={onEdit}
              onDelete={onDelete}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};
