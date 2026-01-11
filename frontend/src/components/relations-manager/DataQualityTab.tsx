/**
 * DataQualityTab Component - Display data quality issues with selection and filtering
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { BulkOperationsToolbar } from './BulkOperationsToolbar';
import type {
  OrphanedRelation,
  DuplicateRelationGroup,
  InvalidRelation,
  MissingMirrorRelation,
} from '@/types/entities';
import { formatDateTime } from '@/lib/utils';

type DataQualityIssue = OrphanedRelation | DuplicateRelationGroup | InvalidRelation | MissingMirrorRelation;

export interface DataQualityTabProps {
  type: 'orphaned' | 'duplicates' | 'invalid' | 'missing-mirrors';
  data: DataQualityIssue[];
  isLoading: boolean;
  error?: string | null;
  onDelete: (ids: number[]) => Promise<void>;
  onRefresh: () => void;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({
  type,
  data,
  isLoading,
  error,
  onDelete,
  onRefresh,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = data.map((item: any) => {
        // For duplicates, get all relation IDs in the group
        if (type === 'duplicates' && item.relation_ids) {
          return item.relation_ids;
        }
        return item.id;
      }).flat();
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      onRefresh();
    } catch (error) {
      console.error('Error deleting relations:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const renderTableContent = () => {
    switch (type) {
      case 'orphaned':
        return renderOrphanedTable(data as OrphanedRelation[]);
      case 'duplicates':
        return renderDuplicatesTable(data as DuplicateRelationGroup[]);
      case 'invalid':
        return renderInvalidTable(data as InvalidRelation[]);
      case 'missing-mirrors':
        return renderMissingMirrorsTable(data as MissingMirrorRelation[]);
      default:
        return null;
    }
  };

  const renderOrphanedTable = (orphaned: OrphanedRelation[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={selectedIds.size === orphaned.length && orphaned.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relation Type</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orphaned.map((relation) => (
          <tr key={relation.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(relation.id)}
                onChange={() => handleSelectRow(relation.id)}
                className="rounded border-gray-300"
              />
            </td>
            <td className="px-4 py-3 text-sm">{relation.id}</td>
            <td className="px-4 py-3 text-sm">{relation.relation_type_name || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {relation.from_object_type_name} #{relation.object_from_id}
              {!relation.from_is_active && (
                <span className="ml-2 text-xs text-red-600">(inactive)</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm">
              {relation.to_object_type_name} #{relation.object_to_id}
              {!relation.to_is_active && (
                <span className="ml-2 text-xs text-red-600">(inactive)</span>
              )}
            </td>
            <td className="px-4 py-3 text-sm text-yellow-600">
              Points to inactive object
            </td>
            <td className="px-4 py-3 text-sm">{formatDateTime(relation.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderDuplicatesTable = (duplicates: DuplicateRelationGroup[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={selectedIds.size > 0 && duplicates.every((group: any) =>
                group.relation_ids?.every((id: number) => selectedIds.has(id))
              )}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relation Type</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duplicate Count</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IDs</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {duplicates.map((group: any, idx) => (
          <tr key={idx} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={group.relation_ids?.every((id: number) => selectedIds.has(id)) || false}
                onChange={() => {
                  // Toggle all IDs in this group
                  const newSelected = new Set(selectedIds);
                  const allSelected = group.relation_ids?.every((id: number) => selectedIds.has(id));
                  group.relation_ids?.forEach((id: number) => {
                    if (allSelected) {
                      newSelected.delete(id);
                    } else {
                      newSelected.add(id);
                    }
                  });
                  setSelectedIds(newSelected);
                }}
                className="rounded border-gray-300"
              />
            </td>
            <td className="px-4 py-3 text-sm">{group.relation_type_name || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {group.from_object_type_name} #{group.object_from_id}
            </td>
            <td className="px-4 py-3 text-sm">
              {group.to_object_type_name} #{group.object_to_id}
            </td>
            <td className="px-4 py-3 text-sm text-orange-600 font-semibold">
              {group.duplicate_count}
            </td>
            <td className="px-4 py-3 text-sm">
              {group.relation_ids?.join(', ') || '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderInvalidTable = (invalid: InvalidRelation[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={selectedIds.size === invalid.length && invalid.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relation Type</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {invalid.map((relation) => (
          <tr key={relation.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(relation.id)}
                onChange={() => handleSelectRow(relation.id)}
                className="rounded border-gray-300"
              />
            </td>
            <td className="px-4 py-3 text-sm">{relation.id}</td>
            <td className="px-4 py-3 text-sm">{relation.relation_type_name || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {relation.from_object_type_name} #{relation.object_from_id}
            </td>
            <td className="px-4 py-3 text-sm">
              {relation.to_object_type_name} #{relation.object_to_id}
            </td>
            <td className="px-4 py-3 text-sm text-red-600">
              Type constraint violation
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {relation.expected_from_type} → {relation.expected_to_type}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderMissingMirrorsTable = (missing: MissingMirrorRelation[]) => (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-12 px-4 py-3">
            <input
              type="checkbox"
              checked={selectedIds.size === missing.length && missing.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300"
            />
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relation Type</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">To Object</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Missing Mirror</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {missing.map((relation) => (
          <tr key={relation.id} className="hover:bg-gray-50">
            <td className="px-4 py-3">
              <input
                type="checkbox"
                checked={selectedIds.has(relation.id)}
                onChange={() => handleSelectRow(relation.id)}
                className="rounded border-gray-300"
              />
            </td>
            <td className="px-4 py-3 text-sm">{relation.id}</td>
            <td className="px-4 py-3 text-sm">{relation.relation_type_name || '-'}</td>
            <td className="px-4 py-3 text-sm">
              {relation.from_object_type_name} #{relation.object_from_id}
            </td>
            <td className="px-4 py-3 text-sm">
              {relation.to_object_type_name} #{relation.object_to_id}
            </td>
            <td className="px-4 py-3 text-sm text-blue-600">
              {relation.expected_mirror_type_name || 'Mirror relation'}
            </td>
            <td className="px-4 py-3 text-sm">{formatDateTime(relation.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <p>No {type} relations found. Everything looks good!</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <BulkOperationsToolbar
        selectedCount={selectedIds.size}
        onDelete={handleDelete}
        onClearSelection={handleClearSelection}
        isLoading={isDeleting}
      />

      <Card>
        <div className="overflow-x-auto">
          {renderTableContent()}
        </div>
      </Card>
    </div>
  );
};
