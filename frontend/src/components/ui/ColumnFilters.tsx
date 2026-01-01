import React from 'react';

interface TextColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TextColumnFilter({
  value,
  onChange,
  placeholder = 'Filter...',
  className = ''
}: TextColumnFilterProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    />
  );
}

interface SelectColumnFilterProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  className?: string;
}

export function SelectColumnFilter({
  value,
  onChange,
  options,
  placeholder = 'All',
  className = ''
}: SelectColumnFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const val = e.target.value;
        // Try to parse as number if possible
        const numVal = Number(val);
        onChange(isNaN(numVal) ? val : numVal);
      }}
      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface CheckboxColumnFilterProps {
  checked: boolean | null; // null = all, true = checked only, false = unchecked only
  onChange: (checked: boolean | null) => void;
  label?: string;
  className?: string;
}

export function CheckboxColumnFilter({
  checked,
  onChange,
  label = 'Active',
  className = ''
}: CheckboxColumnFilterProps) {
  return (
    <select
      value={checked === null ? 'all' : checked ? 'true' : 'false'}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === 'all' ? null : val === 'true');
      }}
      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    >
      <option value="all">All</option>
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
}

interface DateColumnFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateColumnFilter({
  value,
  onChange,
  placeholder = 'YYYY-MM-DD',
  className = ''
}: DateColumnFilterProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${className}`}
    />
  );
}
