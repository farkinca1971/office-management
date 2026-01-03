/**
 * AuditsTab Component
 *
 * Manages audit logs for a given object (employee, person, company, etc.)
 * Features:
 * - Loads audits from API
 * - Loads audit actions (lookup data)
 * - Shows AuditsTable with all data
 * - Self-contained data fetching
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from '@/components/ui/Alert';
import { AuditsTable } from './AuditsTable';
import { auditApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { ObjectAudit } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AuditsTabProps {
  objectId: number;
}

export default function AuditsTab({ objectId }: AuditsTabProps) {
  console.log('🔵 AuditsTab component rendered with objectId:', objectId);

  const { t } = useTranslation();
  const [audits, setAudits] = useState<ObjectAudit[]>([]);
  const [auditActions, setAuditActions] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const language = useLanguageStore((state) => state.language);

  // Load audits and audit actions
  const loadData = useCallback(async () => {
    console.log('[AuditsTab] loadData called for objectId:', objectId);
    try {
      setIsLoading(true);
      setError(null);

      // Load audits and audit actions in parallel
      const [auditsResponse, actionsResponse] = await Promise.all([
        auditApi.getByObjectId(objectId),
        lookupApi.getAuditActions(undefined, language),
      ]);

      console.log('[AuditsTab] Audits response:', auditsResponse);
      console.log('[AuditsTab] Actions response:', actionsResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const auditsData = auditsResponse?.data || auditsResponse || [];
      const actionsData = actionsResponse?.data || actionsResponse || [];

      // Handle both array and single object responses
      let auditsArray: ObjectAudit[] = [];
      if (Array.isArray(auditsData)) {
        auditsArray = auditsData;
      } else if (auditsData && typeof auditsData === 'object') {
        // Single object returned, wrap it in an array
        auditsArray = [auditsData as ObjectAudit];
      }

      setAudits(auditsArray);
      setAuditActions(Array.isArray(actionsData) ? actionsData : []);

      console.log('[AuditsTab] State set - audits count:', auditsArray.length);
    } catch (err: any) {
      console.error('[AuditsTab] Error loading audits:', err);
      setError(err?.error?.message || err?.message || t('audits.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [objectId, language, t]);

  useEffect(() => {
    console.log('[AuditsTab] useEffect triggered');
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Audits Table */}
      <AuditsTable
        audits={audits}
        isLoading={isLoading}
        error={error}
        auditActions={auditActions}
      />
    </div>
  );
}

// Re-export for convenience
export { AuditsTab };
