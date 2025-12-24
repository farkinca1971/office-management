/**
 * Persons List Page
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

export default function PersonsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Persons</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage person records</p>
        </div>
        <Link href="/persons/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Person
          </Button>
        </Link>
      </div>

      <Card>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Person list will be displayed here</p>
          <p className="text-sm mt-2">API integration pending</p>
        </div>
      </Card>
    </div>
  );
}

