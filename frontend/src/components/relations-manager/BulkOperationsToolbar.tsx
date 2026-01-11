/**
 * BulkOperationsToolbar Component - Toolbar for bulk operations on selected relations
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Trash2, Users, RefreshCw, X } from 'lucide-react';

export interface BulkOperationsToolbarProps {
  selectedCount: number;
  onDelete: () => Promise<void>;
  onReassign?: () => Promise<void>;
  onUpdateType?: () => Promise<void>;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedCount,
  onDelete,
  onReassign,
  onUpdateType,
  onClearSelection,
  isLoading = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount === 0) {
    return null;
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} relation{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isLoading}
              className="flex items-center space-x-1"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Selected</span>
            </Button>

            {onReassign && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onReassign}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <Users className="h-4 w-4" />
                <span>Reassign Target</span>
              </Button>
            )}

            {onUpdateType && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onUpdateType}
                disabled={isLoading}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Change Type</span>
              </Button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading}
          className="flex items-center space-x-1"
        >
          <X className="h-4 w-4" />
          <span>Clear Selection</span>
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedCount} relation{selectedCount !== 1 ? 's' : ''}?
              This action cannot be undone (soft delete sets is_active = false).
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={handleCancelDelete}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
