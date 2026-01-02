/**
 * Universal Query Builder - Main Entry Point
 *
 * Export all query builder components for easy importing.
 *
 * @example
 * import { QueryBuilder, createQueryBuilder, formatListResponse } from './query-builder';
 *
 * const builder = createQueryBuilder('persons');
 * const { query, countQuery } = builder.buildSelect({ page: 1 });
 */

export {
  // Core Classes
  QueryBuilder,
  LookupQueryBuilder,
  TranslationQueryBuilder,

  // Factory Function
  createQueryBuilder,

  // Entity Configurations
  EntityConfigs,

  // Types
  type ColumnType,
  type ColumnDefinition,
  type JoinDefinition,
  type EntityConfig,
  type PaginationParams,
  type SelectParams,
  type PaginationMeta,
  type QueryResult,
  type N8nContext,
} from './QueryBuilder';

export {
  // N8n Context Helpers
  extractN8nContext,
  getLanguageId,

  // Query Building Helpers
  resolveQuery,
  buildSelectQuery,
  buildSelectByIdQuery,
  buildInsertQuery,
  buildUpdateQuery,
  buildDeleteQuery,

  // Response Formatting
  formatListResponse,
  formatItemResponse,
  formatErrorResponse,
  formatSuccessResponse,

  // Routing Helpers
  getEntityTypeFromPath,
  getOperationType,

  // Code Templates
  N8N_CODE_TEMPLATE_SELECT,
  N8N_CODE_TEMPLATE_INSERT,
  N8N_CODE_TEMPLATE_UPDATE,
  N8N_CODE_TEMPLATE_DELETE,
} from './n8nHelpers';
