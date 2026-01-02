/**
 * Universal Query Builder - Main Entry Point (JavaScript)
 *
 * Export all query builder components for easy importing in n8n.
 *
 * @example
 * const { createQueryBuilder, formatListResponse } = require('./query-builder');
 *
 * const builder = createQueryBuilder('persons');
 * const { query, countQuery } = builder.buildSelect({ page: 1 });
 */

const QueryBuilder = require('./QueryBuilder');

module.exports = {
  // Core Classes
  QueryBuilder: QueryBuilder.QueryBuilder,
  LookupQueryBuilder: QueryBuilder.LookupQueryBuilder,
  TranslationQueryBuilder: QueryBuilder.TranslationQueryBuilder,

  // Factory Function
  createQueryBuilder: QueryBuilder.createQueryBuilder,

  // Entity Configurations
  EntityConfigs: QueryBuilder.EntityConfigs,
  LOOKUP_TABLE_MAP: QueryBuilder.LOOKUP_TABLE_MAP,

  // Response Formatters
  formatListResponse: QueryBuilder.formatListResponse,
  formatItemResponse: QueryBuilder.formatItemResponse,
  formatErrorResponse: QueryBuilder.formatErrorResponse,
  formatSuccessResponse: QueryBuilder.formatSuccessResponse,
};
