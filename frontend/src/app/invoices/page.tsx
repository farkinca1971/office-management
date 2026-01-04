/**
 * Invoices List Page
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function InvoicesPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('invoices.title')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t('invoices.subtitle')}
          </p>
        </div>
        <Link href="/invoices/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {t('invoices.addNew')}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>{t('invoices.listUnavailable')}</p>
          <p className="text-sm mt-2">{t('invoices.apiPending')}</p>
        </div>
      </Card>
    </div>
  );
}

