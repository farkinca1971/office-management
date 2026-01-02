/**
 * Universal Query Builder for n8n Webhook MySQL Operations
 *
 * This module provides a type-safe, configurable query builder system
 * that handles SELECT, INSERT, UPDATE, and DELETE operations for all
 * object entities in the Office Application.
 *
 * Features:
 * - Pagination support with configurable defaults
 * - Shared primary key pattern (objects table + entity tables)
 * - Old/New value pattern for updates (audit trail support)
 * - Soft delete support
 * - Dynamic filtering and search
 * - Translation/language support
 * - Configurable entity definitions
 *
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Supported column data types for query building
 */
export type ColumnType = 'bigint' | 'int' | 'varchar' | 'text' | 'date' | 'datetime' | 'timestamp' | 'boolean' | 'decimal' | 'json';

/**
 * Column definition for entity tables
 */
export interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable?: boolean;
  defaultValue?: any;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyTable?: string;
  foreignKeyColumn?: string;
  searchable?: boolean;
  sortable?: boolean;
  /** For updates: use old/new pattern */
  trackChanges?: boolean;
}

/**
 * Join configuration for related tables
 */
export interface JoinDefinition {
  table: string;
  alias: string;
  type: 'INNER' | 'LEFT' | 'RIGHT';
  on: string;
  columns?: string[];
}

/**
 * Entity configuration defining table structure and relationships
 */
export interface EntityConfig {
  /** Primary table name */
  tableName: string;
  /** Table alias for queries */
  tableAlias: string;
  /** Object type code (person, company, user, invoice, transaction) */
  objectTypeCode: string;
  /** Uses shared primary key with objects table */
  usesSharedPrimaryKey: boolean;
  /** Column definitions */
  columns: ColumnDefinition[];
  /** Default columns to select */
  defaultSelectColumns: string[];
  /** Searchable columns for text search */
  searchColumns?: string[];
  /** Default sort column */
  defaultSortColumn: string;
  /** Default sort direction */
  defaultSortDirection: 'ASC' | 'DESC';
  /** Join definitions for related data */
  joins?: JoinDefinition[];
  /** Supports soft delete via is_active flag */
  supportsSoftDelete?: boolean;
  /** Object-level soft delete (delete from objects table) */
  usesObjectDelete?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

/**
 * Query parameters for SELECT operations
 */
export interface SelectParams extends PaginationParams {
  [key: string]: any;
  search?: string;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
  is_active?: number | boolean;
  language_id?: number;
  language_code?: string;
}

/**
 * Pagination metadata in response
 */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/**
 * Query result wrapper
 */
export interface QueryResult<T = any> {
  query: string;
  countQuery?: string;
  params: Record<string, any>;
}

/**
 * n8n context object structure
 */
export interface N8nContext {
  params: Record<string, any>;
  query: Record<string, any>;
  body: Record<string, any>;
  headers: Record<string, any>;
}

// ============================================================================
// ENTITY CONFIGURATIONS
// ============================================================================

/**
 * Pre-configured entity definitions for all object types
 */
export const EntityConfigs: Record<string, EntityConfig> = {
  persons: {
    tableName: 'persons',
    tableAlias: 'p',
    objectTypeCode: 'person',
    usesSharedPrimaryKey: true,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'first_name', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'middle_name', type: 'varchar', nullable: true, trackChanges: true },
      { name: 'last_name', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'mother_name', type: 'varchar', nullable: true, trackChanges: true },
      { name: 'sex_id', type: 'int', nullable: true, isForeignKey: true, foreignKeyTable: 'sexes', trackChanges: true },
      { name: 'salutation_id', type: 'int', nullable: true, isForeignKey: true, foreignKeyTable: 'salutations', trackChanges: true },
      { name: 'birth_date', type: 'date', nullable: true, trackChanges: true },
    ],
    defaultSelectColumns: ['id', 'first_name', 'middle_name', 'last_name', 'mother_name', 'sex_id', 'salutation_id', 'birth_date'],
    searchColumns: ['first_name', 'last_name'],
    defaultSortColumn: 'last_name',
    defaultSortDirection: 'ASC',
    joins: [
      { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = p.id', columns: ['object_status_id', 'object_type_id'] }
    ],
    usesObjectDelete: true,
  },

