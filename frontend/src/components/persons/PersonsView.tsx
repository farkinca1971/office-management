/**
 * PersonsView Component
 * Handles both grid (table) and card view modes for persons
 */

'use client';

import React from 'react';
import { PersonsTable } from './PersonsTable';
import { PersonCard } from './PersonCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import type { Person } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import type { ViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';

interface PersonsViewProps {
  persons: Person[];
  isLoading?: boolean;
  error?: string | null;
  viewMode: ViewMode;
  onPersonSelect?: (person: Person) => void;
  selectedPersonId?: number;
  onEdit?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  salutations?: LookupItem[];
  sexes?: LookupItem[];
  statuses?: LookupItem[];
}

export const PersonsView: React.FC<PersonsViewProps> = ({
  persons,
  isLoading = false,
  error = null,
  viewMode,
  onPersonSelect,
  selectedPersonId,
  onEdit,
  onDelete,
  salutations = [],
  sexes = [],
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
      <PersonsTable
        persons={persons}
        isLoading={isLoading}
        error={error}
        onPersonSelect={onPersonSelect}
        selectedPersonId={selectedPersonId}
        onEdit={onEdit}
        onDelete={onDelete}
        salutations={salutations}
        sexes={sexes}
        statuses={statuses}
      />
    );
  }

  // Card view - responsive grid layout
  return (
    <div>
      {persons.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t('lookup.noDataAvailable')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {persons.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              isSelected={selectedPersonId === person.id}
              onSelect={onPersonSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              salutations={salutations}
              sexes={sexes}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};
