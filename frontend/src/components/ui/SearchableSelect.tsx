/**
 * SearchableSelect Component - A searchable dropdown select
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string | number | null;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  label?: string;
  value: string | number | null | undefined;
  onChange: (value: string | number | null) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  className?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search...',
  className,
  error,
  helperText,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  const handleSelect = (optionValue: string | number | null) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchTerm('');
  };

  return (
    <div className={cn('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer flex items-center justify-between',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500',
            error && 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500',
            !isOpen && 'border-gray-300 dark:border-gray-600'
          )}
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <div className="flex-1 min-w-0">
            {isOpen ? (
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none text-sm"
              />
            ) : (
              <span className={cn('text-sm block truncate', !displayValue && 'text-gray-400 dark:text-gray-500')}>
                {displayValue || placeholder}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {value !== null && value !== undefined && !isOpen && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value === null ? 'none' : String(option.value)}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    'px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600',
                    value === option.value && 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

