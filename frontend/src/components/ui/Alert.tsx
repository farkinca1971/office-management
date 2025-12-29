/**
 * Alert Component - Display success, error, warning, or info messages
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  variant?: 'success' | 'error' | 'warning' | 'info'; // Alias for type
  title?: string;
  message?: string;
  children?: React.ReactNode; // Alternative to message
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type,
  variant,
  title,
  message,
  children,
  onClose,
  className,
}) => {
  // Support both 'type' and 'variant' props (variant takes precedence for compatibility)
  const alertType = variant || type || 'info';
  // Support both 'message' and 'children' props
  const content = children || message;

  const styles = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 shadow-sm',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 shadow-sm',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300 shadow-sm',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 shadow-sm',
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 shadow-md',
        styles[alertType],
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{content}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-current opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