  companies: {
    tableName: 'companies',
    tableAlias: 'c',
    objectTypeCode: 'company',
    usesSharedPrimaryKey: true,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'company_id', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'company_name', type: 'varchar', searchable: true, trackChanges: true },
    ],
    defaultSelectColumns: ['id', 'company_id', 'company_name'],
    searchColumns: ['company_id', 'company_name'],
    defaultSortColumn: 'company_name',
    defaultSortDirection: 'ASC',
    joins: [
      { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = c.id', columns: ['object_status_id', 'object_type_id'] }
    ],
    usesObjectDelete: true,
  },

  users: {
    tableName: 'users',
    tableAlias: 'u',
    objectTypeCode: 'user',
    usesSharedPrimaryKey: true,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'username', type: 'varchar', searchable: true, trackChanges: true },
    ],
    defaultSelectColumns: ['id', 'username'],
    searchColumns: ['username'],
    defaultSortColumn: 'username',
    defaultSortDirection: 'ASC',
    joins: [
      { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = u.id', columns: ['object_status_id', 'object_type_id'] }
    ],
    usesObjectDelete: true,
  },

  invoices: {
    tableName: 'invoices',
    tableAlias: 'i',
    objectTypeCode: 'invoice',
    usesSharedPrimaryKey: true,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'transaction_id', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'transactions' },
      { name: 'invoice_number', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'issue_date', type: 'date', trackChanges: true },
      { name: 'due_date', type: 'date', nullable: true, trackChanges: true },
      { name: 'payment_date', type: 'date', nullable: true, trackChanges: true },
      { name: 'partner_id_from', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'partner_id_to', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'note', type: 'text', nullable: true, trackChanges: true },
      { name: 'reference_number', type: 'varchar', nullable: true, searchable: true, trackChanges: true },
      { name: 'is_mirror', type: 'boolean', nullable: true, defaultValue: false },
      { name: 'currency_id', type: 'int', isForeignKey: true, foreignKeyTable: 'currencies', trackChanges: true },
      { name: 'netto_amount', type: 'decimal', nullable: true, trackChanges: true },
      { name: 'tax', type: 'decimal', nullable: true, trackChanges: true },
      { name: 'final_amount', type: 'decimal', nullable: true, trackChanges: true },
      { name: 'is_paid', type: 'boolean', defaultValue: false, trackChanges: true },
      { name: 'is_void', type: 'boolean', defaultValue: false, trackChanges: true },
    ],
    defaultSelectColumns: ['id', 'transaction_id', 'invoice_number', 'issue_date', 'due_date', 'payment_date', 'partner_id_from', 'partner_id_to', 'note', 'reference_number', 'is_mirror', 'currency_id', 'netto_amount', 'tax', 'final_amount', 'is_paid', 'is_void'],
    searchColumns: ['invoice_number', 'reference_number'],
    defaultSortColumn: 'issue_date',
    defaultSortDirection: 'DESC',
    joins: [
      { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = i.id', columns: ['object_status_id', 'object_type_id'] }
    ],
    usesObjectDelete: true,
  },

  transactions: {
    tableName: 'transactions',
    tableAlias: 't',
    objectTypeCode: 'transaction',
    usesSharedPrimaryKey: true,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'transaction_type_id', type: 'int', isForeignKey: true, foreignKeyTable: 'transaction_types', trackChanges: true },
      { name: 'transaction_date_start', type: 'timestamp', trackChanges: true },
      { name: 'transaction_date_end', type: 'timestamp', nullable: true, trackChanges: true },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'note', type: 'text', nullable: true, searchable: true, trackChanges: true },
    ],
    defaultSelectColumns: ['id', 'transaction_type_id', 'transaction_date_start', 'transaction_date_end', 'is_active', 'note'],
    searchColumns: ['note'],
    defaultSortColumn: 'transaction_date_start',
    defaultSortDirection: 'DESC',
    joins: [
      { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = t.id', columns: ['object_status_id', 'object_type_id'] }
    ],
    supportsSoftDelete: true,
    usesObjectDelete: true,
  },

  object_addresses: {
    tableName: 'object_addresses',
    tableAlias: 'a',
    objectTypeCode: 'address',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'address_type_id', type: 'int', isForeignKey: true, foreignKeyTable: 'address_types', trackChanges: true },
      { name: 'street_address_1', type: 'varchar', trackChanges: true },
      { name: 'street_address_2', type: 'varchar', nullable: true, trackChanges: true },
      { name: 'address_area_type_id', type: 'int', nullable: true, isForeignKey: true, foreignKeyTable: 'address_area_types', trackChanges: true },
      { name: 'city', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'state_province', type: 'varchar', nullable: true, trackChanges: true },
      { name: 'postal_code', type: 'varchar', nullable: true, trackChanges: true },
      { name: 'country_id', type: 'int', isForeignKey: true, foreignKeyTable: 'countries', trackChanges: true },
      { name: 'latitude', type: 'decimal', nullable: true },
      { name: 'longitude', type: 'decimal', nullable: true },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_id', 'address_type_id', 'street_address_1', 'street_address_2', 'address_area_type_id', 'city', 'state_province', 'postal_code', 'country_id', 'latitude', 'longitude', 'is_active', 'created_by', 'created_at', 'updated_at'],
    searchColumns: ['city', 'street_address_1'],
    defaultSortColumn: 'created_at',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: true,
  },

  object_contacts: {
    tableName: 'object_contacts',
    tableAlias: 'oc',
    objectTypeCode: 'contact',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'contact_type_id', type: 'int', isForeignKey: true, foreignKeyTable: 'contact_types', trackChanges: true },
      { name: 'contact_value', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_id', 'contact_type_id', 'contact_value', 'is_active', 'created_by', 'created_at', 'updated_at'],
    searchColumns: ['contact_value'],
    defaultSortColumn: 'created_at',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: true,
  },

  object_identifications: {
    tableName: 'object_identifications',
    tableAlias: 'oi',
    objectTypeCode: 'identification',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'identification_type_id', type: 'int', isForeignKey: true, foreignKeyTable: 'identification_types', trackChanges: true },
      { name: 'identification_value', type: 'varchar', searchable: true, trackChanges: true },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_id', 'identification_type_id', 'identification_value', 'is_active', 'created_by', 'created_at', 'updated_at'],
    searchColumns: ['identification_value'],
    defaultSortColumn: 'created_at',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: true,
  },

  object_notes: {
    tableName: 'object_notes',
    tableAlias: 'n',
    objectTypeCode: 'note',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'note_type_id', type: 'int', nullable: true, isForeignKey: true, foreignKeyTable: 'note_types', trackChanges: true },
      { name: 'subject_code', type: 'varchar', nullable: true },
      { name: 'note_text_code', type: 'varchar' },
      { name: 'is_pinned', type: 'boolean', defaultValue: false },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_id', 'note_type_id', 'subject_code', 'note_text_code', 'is_pinned', 'is_active', 'created_by', 'created_at', 'updated_at'],
    defaultSortColumn: 'is_pinned',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: true,
  },

  object_relations: {
    tableName: 'object_relations',
    tableAlias: 'or',
    objectTypeCode: 'relation',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_from_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'object_to_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'object_relation_type_id', type: 'int', isForeignKey: true, foreignKeyTable: 'object_relation_types', trackChanges: true },
      { name: 'note', type: 'text', nullable: true, trackChanges: true },
      { name: 'is_active', type: 'boolean', defaultValue: true },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_from_id', 'object_to_id', 'object_relation_type_id', 'note', 'is_active', 'created_by', 'created_at', 'updated_at'],
    defaultSortColumn: 'created_at',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: true,
  },

  object_audits: {
    tableName: 'object_audits',
    tableAlias: 'oa',
    objectTypeCode: 'audit',
    usesSharedPrimaryKey: false,
    columns: [
      { name: 'id', type: 'bigint', isPrimaryKey: true },
      { name: 'object_id', type: 'bigint', isForeignKey: true, foreignKeyTable: 'objects' },
      { name: 'audit_action_id', type: 'int', isForeignKey: true, foreignKeyTable: 'audit_actions' },
      { name: 'created_by', type: 'bigint', nullable: true, isForeignKey: true, foreignKeyTable: 'users' },
      { name: 'old_values', type: 'json', nullable: true },
      { name: 'new_values', type: 'json', nullable: true },
      { name: 'ip_address', type: 'varchar', nullable: true },
      { name: 'user_agent', type: 'text', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamp' },
    ],
    defaultSelectColumns: ['id', 'object_id', 'audit_action_id', 'created_by', 'old_values', 'new_values', 'ip_address', 'user_agent', 'notes', 'created_at'],
    defaultSortColumn: 'created_at',
    defaultSortDirection: 'DESC',
    supportsSoftDelete: false,
  },
};

