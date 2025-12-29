/**
 * Common TypeScript types used throughout the application
 */

// Standard API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiListResponse<T> {
  success: true;
  data: T[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination Parameters
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// Filter/Search Parameters
export interface SearchParams extends PaginationParams {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Common Entity Fields
export interface BaseEntity {
  id: number;
  created_at?: string;
  updated_at?: string;
}

// Lookup Item
export interface LookupItem {
  id: number;
  code: string;
  is_active: boolean;
  name?: string; // Translation text for the current language (from translations table)
  translations?: Translation[]; // Array of translations (optional, only present in some responses)
}

// Translation
export interface Translation {
  code: string;
  language_id: number;
  text: string;
}

