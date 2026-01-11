/**
 * QuickActionButton Component
 *
 * Smart button that determines available quick actions based on context
 * Provides shortcuts for creating related entities from the Relations tab
 *
 * Features:
 * - Determines valid relation types for current object
 * - Shows action buttons like "Create Invoice", "Add Document", "Link Person"
 * - Opens CreateRelatedEntityModal for each action
 * - Auto-creates relation after entity creation
 */

'use client';

import React, { useMemo } from 'react';
import { FileText, Receipt, Building2, User, Users, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { LookupItem } from '@/types/common';

interface QuickActionButtonProps {
  currentObjectId: number;
  currentObjectTypeId: number;
  relationTypes: LookupItem[];
  objectTypes: LookupItem[];
  onActionClick: (actionType: QuickActionType, relationTypeId: number, targetObjectTypeId: number) => void;
}

export type QuickActionType =
  | 'create_invoice'
  | 'create_document'
  | 'link_person'
  | 'link_company'
  | 'link_employee'
  | 'link_group';

interface QuickAction {
  type: QuickActionType;
  label: string;
  icon: React.ReactNode;
  relationTypeId: number;
  targetObjectTypeId: number;
}

// Helper to get object type ID by code
const getObjectTypeIdByCode = (objectTypes: LookupItem[], code: string): number | undefined => {
  return objectTypes.find(t => t.code?.toLowerCase() === code.toLowerCase())?.id;
};

// Helper to get icon for action type
const getActionIcon = (type: QuickActionType) => {
  switch (type) {
    case 'create_invoice':
      return <Receipt className="h-4 w-4" />;
    case 'create_document':
      return <FileText className="h-4 w-4" />;
    case 'link_person':
      return <User className="h-4 w-4" />;
    case 'link_company':
      return <Building2 className="h-4 w-4" />;
    case 'link_employee':
      return <Briefcase className="h-4 w-4" />;
    case 'link_group':
      return <Users className="h-4 w-4" />;
    default:
      return <Plus className="h-4 w-4" />;
  }
};

export default function QuickActionButton({
  currentObjectId,
  currentObjectTypeId,
  relationTypes,
  objectTypes,
  onActionClick,
}: QuickActionButtonProps) {
  // Determine available quick actions based on current object type and available relation types
  const availableActions = useMemo<QuickAction[]>(() => {
    const actions: QuickAction[] = [];

    // Filter relation types that are valid for current object as parent
    const validRelationTypes = relationTypes.filter(
      (rt: any) => rt.parent_object_type_id === currentObjectTypeId && rt.is_active
    );

    // Map relation types to quick actions
    validRelationTypes.forEach((relationType: any) => {
      const childObjectTypeId = relationType.child_object_type_id;
      if (!childObjectTypeId) return;

      // Find the child object type
      const childObjectType = objectTypes.find(t => t.id === childObjectTypeId);
      if (!childObjectType || !childObjectType.code) return;

      const childTypeCode = childObjectType.code.toLowerCase();

      // Map to quick action types
      if (childTypeCode === 'invoice' || childTypeCode === 'invoices') {
        actions.push({
          type: 'create_invoice',
          label: 'Create Invoice',
          icon: getActionIcon('create_invoice'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      } else if (childTypeCode === 'document' || childTypeCode === 'documents') {
        actions.push({
          type: 'create_document',
          label: 'Add Document',
          icon: getActionIcon('create_document'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      } else if (childTypeCode === 'person' || childTypeCode === 'persons') {
        actions.push({
          type: 'link_person',
          label: 'Link Person',
          icon: getActionIcon('link_person'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      } else if (childTypeCode === 'company' || childTypeCode === 'companies') {
        actions.push({
          type: 'link_company',
          label: 'Link Company',
          icon: getActionIcon('link_company'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      } else if (childTypeCode === 'employee' || childTypeCode === 'employees') {
        actions.push({
          type: 'link_employee',
          label: 'Link Employee',
          icon: getActionIcon('link_employee'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      } else if (childTypeCode === 'group' || childTypeCode === 'groups') {
        actions.push({
          type: 'link_group',
          label: 'Link Group',
          icon: getActionIcon('link_group'),
          relationTypeId: relationType.id,
          targetObjectTypeId: childObjectTypeId,
        });
      }
    });

    return actions;
  }, [currentObjectTypeId, relationTypes, objectTypes]);

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((action) => (
        <Button
          key={action.type}
          variant="secondary"
          onClick={() => onActionClick(action.type, action.relationTypeId, action.targetObjectTypeId)}
          className="flex items-center gap-2"
          title={action.label}
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