// ============================================================================
// QUERY BUILDER CLASS
// ============================================================================

/**
 * Universal Query Builder for generating MySQL queries
 *
 * @example
 * const builder = new QueryBuilder('persons');
 * const selectQuery = builder.buildSelect({ page: 1, per_page: 20, search: 'John' });
 * const insertQuery = builder.buildInsert({ first_name: 'John', last_name: 'Doe' });
 */
export class QueryBuilder {
  private config: EntityConfig;
  private defaultPageSize: number = 20;
  private maxPageSize: number = 100;

  constructor(entityType: string | EntityConfig) {
    if (typeof entityType === 'string') {
      const config = EntityConfigs[entityType];
      if (!config) {
        throw new Error(`Unknown entity type: ${entityType}. Available types: ${Object.keys(EntityConfigs).join(', ')}`);
      }
      this.config = config;
    } else {
      this.config = entityType;
    }
  }

  // --------------------------------------------------------------------------
  // SELECT QUERY BUILDER
  // --------------------------------------------------------------------------

  /**
   * Build a SELECT query with pagination, filtering, and sorting
   */
  buildSelect(params: SelectParams = {}): QueryResult {
    const { tableName, tableAlias, defaultSelectColumns, joins, defaultSortColumn, defaultSortDirection } = this.config;

    // Build column list
    const columns = this.buildSelectColumns();

    // Build FROM clause with joins
    const fromClause = this.buildFromClause();

    // Build WHERE clause
    const { whereClause, whereParams } = this.buildWhereClause(params);

    // Build ORDER BY clause
    const orderByClause = this.buildOrderByClause(params);

    // Build pagination
    const { limitClause, paginationParams } = this.buildPaginationClause(params);

    // Combine into final query
    const query = `
SELECT
    ${columns}
FROM ${fromClause}
${whereClause}
${orderByClause}
${limitClause}`.trim();

    // Build count query for pagination metadata
    const countQuery = `
SELECT COUNT(*) as total
FROM ${fromClause}
${whereClause}`.trim();

    return {
      query,
      countQuery,
      params: { ...whereParams, ...paginationParams },
    };
  }

