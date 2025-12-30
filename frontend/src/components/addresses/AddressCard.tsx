/**
 * AddressCard Component
 * Displays address information in card format (mobile-friendly)
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, MapPin, Hash, Clock, Globe } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { Address } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

interface AddressCardProps {
  address: Address;
  addressTypes: LookupItem[];
  addressAreaTypes: LookupItem[];
  countries: LookupItem[];
  onEdit: (address: Address) => void;
  onDelete: (id: number) => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  addressTypes,
  addressAreaTypes,
  countries,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const getLookupName = (lookupItems: LookupItem[], id?: number): string => {
    if (!id) return '-';
    const item = lookupItems.find(l => l.id === id);
    return item?.name || item?.code || t('addresses.unknown');
  };

  const fullAddress = [
    address.street_address_1,
    address.street_address_2,
    address.city,
    address.state_province,
    address.postal_code,
  ].filter(Boolean).join(', ');

  return (
    <Card className="hover:shadow-lg transition-all">
      <div className="p-4 space-y-3">
        {/* Header with ID and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {address.id}
            </span>
          </div>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              address.is_active
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}
          >
            {address.is_active ? t('common.active') : t('common.inactive')}
          </span>
        </div>

        {/* Address Type */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {getLookupName(addressTypes, address.address_type_id)}
              {address.address_area_type_id && ` - ${getLookupName(addressAreaTypes, address.address_area_type_id)}`}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {fullAddress}
            </p>
          </div>
        </div>

        {/* Country */}
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Globe className="h-4 w-4 text-gray-400" />
          <span>{getLookupName(countries, address.country_id)}</span>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{t('common.created')}: {formatDateTime(address.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
            title={t('table.edit')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(address.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            title={t('table.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
