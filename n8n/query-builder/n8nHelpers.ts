/**
 * n8n Webhook Helper Functions
 *
 * This module provides helper functions specifically designed for use
 * within n8n Code nodes to integrate with the Query Builder system.
 *
 * These functions handle:
 * - Extracting parameters from n8n webhook context
 * - Resolving placeholders in generated queries
 * - Building proper SQL parameter bindings
 * - Formatting responses for the frontend API
 *
 * @author Claude Code
 * @version 1.0.0
 */

import {
  QueryBuilder,
  LookupQueryBuilder,
  TranslationQueryBuilder,
  createQueryBuilder,
  EntityConfigs,
  type QueryResult,
  type SelectParams,
  type PaginationMeta,
  type N8nContext,
} from './QueryBuilder';

// ============================================================================
// N8N CONTEXT HELPERS
// ============================================================================

/**
 * Extract n8n context from various possible input formats
 * n8n passes data differently depending on the trigger type
 */
export function extractN8nContext(items: any[]): N8nContext {
  const item = items[0]?.json || items[0] || {};

  return {
    params: item.params || {},
    query: item.query || {},
    body: item.body || {},
    headers: item.headers || {},
  };
}

/**
 * Get language ID from various sources (header, query, body)
 */
export function getLanguageId(context: N8nContext): number {
  // Check X-Language-ID header first
  const headerLanguageId = context.headers['x-language-id'] || context.headers['X-Language-ID'];
  if (headerLanguageId) {
    return parseInt(headerLanguageId, 10);
  }

  // Check query params
  if (context.query.language_id) {
    return parseInt(context.query.language_id, 10);
  }

  // Check body
  if (context.body.language_id) {
    return parseInt(context.body.language_id, 10);
  }

  // Check for language_code and convert
  const langCode = context.query.language_code || context.body.language_code || 'en';
  const languageMap: Record<string, number> = { en: 1, de: 2, hu: 3 };
  return languageMap[langCode] || 1;
}

// ============================================================================
// QUERY RESOLUTION
// ============================================================================

/**
 * Resolve n8n placeholders in generated queries
 *
 * Converts {{ body.field }} style placeholders to MySQL prepared statement
 * format with actual values, properly escaping strings.
 *
 * @example
 * resolveQuery("SELECT * FROM users WHERE id = {{ params.id }}", context)
 * // Returns: "SELECT * FROM users WHERE id = 1"
 */
export function resolveQuery(query: string, context: N8nContext): string {
  // Pattern to match {{ path.to.value }} placeholders
  const placeholderPattern = /\{\{\s*([\w.]+)\s*\}\}/g;

  return query.replace(placeholderPattern, (match, path) => {
    const value = resolvePath(context, path);
    return formatSqlValue(value);
  });
}

/**
 * Resolve a dot-notation path to a value in the context object
 */
function resolvePath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return null;
    }
    current = current[part];
  }

  return current;
}

/**
 * Format a JavaScript value for safe use in SQL
 */
function formatSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  if (typeof value === 'string') {
    // Escape single quotes and backslashes
    const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  if (Array.isArray(value)) {
    return `(${value.map(formatSqlValue).join(', ')})`;
  }

  if (typeof value === 'object') {
    // For JSON objects, stringify and escape
    const json = JSON.stringify(value);
    const escaped = json.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  return 'NULL';
}

// ============================================================================
// QUERY EXECUTION HELPERS
// ============================================================================

/**
 * Build and resolve a SELECT query for an entity
 *
 * @example
 * // In n8n Code node:
 * const { query, countQuery } = buildSelectQuery('persons', items);
 * return [{ json: { query, countQuery } }];
 */
export function buildSelectQuery(entityType: string, items: any[]): { query: string; countQuery: string | undefined } {
  const context = extractN8nContext(items);
  const builder = createQueryBuilder(entityType);

  if (builder instanceof QueryBuilder) {
    const result = builder.buildSelect(context.query as SelectParams);
    return {
      query: resolveQuery(result.query, context),
      countQuery: result.countQuery ? resolveQuery(result.countQuery, context) : undefined,
    };
  }

  if (builder instanceof LookupQueryBuilder) {
    const result = builder.buildSelect(context.query);
    return {
      query: resolveQuery(result.query, context),
      countQuery: undefined,
    };
  }

  if (builder instanceof TranslationQueryBuilder) {
    const result = builder.buildSelect(context.query);
    return {
      query: resolveQuery(result.query, context),
      countQuery: undefined,
    };
  }

  throw new Error(`Unsupported builder type for entity: ${entityType}`);
}

/**
 * Build and resolve a SELECT BY ID query
 */
export function buildSelectByIdQuery(entityType: string, items: any[]): { query: string } {
  const context = extractN8nContext(items);
  const id = context.params.id;

  if (!id) {
    throw new Error('Missing required parameter: id');
  }

  const builder = createQueryBuilder(entityType);

  if (builder instanceof QueryBuilder) {
    const result = builder.buildSelectById(id);
    return { query: resolveQuery(result.query, context) };
  }

  if (builder instanceof LookupQueryBuilder) {
    const result = builder.buildSelectById(id);
    return { query: resolveQuery(result.query, context) };
  }

  throw new Error(`Unsupported builder type for entity: ${entityType}`);
}

/**
 * Build and resolve an INSERT query
 */
export function buildInsertQuery(entityType: string, items: any[]): { query: string } {
  const context = extractN8nContext(items);
  const builder = createQueryBuilder(entityType);

  if (builder instanceof QueryBuilder) {
    const result = builder.buildInsert(context.body);
    return { query: resolveQuery(result.query, context) };
  }

  if (builder instanceof LookupQueryBuilder) {
    const result = builder.buildInsert(context.body);
    return { query: resolveQuery(result.query, context) };
  }

  if (builder instanceof TranslationQueryBuilder) {
    const result = builder.buildInsert(context.body);
    return { query: resolveQuery(result.query, context) };
  }

  throw new Error(`Unsupported builder type for entity: ${entityType}`);
}

/**
 * Build and resolve an UPDATE query
 */
export function buildUpdateQuery(entityType: string, items: any[], useOldNewPattern: boolean = false): { query: string } {
  const context = extractN8nContext(items);
  const id = context.params.id;

  if (!id) {
    throw new Error('Missing required parameter: id');
  }

  const builder = createQueryBuilder(entityType);

  if (builder instanceof QueryBuilder) {
    const result = builder.buildUpdate(id, context.body, useOldNewPattern);
    return { query: resolveQuery(result.query, context) };
  }

  if (builder instanceof LookupQueryBuilder) {
    const result = builder.buildUpdate(id, context.body);
    return { query: resolveQuery(result.query, context) };
  }

  throw new Error(`Unsupported builder type for entity: ${entityType}`);
}

/**
 * Build and resolve a DELETE query
 */
export function buildDeleteQuery(entityType: string, items: any[]): { query: string } {
  const context = extractN8nContext(items);
  const id = context.params.id;

  if (!id) {
    throw new Error('Missing required parameter: id');
  }

  const builder = createQueryBuilder(entityType);

  if (builder instanceof QueryBuilder) {
    const result = builder.buildDelete(id);
    return { query: resolveQuery(result.query, context) };
  }

  if (builder instanceof LookupQueryBuilder) {
    const result = builder.buildDelete(id);
    return { query: resolveQuery(result.query, context) };
  }

  throw new Error(`Unsupported builder type for entity: ${entityType}`);
}

// ============================================================================
// RESPONSE FORMATTING
// ============================================================================

/**
 * Format a successful list response with pagination
 */
export function formatListResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
): { success: true; data: T[]; pagination: PaginationMeta } {
  return {
    success: true,
    data,
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Format a successful single item response
 */
export function formatItemResponse<T>(data: T): { success: true; data: T } {
  return {
    success: true,
    data,
  };
}

/**
 * Format an error response
 */
export function formatErrorResponse(
  code: string,
  message: string,
  details?: any
): { success: false; error: { code: string; message: string; details?: any } } {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Format a success response (for delete, etc.)
 */
export function formatSuccessResponse(): { success: true; data: { success: true } } {
  return {
    success: true,
    data: {
      success: true,
    },
  };
}

// ============================================================================
// N8N CODE NODE TEMPLATES
// ============================================================================

/**
 * Template for n8n Code node - Generic SELECT handler
 *
 * Usage in n8n Code node:
 * ```javascript
 * const { buildSelectQuery, formatListResponse, formatErrorResponse } = require('./n8nHelpers');
 *
 * try {
 *   const entityType = $('Set').item.json.entityType || 'persons';
 *   const { query, countQuery } = buildSelectQuery(entityType, $input.all());
 *
 *   // Execute queries using MySQL node
 *   // ... MySQL execution ...
 *
 *   return formatListResponse(results, total, page, perPage);
 * } catch (error) {
 *   return formatErrorResponse('QUERY_ERROR', error.message);
 * }
 * ```
 */
export const N8N_CODE_TEMPLATE_SELECT = `
// n8n Code Node: Generic SELECT Handler
// Import helpers (adjust path as needed)
const helpers = require('./query-builder/n8nHelpers');

const entityType = $('Set').item.json.entityType;
const context = helpers.extractN8nContext($input.all());

try {
  const { query, countQuery } = helpers.buildSelectQuery(entityType, $input.all());

  // Return queries to be executed by MySQL node
  return [{
    json: {
      dataQuery: query,
      countQuery: countQuery,
      page: context.query.page || 1,
      perPage: context.query.per_page || 20
    }
  }];
} catch (error) {
  return [{
    json: helpers.formatErrorResponse('QUERY_BUILD_ERROR', error.message)
  }];
}
`;

/**
 * Template for n8n Code node - Generic INSERT handler
 */
export const N8N_CODE_TEMPLATE_INSERT = `
// n8n Code Node: Generic INSERT Handler
const helpers = require('./query-builder/n8nHelpers');

const entityType = $('Set').item.json.entityType;

try {
  const { query } = helpers.buildInsertQuery(entityType, $input.all());

  return [{
    json: {
      query: query
    }
  }];
} catch (error) {
  return [{
    json: helpers.formatErrorResponse('QUERY_BUILD_ERROR', error.message)
  }];
}
`;

/**
 * Template for n8n Code node - Generic UPDATE handler
 */
export const N8N_CODE_TEMPLATE_UPDATE = `
// n8n Code Node: Generic UPDATE Handler
const helpers = require('./query-builder/n8nHelpers');

const entityType = $('Set').item.json.entityType;
const useOldNewPattern = $('Set').item.json.useOldNewPattern || false;

try {
  const { query } = helpers.buildUpdateQuery(entityType, $input.all(), useOldNewPattern);

  return [{
    json: {
      query: query
    }
  }];
} catch (error) {
  return [{
    json: helpers.formatErrorResponse('QUERY_BUILD_ERROR', error.message)
  }];
}
`;

/**
 * Template for n8n Code node - Generic DELETE handler
 */
export const N8N_CODE_TEMPLATE_DELETE = `
// n8n Code Node: Generic DELETE Handler
const helpers = require('./query-builder/n8nHelpers');

const entityType = $('Set').item.json.entityType;

try {
  const { query } = helpers.buildDeleteQuery(entityType, $input.all());

  return [{
    json: {
      query: query
    }
  }];
} catch (error) {
  return [{
    json: helpers.formatErrorResponse('QUERY_BUILD_ERROR', error.message)
  }];
}
`;

// ============================================================================
// DYNAMIC ENTITY ROUTING
// ============================================================================

/**
 * Determine entity type from URL path
 *
 * @example
 * getEntityTypeFromPath('/api/v1/persons') // 'persons'
 * getEntityTypeFromPath('/api/v1/objects/123/addresses') // 'object_addresses'
 * getEntityTypeFromPath('/api/v1/lookups/address-types') // 'lookup:address-types'
 */
export function getEntityTypeFromPath(path: string): string {
  // Normalize path
  const normalizedPath = path.replace(/^\/api\/v1\//, '').replace(/\/$/, '');
  const segments = normalizedPath.split('/');

  // Handle lookup endpoints
  if (segments[0] === 'lookups' && segments.length >= 2) {
    return `lookup:${segments[1]}`;
  }

  // Handle translation endpoints
  if (segments[0] === 'translations') {
    return 'translation';
  }

  // Handle child entity endpoints (e.g., /objects/123/addresses)
  if (segments[0] === 'objects' && segments.length >= 3) {
    const childEntity = segments[2];
    return `object_${childEntity}`;
  }

  // Handle direct entity endpoints
  const entityMap: Record<string, string> = {
    persons: 'persons',
    companies: 'companies',
    users: 'users',
    invoices: 'invoices',
    transactions: 'transactions',
    addresses: 'object_addresses',
    contacts: 'object_contacts',
    identifications: 'object_identifications',
    notes: 'object_notes',
    relations: 'object_relations',
    audits: 'object_audits',
  };

  return entityMap[segments[0]] || segments[0];
}

/**
 * Determine operation type from HTTP method and path
 */
export function getOperationType(
  method: string,
  path: string
): 'list' | 'get' | 'create' | 'update' | 'delete' {
  const normalizedMethod = method.toUpperCase();
  const hasId = /\/\d+$/.test(path) || /\/\d+\//.test(path);

  switch (normalizedMethod) {
    case 'GET':
      return hasId ? 'get' : 'list';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Context helpers
  extractN8nContext,
  getLanguageId,

  // Query building
  resolveQuery,
  buildSelectQuery,
  buildSelectByIdQuery,
  buildInsertQuery,
  buildUpdateQuery,
  buildDeleteQuery,

  // Response formatting
  formatListResponse,
  formatItemResponse,
  formatErrorResponse,
  formatSuccessResponse,

  // Routing helpers
  getEntityTypeFromPath,
  getOperationType,

  // Templates
  N8N_CODE_TEMPLATE_SELECT,
  N8N_CODE_TEMPLATE_INSERT,
  N8N_CODE_TEMPLATE_UPDATE,
  N8N_CODE_TEMPLATE_DELETE,
};