  /**
   * Build a SELECT query for a single record by ID
   */
  buildSelectById(id: number | string): QueryResult {
    const { tableAlias } = this.config;
    const columns = this.buildSelectColumns();
    const fromClause = this.buildFromClause();

    const query = `
SELECT
    ${columns}
FROM ${fromClause}
WHERE ${tableAlias}.id = {{ id }}`.trim();

    return {
      query,
      params: { id },
    };
  }

  // --------------------------------------------------------------------------
  // INSERT QUERY BUILDER
  // --------------------------------------------------------------------------

  /**
   * Build an INSERT query
   * For entities with shared primary key, creates transaction with objects table insert
   */
  buildInsert(data: Record<string, any>): QueryResult {
    const { tableName, objectTypeCode, usesSharedPrimaryKey, columns } = this.config;

    if (usesSharedPrimaryKey) {
      return this.buildInsertWithSharedPrimaryKey(data);
    } else {
      return this.buildSimpleInsert(data);
    }
  }

  /**
   * Build INSERT for entities using shared primary key pattern (persons, companies, etc.)
   */
  private buildInsertWithSharedPrimaryKey(data: Record<string, any>): QueryResult {
    const { tableName, tableAlias, objectTypeCode, columns, defaultSelectColumns, joins } = this.config;

    // Filter columns that have values in data
    const entityColumns = columns.filter(col =>
      col.name !== 'id' && data[col.name] !== undefined
    );

    const columnNames = entityColumns.map(col => col.name);
    const columnValues = entityColumns.map(col => `{{ body.${col.name} }}`);

    // Build select columns for return
    const selectColumns = this.buildSelectColumns();
    const fromClause = this.buildFromClause();

    const query = `
-- Start transaction for shared primary key insert
START TRANSACTION;

-- Step 1: Create the object record (generates shared ID)
INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = '${objectTypeCode}'),
    {{ body.object_status_id }}
);

-- Step 2: Get the generated ID
SET @object_id = LAST_INSERT_ID();

-- Step 3: Insert into entity table using the same ID
INSERT INTO ${tableName} (
    id${columnNames.length > 0 ? ',\n    ' + columnNames.join(',\n    ') : ''}
) VALUES (
    @object_id${columnValues.length > 0 ? ',\n    ' + columnValues.join(',\n    ') : ''}
);

-- Commit transaction
COMMIT;

-- Return created record
SELECT
    ${selectColumns}
FROM ${fromClause}
WHERE ${tableAlias}.id = @object_id`.trim();

    return {
      query,
      params: data,
    };
  }

