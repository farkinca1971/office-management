/**
 * Employees List Page
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Plus } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Employees</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage employee records</p>
        </div>
        <Link href="/employees/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Card>
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>Employee list will be displayed here</p>
          <p className="text-sm mt-2">API integration pending</p>
        </div>
      </Card>
    </div>
  );
}

