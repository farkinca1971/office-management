/**
 * CreateRelatedEntityModal Component
 *
 * Generic modal for creating related entities
 * Features:
 * - Dynamically loads appropriate form based on entity type
 * - Auto-creates relation after entity creation
 * - Shows success message with options: "View New Entity" or "Close and Continue"
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/lib/i18n';
import type { QuickActionType } from './QuickActionButton';

interface CreateRelatedEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: QuickActionType;
  currentObjectId: number;
  relationTypeId: number;
  targetObjectTypeId: number;
  onSuccess: (newEntityId: number) => void;
}

export default function CreateRelatedEntityModal({
  isOpen,
  onClose,
  actionType,
  currentObjectId,
  relationTypeId,
  targetObjectTypeId,
  onSuccess,
}: CreateRelatedEntityModalProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEntityId, setCreatedEntityId] = useState<number | null>(null);

  if (!isOpen) return null;

  // Get modal title based on action type
  const getModalTitle = () => {
    switch (actionType) {
      case 'create_invoice':
        return 'Create Invoice';
      case 'create_document':
        return 'Add Document';
      case 'link_person':
        return 'Link Person';
      case 'link_company':
        return 'Link Company';
      case 'link_employee':
        return 'Link Employee';
      case 'link_group':
        return 'Link Group';
      default:
        return 'Create Related Entity';
    }
  };

  // Get navigation path for created entity
  const getEntityPath = (entityId: number) => {
    switch (actionType) {
      case 'create_invoice':
        return `/invoices?id=${entityId}`;
      case 'create_document':
        return `/documents?id=${entityId}`;
      case 'link_person':
        return `/persons?id=${entityId}`;
      case 'link_company':
        return `/companies?id=${entityId}`;
      case 'link_employee':
        return `/employees?id=${entityId}`;
      case 'link_group':
        return `/groups?id=${entityId}`;
      default:
        return null;
    }
  };

  // Handle view entity
  const handleViewEntity = () => {
    if (!createdEntityId) return;
    const path = getEntityPath(createdEntityId);
    if (path) {
      router.push(path);
    }
  };

  // Handle close
  const handleClose = () => {
    setCreatedEntityId(null);
    setError(null);
    onClose();
  };

  // Render success state
  if (createdEntityId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Success!
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {getModalTitle()} created successfully and linked to the current object.
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleViewEntity}
                className="flex items-center gap-2 flex-1"
              >
                <ExternalLink className="h-4 w-4" />
                View New Entity
              </Button>
              <Button
                variant="secondary"
                onClick={handleClose}
                className="flex-1"
              >
                Close and Continue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {getModalTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          {/* Placeholder for entity-specific forms */}
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="mb-4">Entity creation form will be implemented here.</p>
            <p className="text-sm">
              This modal will dynamically load the appropriate form based on the entity type:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Invoice form for "Create Invoice"</li>
              <li>• Document form for "Add Document"</li>
              <li>• Person/Company/Employee linking for "Link X"</li>
            </ul>
          </div>

          {/* Temporary implementation note */}
          <Alert variant="info" className="mt-4">
            <strong>Implementation Note:</strong> This is a placeholder modal. In the full
            implementation, this modal will:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Load the appropriate entity creation form</li>
              <li>Create the new entity via API</li>
              <li>Create the relation between current object and new entity</li>
              <li>Show success message with navigation options</li>
            </ol>
          </Alert>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={true}
            title="Entity creation not yet implemented"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}