  /**
   * Build simple INSERT for entities without shared primary key
   */
  private buildSimpleInsert(data: Record<string, any>): QueryResult {
    const { tableName, tableAlias, columns } = this.config;

    // Filter columns that have values in data (exclude auto-generated fields)
    const insertableColumns = columns.filter(col =>
      !col.isPrimaryKey &&
      data[col.name] !== undefined &&
      col.name !== 'created_at' &&
      col.name !== 'updated_at'
    );

    const columnNames = insertableColumns.map(col => col.name);
    const columnValues = insertableColumns.map(col => `{{ body.${col.name} }}`);

    const query = `
INSERT INTO ${tableName} (
    ${columnNames.join(',\n    ')}
) VALUES (
    ${columnValues.join(',\n    ')}
);

-- Return created record
SELECT *
FROM ${tableName}
WHERE id = LAST_INSERT_ID()`.trim();

    return {
      query,
      params: data,
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE QUERY BUILDER
  // --------------------------------------------------------------------------

  /**
   * Build an UPDATE query
   * Supports both simple updates and old/new pattern for audit tracking
   */
  buildUpdate(id: number | string, data: Record<string, any>, useOldNewPattern: boolean = false): QueryResult {
    const { tableName, tableAlias, columns, usesSharedPrimaryKey, joins } = this.config;

    if (useOldNewPattern) {
      return this.buildUpdateWithOldNew(id, data);
    }

    // Build SET clause with COALESCE for partial updates
    const updateableColumns = columns.filter(col =>
      !col.isPrimaryKey &&
      data[col.name] !== undefined &&
      col.name !== 'created_at' &&
      col.name !== 'created_by'
    );

    const setStatements: string[] = [];

    // Entity table columns
    for (const col of updateableColumns) {
      setStatements.push(`${tableAlias}.${col.name} = COALESCE({{ body.${col.name} }}, ${tableAlias}.${col.name})`);
    }

    // If using shared primary key and object_status_id is provided, update objects table too
    let objectsUpdate = '';
    if (usesSharedPrimaryKey && data.object_status_id !== undefined) {
      objectsUpdate = `,\n    o.object_status_id = COALESCE({{ body.object_status_id }}, o.object_status_id)`;
    }

    const selectColumns = this.buildSelectColumns();
    const fromClause = this.buildFromClause();

    let query: string;

    if (usesSharedPrimaryKey && joins && joins.length > 0) {
      // Update with JOIN for shared primary key entities
      query = `
UPDATE ${tableName} ${tableAlias}
JOIN objects o ON o.id = ${tableAlias}.id
SET
    ${setStatements.join(',\n    ')}${objectsUpdate}
WHERE ${tableAlias}.id = {{ params.id }};

-- Return updated record
SELECT
    ${selectColumns}
FROM ${fromClause}
WHERE ${tableAlias}.id = {{ params.id }}`.trim();
    } else {
      // Simple update
      query = `
UPDATE ${tableName} ${tableAlias}
SET
    ${setStatements.join(',\n    ')},
    updated_at = NOW()
WHERE ${tableAlias}.id = {{ params.id }};

-- Return updated record
SELECT *
FROM ${tableName}
WHERE id = {{ params.id }}`.trim();
    }

    return {
      query,
      params: { id, ...data },
    };
  }

  /**
   * Build UPDATE with old/new value pattern for audit tracking
   */
  private buildUpdateWithOldNew(id: number | string, data: Record<string, any>): QueryResult {
    const { tableName, tableAlias, columns } = this.config;

    // Find columns that use the old/new pattern
    const trackableColumns = columns.filter(col => col.trackChanges);
    const setStatements: string[] = [];

    for (const col of trackableColumns) {
      const oldKey = `${col.name}_old`;
      const newKey = `${col.name}_new`;

      if (data[newKey] !== undefined) {
        // Only update if new value is provided
        setStatements.push(`${tableAlias}.${col.name} = {{ body.${newKey} }}`);
      }
    }

    if (setStatements.length === 0) {
      throw new Error('No columns to update. Provide at least one _new value.');
    }

    const query = `
UPDATE ${tableName} ${tableAlias}
SET
    ${setStatements.join(',\n    ')},
    updated_at = NOW()
WHERE ${tableAlias}.id = {{ params.id }};

-- Return updated record
SELECT *
FROM ${tableName}
WHERE id = {{ params.id }}`.trim();

    return {
      query,
      params: { id, ...data },
    };
  }

  // --------------------------------------------------------------------------
  // DELETE QUERY BUILDER
  // --------------------------------------------------------------------------

  /**
   * Build a DELETE query
   * Uses soft delete (is_active = false) for entities that support it
   * Uses CASCADE delete via objects table for shared primary key entities
   */
  buildDelete(id: number | string): QueryResult {
    const { tableName, supportsSoftDelete, usesObjectDelete } = this.config;

    let query: string;

    if (supportsSoftDelete) {
      // Soft delete by setting is_active = false
      query = `
UPDATE ${tableName}
SET is_active = 0, updated_at = NOW()
WHERE id = {{ params.id }};

SELECT 1 as success`.trim();
    } else if (usesObjectDelete) {
      // Delete from objects table (cascades to entity table)
      query = `
DELETE FROM objects
WHERE id = {{ params.id }};

SELECT 1 as success`.trim();
    } else {
      // Hard delete
      query = `
DELETE FROM ${tableName}
WHERE id = {{ params.id }};

SELECT 1 as success`.trim();
    }

    return {
      query,
      params: { id },
    };
  }

  // --------------------------------------------------------------------------
  // HELPER METHODS
  // --------------------------------------------------------------------------

  /**
   * Build the SELECT column list
   */
  private buildSelectColumns(): string {
    const { tableAlias, defaultSelectColumns, joins } = this.config;

    // Entity table columns
    const entityColumns = defaultSelectColumns.map(col => `${tableAlias}.${col}`);

    // Join table columns
    const joinColumns: string[] = [];
    if (joins) {
      for (const join of joins) {
        if (join.columns) {
          for (const col of join.columns) {
            joinColumns.push(`${join.alias}.${col}`);
          }
        }
      }
    }

    return [...entityColumns, ...joinColumns].join(',\n    ');
  }

  /**
   * Build the FROM clause with JOINs
   */
  private buildFromClause(): string {
    const { tableName, tableAlias, joins } = this.config;

    let clause = `${tableName} ${tableAlias}`;

    if (joins) {
      for (const join of joins) {
        clause += `\n${join.type} JOIN ${join.table} ${join.alias} ON ${join.on}`;
      }
    }

    return clause;
  }

  /**
   * Build the WHERE clause with filters
   */
  private buildWhereClause(params: SelectParams): { whereClause: string; whereParams: Record<string, any> } {
    const { tableAlias, searchColumns, supportsSoftDelete, usesSharedPrimaryKey } = this.config;
    const conditions: string[] = [];
    const whereParams: Record<string, any> = {};

    // Handle search parameter
    if (params.search && searchColumns && searchColumns.length > 0) {
      const searchConditions = searchColumns.map(col =>
        `${tableAlias}.${col} LIKE CONCAT('%', {{ query.search }}, '%')`
      );
      conditions.push(`({{ query.search }} IS NULL OR (${searchConditions.join(' OR ')}))`);
      whereParams.search = params.search;
    }

    // Handle is_active filter
    if (supportsSoftDelete) {
      if (params.is_active !== undefined) {
        conditions.push(`${tableAlias}.is_active = {{ query.is_active }}`);
        whereParams.is_active = params.is_active;
      } else {
        // Default to showing only active records
        conditions.push(`${tableAlias}.is_active = 1`);
      }
    }

    // Handle object_status_id filter for shared primary key entities
    if (usesSharedPrimaryKey && params.object_status_id !== undefined) {
      conditions.push(`({{ query.object_status_id }} IS NULL OR o.object_status_id = {{ query.object_status_id }})`);
      whereParams.object_status_id = params.object_status_id;
    }

    // Handle object_id filter for child entities (addresses, contacts, etc.)
    if (params.object_id !== undefined) {
      conditions.push(`${tableAlias}.object_id = {{ query.object_id }}`);
      whereParams.object_id = params.object_id;
    }

    // Build WHERE clause
    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join('\n    AND ')}`
      : '';

    return { whereClause, whereParams };
  }

  /**
   * Build the ORDER BY clause
   */
  private buildOrderByClause(params: SelectParams): string {
    const { tableAlias, defaultSortColumn, defaultSortDirection } = this.config;

    const sortColumn = params.sort_by || defaultSortColumn;
    const sortDirection = params.sort_dir || defaultSortDirection;

    // Handle special case for notes (pinned first)
    if (this.config.tableName === 'object_notes') {
      return `ORDER BY ${tableAlias}.is_pinned DESC, ${tableAlias}.${sortColumn} ${sortDirection}`;
    }

    return `ORDER BY ${tableAlias}.${sortColumn} ${sortDirection}`;
  }

  /**
   * Build the LIMIT/OFFSET clause for pagination
   */
  private buildPaginationClause(params: PaginationParams): { limitClause: string; paginationParams: Record<string, any> } {
    const page = Math.max(1, params.page || 1);
    const perPage = Math.min(this.maxPageSize, Math.max(1, params.per_page || this.defaultPageSize));
    const offset = (page - 1) * perPage;

    return {
      limitClause: `LIMIT {{ query.per_page }}\nOFFSET {{ query.offset }}`,
      paginationParams: {
        page,
        per_page: perPage,
        offset,
      },
    };
  }
}

// ============================================================================
// LOOKUP TABLE QUERY BUILDER
// ============================================================================

/**
 * Specialized query builder for lookup/reference tables
 */
export class LookupQueryBuilder {
  private lookupType: string;
  private tableName: string;

  /**
   * Lookup type to table name mapping
   */
  private static readonly tableMapping: Record<string, string> = {
    'languages': 'languages',
    'object-types': 'object_types',
    'object-statuses': 'object_statuses',
    'sexes': 'sexes',
    'salutations': 'salutations',
    'product-categories': 'product_categories',
    'countries': 'countries',
    'address-types': 'address_types',
    'address-area-types': 'address_area_types',
    'contact-types': 'contact_types',
    'identification-types': 'identification_types',
    'transaction-types': 'transaction_types',
    'currencies': 'currencies',
    'object-relation-types': 'object_relation_types',
    'note-types': 'note_types',
    'audit-actions': 'audit_actions',
  };

  constructor(lookupType: string) {
    this.lookupType = lookupType;
    const tableName = LookupQueryBuilder.tableMapping[lookupType];
    if (!tableName) {
      throw new Error(`Unknown lookup type: ${lookupType}. Available types: ${Object.keys(LookupQueryBuilder.tableMapping).join(', ')}`);
    }
    this.tableName = tableName;
  }

  /**
   * Build SELECT query for lookup items with optional translation
   */
  buildSelect(params: { language_id?: number; language_code?: string; is_active?: number; object_type_id?: number } = {}): QueryResult {
    const hasTranslation = this.tableName !== 'languages' && this.tableName !== 'currencies';

    let query: string;

    if (hasTranslation) {
      query = `
SELECT
    lt.id,
    lt.code,
    lt.is_active,
    ${this.tableName === 'object_statuses' ? 'lt.object_type_id,' : ''}
    ${this.tableName === 'object_relation_types' ? `lt.parent_object_type_id,
    lt.child_object_type_id,
    lt.mirrored_type_id,` : ''}
    t.text as name
FROM ${this.tableName} lt
LEFT JOIN translations t ON t.code = lt.code
    AND t.language_id = COALESCE(
        {{ query.language_id }},
        (SELECT id FROM languages WHERE code = COALESCE({{ query.language_code }}, 'en') LIMIT 1)
    )
WHERE lt.is_active = COALESCE({{ query.is_active }}, 1)
    ${this.tableName === 'object_statuses' ? 'AND ({{ query.object_type_id }} IS NULL OR lt.object_type_id = {{ query.object_type_id }})' : ''}
ORDER BY lt.code`.trim();
    } else {
      // Languages and currencies don't use translations table
      query = `
SELECT
    id,
    code,
    is_active
FROM ${this.tableName}
WHERE is_active = COALESCE({{ query.is_active }}, 1)
ORDER BY code`.trim();
    }

    return {
      query,
      params,
    };
  }

  /**
   * Build SELECT query for single lookup item by ID
   */
  buildSelectById(id: number | string): QueryResult {
    const query = `
SELECT *
FROM ${this.tableName}
WHERE id = {{ params.id }}`.trim();

    return {
      query,
      params: { id },
    };
  }

  /**
   * Build INSERT query for lookup item
   */
  buildInsert(data: Record<string, any>): QueryResult {
    const columns = ['code', 'is_active'];
    const values = ['{{ body.code }}', 'COALESCE({{ body.is_active }}, 1)'];

    // Add special columns for object_statuses
    if (this.tableName === 'object_statuses' && data.object_type_id !== undefined) {
      columns.push('object_type_id');
      values.push('{{ body.object_type_id }}');
    }

    // Add special columns for object_relation_types
    if (this.tableName === 'object_relation_types') {
      if (data.parent_object_type_id !== undefined) {
        columns.push('parent_object_type_id');
        values.push('{{ body.parent_object_type_id }}');
      }
      if (data.child_object_type_id !== undefined) {
        columns.push('child_object_type_id');
        values.push('{{ body.child_object_type_id }}');
      }
      if (data.mirrored_type_id !== undefined) {
        columns.push('mirrored_type_id');
        values.push('{{ body.mirrored_type_id }}');
      }
    }

    const query = `
INSERT INTO ${this.tableName} (${columns.join(', ')})
VALUES (${values.join(', ')});

-- If text and language_id provided, insert translation
${data.text && data.language_id ? `
INSERT INTO translations (code, language_id, text)
VALUES ({{ body.code }}, {{ body.language_id }}, {{ body.text }})
ON DUPLICATE KEY UPDATE text = {{ body.text }};
` : ''}

SELECT * FROM ${this.tableName} WHERE id = LAST_INSERT_ID()`.trim();

    return {
      query,
      params: data,
    };
  }

  /**
   * Build UPDATE query for lookup item
   */
  buildUpdate(id: number | string, data: Record<string, any>): QueryResult {
    const setStatements = ['code = COALESCE({{ body.code }}, code)', 'is_active = COALESCE({{ body.is_active }}, is_active)'];

    if (this.tableName === 'object_statuses') {
      setStatements.push('object_type_id = COALESCE({{ body.object_type_id }}, object_type_id)');
    }

    if (this.tableName === 'object_relation_types') {
      setStatements.push('parent_object_type_id = COALESCE({{ body.parent_object_type_id }}, parent_object_type_id)');
      setStatements.push('child_object_type_id = COALESCE({{ body.child_object_type_id }}, child_object_type_id)');
      setStatements.push('mirrored_type_id = COALESCE({{ body.mirrored_type_id }}, mirrored_type_id)');
    }

    const query = `
UPDATE ${this.tableName}
SET ${setStatements.join(',\n    ')}
WHERE id = {{ params.id }};

-- If text and language_id provided, update translation
${data.text && data.language_id ? `
INSERT INTO translations (code, language_id, text)
SELECT code, {{ body.language_id }}, {{ body.text }}
FROM ${this.tableName} WHERE id = {{ params.id }}
ON DUPLICATE KEY UPDATE text = {{ body.text }};
` : ''}

SELECT * FROM ${this.tableName} WHERE id = {{ params.id }}`.trim();

    return {
      query,
      params: { id, ...data },
    };
  }

  /**
   * Build DELETE (soft delete) query for lookup item
   */
  buildDelete(id: number | string): QueryResult {
    const query = `
UPDATE ${this.tableName}
SET is_active = 0
WHERE id = {{ params.id }};

SELECT 1 as success`.trim();

    return {
      query,
      params: { id },
    };
  }
}

// ============================================================================
// TRANSLATIONS QUERY BUILDER
// ============================================================================

/**
 * Specialized query builder for translations table (composite key)
 */
export class TranslationQueryBuilder {
  /**
   * Build SELECT query for translations
   */
  buildSelect(params: { code?: string; language_id?: number } = {}): QueryResult {
    const conditions: string[] = [];

    if (params.code) {
      conditions.push('code = {{ query.code }}');
    }
    if (params.language_id) {
      conditions.push('language_id = {{ query.language_id }}');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
SELECT
    code,
    language_id,
    text
FROM translations
${whereClause}
ORDER BY code, language_id`.trim();

    return {
      query,
      params,
    };
  }

  /**
   * Build SELECT query for single translation by composite key
   */
  buildSelectByKey(code: string, languageId: number): QueryResult {
    const query = `
SELECT
    code,
    language_id,
    text
FROM translations
WHERE code = {{ params.code }}
    AND language_id = {{ params.language_id }}`.trim();

    return {
      query,
      params: { code, language_id: languageId },
    };
  }

  /**
   * Build INSERT query for translation
   */
  buildInsert(data: { code: string; language_id: number; text: string }): QueryResult {
    const query = `
INSERT INTO translations (code, language_id, text)
VALUES ({{ body.code }}, {{ body.language_id }}, {{ body.text }});

SELECT * FROM translations WHERE code = {{ body.code }} AND language_id = {{ body.language_id }}`.trim();

    return {
      query,
      params: data,
    };
  }

  /**
   * Build UPDATE query for translation
   */
  buildUpdate(code: string, languageId: number, data: { text: string }): QueryResult {
    const query = `
UPDATE translations
SET text = {{ body.text }}
WHERE code = {{ params.code }}
    AND language_id = {{ params.language_id }};

SELECT * FROM translations WHERE code = {{ params.code }} AND language_id = {{ params.language_id }}`.trim();

    return {
      query,
      params: { code, language_id: languageId, ...data },
    };
  }

  /**
   * Build DELETE query for translation
   */
  buildDelete(code: string, languageId: number): QueryResult {
    const query = `
DELETE FROM translations
WHERE code = {{ params.code }}
    AND language_id = {{ params.language_id }};

SELECT 1 as success`.trim();

    return {
      query,
      params: { code, language_id: languageId },
    };
  }

  /**
   * Build UPSERT query for translation (insert or update)
   */
  buildUpsert(data: { code: string; language_id: number; text: string }): QueryResult {
    const query = `
INSERT INTO translations (code, language_id, text)
VALUES ({{ body.code }}, {{ body.language_id }}, {{ body.text }})
ON DUPLICATE KEY UPDATE text = {{ body.text }};

SELECT * FROM translations WHERE code = {{ body.code }} AND language_id = {{ body.language_id }}`.trim();

    return {
      query,
      params: data,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Factory function to create appropriate query builder based on entity type
 *
 * @example
 * const personBuilder = createQueryBuilder('persons');
 * const lookupBuilder = createQueryBuilder('lookup:address-types');
 * const translationBuilder = createQueryBuilder('translation');
 */
export function createQueryBuilder(type: string): QueryBuilder | LookupQueryBuilder | TranslationQueryBuilder {
  if (type === 'translation' || type === 'translations') {
    return new TranslationQueryBuilder();
  }

  if (type.startsWith('lookup:')) {
    const lookupType = type.substring(7);
    return new LookupQueryBuilder(lookupType);
  }

  return new QueryBuilder(type);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  QueryBuilder,
  LookupQueryBuilder,
  TranslationQueryBuilder,
  EntityConfigs,
  createQueryBuilder,
};
