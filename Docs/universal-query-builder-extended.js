  /**
   * Universal Query Builder for n8n Webhook MySQL Operations
   *
   * JavaScript version for direct use in n8n Code nodes.
   * Extended with Documents and Files entity support.
   *
   * @author Claude Code
   * @version 1.1.0
   */

  // ============================================================================
  // ENTITY CONFIGURATIONS
  // ============================================================================

  const EntityConfigs = {
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
        { name: 'sex_id', type: 'int', nullable: true, trackChanges: true },
        { name: 'salutation_id', type: 'int', nullable: true, trackChanges: true },
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
        { name: 'transaction_id', type: 'bigint', nullable: true },
        { name: 'invoice_number', type: 'varchar', searchable: true, trackChanges: true },
        { name: 'issue_date', type: 'date', trackChanges: true },
        { name: 'due_date', type: 'date', nullable: true, trackChanges: true },
        { name: 'payment_date', type: 'date', nullable: true, trackChanges: true },
        { name: 'partner_id_from', type: 'bigint', nullable: true },
        { name: 'partner_id_to', type: 'bigint', nullable: true },
        { name: 'note', type: 'text', nullable: true, trackChanges: true },
        { name: 'reference_number', type: 'varchar', nullable: true, searchable: true, trackChanges: true },
        { name: 'is_mirror', type: 'boolean', nullable: true },
        { name: 'currency_id', type: 'int', trackChanges: true },
        { name: 'netto_amount', type: 'decimal', nullable: true, trackChanges: true },
        { name: 'tax', type: 'decimal', nullable: true, trackChanges: true },
        { name: 'final_amount', type: 'decimal', nullable: true, trackChanges: true },
        { name: 'is_paid', type: 'boolean', trackChanges: true },
        { name: 'is_void', type: 'boolean', trackChanges: true },
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
        { name: 'transaction_type_id', type: 'int', trackChanges: true },
        { name: 'transaction_date_start', type: 'timestamp', trackChanges: true },
        { name: 'transaction_date_end', type: 'timestamp', nullable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
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

    documents: {
      tableName: 'documents',
      tableAlias: 'd',
      objectTypeCode: 'document',
      usesSharedPrimaryKey: true,
      columns: [
        { name: 'id', type: 'bigint', isPrimaryKey: true },
        { name: 'title_code', type: 'varchar', trackChanges: true },
        { name: 'document_type_id', type: 'int', nullable: true, trackChanges: true },
        { name: 'document_date', type: 'date', nullable: true, trackChanges: true },
        { name: 'document_number', type: 'varchar', nullable: true, searchable: true, trackChanges: true },
        { name: 'expiry_date', type: 'date', nullable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
        { name: 'created_at', type: 'timestamp' },
        { name: 'updated_at', type: 'timestamp' },
      ],
      defaultSelectColumns: ['id', 'title_code', 'document_type_id', 'document_date', 'document_number', 'expiry_date', 'is_active', 'created_by', 'created_at', 'updated_at'],
      searchColumns: ['document_number'],
      defaultSortColumn: 'created_at',
      defaultSortDirection: 'DESC',
      joins: [
        { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = d.id', columns: ['object_status_id', 'object_type_id'] }
      ],
      translationColumns: ['title_code'],
      supportsSoftDelete: true,
      usesObjectDelete: true,
    },

    files: {
      tableName: 'files',
      tableAlias: 'f',
      objectTypeCode: 'file',
      usesSharedPrimaryKey: true,
      columns: [
        { name: 'id', type: 'bigint', isPrimaryKey: true },
        { name: 'filename', type: 'varchar', searchable: true, trackChanges: true },
        { name: 'original_filename', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'file_path', type: 'text', nullable: true, trackChanges: true },
        { name: 'mime_type', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'file_size', type: 'bigint', nullable: true, trackChanges: true },
        { name: 'upload_date', type: 'timestamp' },
        { name: 'checksum', type: 'varchar', nullable: true },
        { name: 'storage_type', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'bucket_name', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'storage_key', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
        { name: 'created_at', type: 'timestamp' },
        { name: 'updated_at', type: 'timestamp' },
      ],
      defaultSelectColumns: ['id', 'filename', 'original_filename', 'file_path', 'mime_type', 'file_size', 'upload_date', 'checksum', 'storage_type', 'bucket_name', 'storage_key', 'is_active', 'created_by', 'created_at', 'updated_at'],
      searchColumns: ['filename', 'original_filename'],
      defaultSortColumn: 'created_at',
      defaultSortDirection: 'DESC',
      joins: [
        { table: 'objects', alias: 'o', type: 'INNER', on: 'o.id = f.id', columns: ['object_status_id', 'object_type_id'] }
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
        { name: 'object_id', type: 'bigint' },
        { name: 'address_type_id', type: 'int', trackChanges: true },
        { name: 'street_address_1', type: 'varchar', trackChanges: true },
        { name: 'street_address_2', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'address_area_type_id', type: 'int', nullable: true, trackChanges: true },
        { name: 'city', type: 'varchar', searchable: true, trackChanges: true },
        { name: 'state_province', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'postal_code', type: 'varchar', nullable: true, trackChanges: true },
        { name: 'country_id', type: 'int', trackChanges: true },
        { name: 'latitude', type: 'decimal', nullable: true },
        { name: 'longitude', type: 'decimal', nullable: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
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
        { name: 'object_id', type: 'bigint' },
        { name: 'contact_type_id', type: 'int', trackChanges: true },
        { name: 'contact_value', type: 'varchar', searchable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
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
        { name: 'object_id', type: 'bigint' },
        { name: 'identification_type_id', type: 'int', trackChanges: true },
        { name: 'identification_value', type: 'varchar', searchable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
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
        { name: 'object_id', type: 'bigint' },
        { name: 'note_type_id', type: 'int', nullable: true, trackChanges: true },
        { name: 'subject_code', type: 'varchar', nullable: true },
        { name: 'note_text_code', type: 'varchar' },
        { name: 'is_pinned', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
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
        { name: 'object_from_id', type: 'bigint' },
        { name: 'object_to_id', type: 'bigint' },
        { name: 'object_relation_type_id', type: 'int', trackChanges: true },
        { name: 'note', type: 'text', nullable: true, trackChanges: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_by', type: 'bigint', nullable: true },
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
        { name: 'object_id', type: 'bigint' },
        { name: 'audit_action_id', type: 'int' },
        { name: 'created_by', type: 'bigint', nullable: true },
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

  // Lookup table mapping
  const LOOKUP_TABLE_MAP = {
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
    'document-types': 'document_types',
    'audit-actions': 'audit_actions',
  };

  // ============================================================================
  // QUERY BUILDER CLASS
  // ============================================================================

  class QueryBuilder {
    constructor(entityType) {
      if (typeof entityType === 'string') {
        const config = EntityConfigs[entityType];
        if (!config) {
          throw new Error(`Unknown entity type: ${entityType}. Available: ${Object.keys(EntityConfigs).join(', ')}`);
        }
        this.config = config;
      } else {
        this.config = entityType;
      }
      this.defaultPageSize = 20;
      this.maxPageSize = 100;
    }

    // SELECT query builder
    buildSelect(params = {}) {
      const columns = this._buildSelectColumns(params);
      const fromClause = this._buildFromClause(params);
      const { whereClause, whereParams } = this._buildWhereClause(params);
      const orderByClause = this._buildOrderByClause(params);
      const { limitClause, paginationParams } = this._buildPaginationClause(params);

      const query = `
  SELECT
      ${columns}
  FROM ${fromClause}
  ${whereClause}
  ${orderByClause}
  ${limitClause}`.trim();

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

    // SELECT by ID
    buildSelectById(id, params = {}) {
      const { tableAlias } = this.config;
      const columns = this._buildSelectColumns(params);
      const fromClause = this._buildFromClause(params);

      return {
        query: `
  SELECT
      ${columns}
  FROM ${fromClause}
  WHERE ${tableAlias}.id = ${this._formatValue(id)}`.trim(),
        params: { id },
      };
    }

    // INSERT query builder
    buildInsert(data) {
      if (this.config.usesSharedPrimaryKey) {
        return this._buildInsertWithSharedPrimaryKey(data);
      }
      return this._buildSimpleInsert(data);
    }

    _buildInsertWithSharedPrimaryKey(data) {
      const { tableName, tableAlias, objectTypeCode, columns } = this.config;

      const entityColumns = columns.filter(col =>
        col.name !== 'id' && data[col.name] !== undefined
      );

      const columnNames = entityColumns.map(col => col.name);
      const columnValues = entityColumns.map(col => this._formatValue(data[col.name]));

      // Extract language params from data if present
      const params = {
        language_id: data.language_id,
        language_code: data.language_code
      };
      const selectColumns = this._buildSelectColumns(params);
      const fromClause = this._buildFromClause(params);

      return {
        query: `
  START TRANSACTION;

  INSERT INTO objects (object_type_id, object_status_id)
  VALUES (
      (SELECT id FROM object_types WHERE code = '${objectTypeCode}'),
      ${this._formatValue(data.object_status_id)}
  );

  SET @object_id = LAST_INSERT_ID();

  INSERT INTO ${tableName} (
      id${columnNames.length > 0 ? ', ' + columnNames.join(', ') : ''}
  ) VALUES (
      @object_id${columnValues.length > 0 ? ', ' + columnValues.join(', ') : ''}
  );

  COMMIT;

  SELECT
      ${selectColumns}
  FROM ${fromClause}
  WHERE ${tableAlias}.id = @object_id`.trim(),
        params: data,
      };
    }

    _buildSimpleInsert(data) {
      const { tableName, columns } = this.config;

      const insertableColumns = columns.filter(col =>
        !col.isPrimaryKey &&
        data[col.name] !== undefined &&
        col.name !== 'created_at' &&
        col.name !== 'updated_at'
      );

      const columnNames = insertableColumns.map(col => col.name);
      const columnValues = insertableColumns.map(col => this._formatValue(data[col.name]));

      return {
        query: `
  INSERT INTO ${tableName} (${columnNames.join(', ')})
  VALUES (${columnValues.join(', ')});

  SELECT * FROM ${tableName} WHERE id = LAST_INSERT_ID()`.trim(),
        params: data,
      };
    }

    // UPDATE query builder
    buildUpdate(id, data, useOldNewPattern = false) {
      if (useOldNewPattern) {
        return this._buildUpdateWithOldNew(id, data);
      }

      const { tableName, tableAlias, columns, usesSharedPrimaryKey, joins } = this.config;

      const updateableColumns = columns.filter(col =>
        !col.isPrimaryKey &&
        data[col.name] !== undefined &&
        col.name !== 'created_at' &&
        col.name !== 'created_by'
      );

      const setStatements = updateableColumns.map(col =>
        `${tableAlias}.${col.name} = COALESCE(${this._formatValue(data[col.name])}, ${tableAlias}.${col.name})`
      );

      let objectsUpdate = '';
      if (usesSharedPrimaryKey && data.object_status_id !== undefined) {
        objectsUpdate = `,\n    o.object_status_id = COALESCE(${this._formatValue(data.object_status_id)}, o.object_status_id)`;
      }

      // Extract language params from data if present
      const params = {
        language_id: data.language_id,
        language_code: data.language_code
      };
      const selectColumns = this._buildSelectColumns(params);
      const fromClause = this._buildFromClause(params);

      let query;
      if (usesSharedPrimaryKey && joins && joins.length > 0) {
        query = `
  UPDATE ${tableName} ${tableAlias}
  JOIN objects o ON o.id = ${tableAlias}.id
  SET
      ${setStatements.join(',\n    ')}${objectsUpdate}
  WHERE ${tableAlias}.id = ${this._formatValue(id)};

  SELECT
      ${selectColumns}
  FROM ${fromClause}
  WHERE ${tableAlias}.id = ${this._formatValue(id)}`.trim();
      } else {
        query = `
  UPDATE ${tableName} ${tableAlias}
  SET
      ${setStatements.join(',\n    ')},
      updated_at = NOW()
  WHERE ${tableAlias}.id = ${this._formatValue(id)};

  SELECT * FROM ${tableName} WHERE id = ${this._formatValue(id)}`.trim();
      }

      return { query, params: { id, ...data } };
    }

    _buildUpdateWithOldNew(id, data) {
      const { tableName, tableAlias, columns } = this.config;
      const trackableColumns = columns.filter(col => col.trackChanges);
      const setStatements = [];

      for (const col of trackableColumns) {
        const newKey = `${col.name}_new`;
        if (data[newKey] !== undefined) {
          setStatements.push(`${tableAlias}.${col.name} = ${this._formatValue(data[newKey])}`);
        }
      }

      if (setStatements.length === 0) {
        throw new Error('No columns to update. Provide at least one _new value.');
      }

      return {
        query: `
  UPDATE ${tableName} ${tableAlias}
  SET
      ${setStatements.join(',\n    ')},
      updated_at = NOW()
  WHERE ${tableAlias}.id = ${this._formatValue(id)};

  SELECT * FROM ${tableName} WHERE id = ${this._formatValue(id)}`.trim(),
        params: { id, ...data },
      };
    }

    // DELETE query builder
    buildDelete(id) {
      const { tableName, supportsSoftDelete, usesObjectDelete } = this.config;

      let query;
      if (supportsSoftDelete) {
        query = `
  UPDATE ${tableName}
  SET is_active = 0, updated_at = NOW()
  WHERE id = ${this._formatValue(id)};

  SELECT 1 as success`.trim();
      } else if (usesObjectDelete) {
        query = `
  DELETE FROM objects WHERE id = ${this._formatValue(id)};

  SELECT 1 as success`.trim();
      } else {
        query = `
  DELETE FROM ${tableName} WHERE id = ${this._formatValue(id)};

  SELECT 1 as success`.trim();
      }

      return { query, params: { id } };
    }

    // Helper methods
    _buildSelectColumns(params = {}) {
      const { tableAlias, defaultSelectColumns, joins, translationColumns } = this.config;
      const entityColumns = [];
      const joinColumns = [];

      // Ensure params is an object
      const safeParams = params || {};
      
      // Determine language for translations (used for column selection, not joins)
      // Note: Language is actually used in _buildFromClause for joins
      // This is kept here for potential future use in column selection logic

      // Build entity columns with translations if needed
      for (const col of defaultSelectColumns) {
        if (translationColumns && Array.isArray(translationColumns) && translationColumns.includes(col)) {
          // Add the code column
          entityColumns.push(`${tableAlias}.${col}`);
          // Add translated text column (remove '_code' suffix for the alias)
          const translationAlias = `t_${col}`;
          const translatedColumnName = col.replace('_code', '');
          entityColumns.push(`COALESCE(${translationAlias}.text, ${tableAlias}.${col}) as ${translatedColumnName}`);
        } else {
          entityColumns.push(`${tableAlias}.${col}`);
        }
      }

      if (joins) {
        for (const join of joins) {
          if (join.columns) {
            joinColumns.push(...join.columns.map(col => `${join.alias}.${col}`));
          }
        }
      }

      return [...entityColumns, ...joinColumns].join(',\n    ');
    }

    _buildFromClause(params = {}) {
      const { tableName, tableAlias, joins, translationColumns } = this.config;
      let clause = `${tableName} ${tableAlias}`;

      // Ensure params is an object
      const safeParams = params || {};

      // Add regular joins first
      if (joins) {
        for (const join of joins) {
          clause += `\n${join.type} JOIN ${join.table} ${join.alias} ON ${join.on}`;
        }
      }

      // Add translation joins if needed
      // IMPORTANT: Check if translationColumns exists and has items
      // Store debug info for this method
      const translationDebug = {
        hasTranslationColumns: !!translationColumns,
        translationColumnsType: typeof translationColumns,
        isArray: Array.isArray(translationColumns),
        length: translationColumns?.length,
        value: translationColumns,
        safeParams: safeParams
      };
      
      // Store in a way that can be accessed later if needed
      this._lastTranslationDebug = translationDebug;
      
      if (translationColumns && Array.isArray(translationColumns) && translationColumns.length > 0) {
        // Determine language for translations
        let languageCondition = '';
        
        if (safeParams.language_id) {
          // Use language_id directly if provided
          const languageId = parseInt(safeParams.language_id);
          languageCondition = String(languageId);
        } else if (safeParams.language_code) {
          // Use subquery to get language_id from language code
          const languageCode = String(safeParams.language_code).toLowerCase().trim().replace(/'/g, "''");
          languageCondition = `(SELECT id FROM languages WHERE LOWER(code) = LOWER('${languageCode}') LIMIT 1)`;
        } else {
          // Default to English (language_id = 1)
          languageCondition = '1';
        }

        // Build translation joins for each translation column
        for (const col of translationColumns) {
          const translationAlias = `t_${col}`;
          clause += `\nLEFT JOIN translations ${translationAlias} ON ${translationAlias}.code = ${tableAlias}.${col} AND ${translationAlias}.language_id = ${languageCondition}`;
        }
      }

      return clause;
    }

    _buildWhereClause(params) {
      const { tableAlias, searchColumns, supportsSoftDelete, usesSharedPrimaryKey } = this.config;
      const conditions = [];
      const whereParams = {};

      if (params.search && searchColumns && searchColumns.length > 0) {
        const searchConditions = searchColumns.map(col =>
          `${tableAlias}.${col} LIKE CONCAT('%', ${this._formatValue(params.search)}, '%')`
        );
        conditions.push(`(${searchConditions.join(' OR ')})`);
        whereParams.search = params.search;
      }

      if (supportsSoftDelete) {
        if (params.is_active !== undefined) {
          conditions.push(`${tableAlias}.is_active = ${params.is_active ? 1 : 0}`);
          whereParams.is_active = params.is_active;
        } else {
          conditions.push(`${tableAlias}.is_active = 1`);
        }
      }

      if (usesSharedPrimaryKey && params.object_status_id !== undefined) {
        conditions.push(`o.object_status_id = ${this._formatValue(params.object_status_id)}`);
        whereParams.object_status_id = params.object_status_id;
      }

      if (params.object_id !== undefined) {
        conditions.push(`${tableAlias}.object_id = ${this._formatValue(params.object_id)}`);
        whereParams.object_id = params.object_id;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join('\n    AND ')}` : '';
      return { whereClause, whereParams };
    }

    _buildOrderByClause(params) {
      const { tableAlias, defaultSortColumn, defaultSortDirection } = this.config;
      const sortColumn = params.sort_by || defaultSortColumn;
      const sortDirection = params.sort_dir || defaultSortDirection;

      if (this.config.tableName === 'object_notes') {
        return `ORDER BY ${tableAlias}.is_pinned DESC, ${tableAlias}.${sortColumn} ${sortDirection}`;
      }

      return `ORDER BY ${tableAlias}.${sortColumn} ${sortDirection}`;
    }

    _buildPaginationClause(params) {
      const page = Math.max(1, params.page || 1);
      const perPage = Math.min(this.maxPageSize, Math.max(1, params.per_page || this.defaultPageSize));
      const offset = (page - 1) * perPage;

      return {
        limitClause: `LIMIT ${perPage}\nOFFSET ${offset}`,
        paginationParams: { page, per_page: perPage, offset },
      };
    }

    _formatValue(value) {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value ? '1' : '0';
      if (typeof value === 'string') {
        const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      }
      if (typeof value === 'object') {
        const json = JSON.stringify(value);
        const escaped = json.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      }
      return 'NULL';
    }
  }

  // ============================================================================
  // LOOKUP QUERY BUILDER
  // ============================================================================

  class LookupQueryBuilder {
    constructor(lookupType) {
      this.lookupType = lookupType;
      const tableName = LOOKUP_TABLE_MAP[lookupType];
      if (!tableName) {
        throw new Error(`Unknown lookup type: ${lookupType}. Available: ${Object.keys(LOOKUP_TABLE_MAP).join(', ')}`);
      }
      this.tableName = tableName;
    }

    buildSelect(params = {}) {
      const hasTranslation = this.tableName !== 'languages' && this.tableName !== 'currencies';
      const languageId = params.language_id || 1;

      let query;
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
  LEFT JOIN translations t ON t.code = lt.code AND t.language_id = ${languageId}
  WHERE lt.is_active = ${params.is_active !== undefined ? (params.is_active ? 1 : 0) : 1}
      ${this.tableName === 'object_statuses' && params.object_type_id ? `AND lt.object_type_id = ${params.object_type_id}` : ''}
  ORDER BY lt.code`.trim();
      } else {
        query = `
  SELECT id, code, is_active
  FROM ${this.tableName}
  WHERE is_active = ${params.is_active !== undefined ? (params.is_active ? 1 : 0) : 1}
  ORDER BY code`.trim();
      }

      return { query, params };
    }

    buildSelectById(id) {
      return {
        query: `SELECT * FROM ${this.tableName} WHERE id = ${this._formatValue(id)}`,
        params: { id },
      };
    }

    buildInsert(data) {
      const columns = ['code', 'is_active'];
      const values = [this._formatValue(data.code), data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1];

      if (this.tableName === 'object_statuses' && data.object_type_id !== undefined) {
        columns.push('object_type_id');
        values.push(this._formatValue(data.object_type_id));
      }

      if (this.tableName === 'object_relation_types') {
        if (data.parent_object_type_id !== undefined) {
          columns.push('parent_object_type_id');
          values.push(this._formatValue(data.parent_object_type_id));
        }
        if (data.child_object_type_id !== undefined) {
          columns.push('child_object_type_id');
          values.push(this._formatValue(data.child_object_type_id));
        }
        if (data.mirrored_type_id !== undefined) {
          columns.push('mirrored_type_id');
          values.push(this._formatValue(data.mirrored_type_id));
        }
      }

      let translationInsert = '';
      if (data.text && data.language_id) {
        translationInsert = `
  INSERT INTO translations (code, language_id, text)
  VALUES (${this._formatValue(data.code)}, ${data.language_id}, ${this._formatValue(data.text)})
  ON DUPLICATE KEY UPDATE text = ${this._formatValue(data.text)};`;
      }

      return {
        query: `
  INSERT INTO ${this.tableName} (${columns.join(', ')})
  VALUES (${values.join(', ')});
  ${translationInsert}
  SELECT * FROM ${this.tableName} WHERE id = LAST_INSERT_ID()`.trim(),
        params: data,
      };
    }

    buildUpdate(id, data) {
      const setStatements = [];

      if (data.code !== undefined) {
        setStatements.push(`code = ${this._formatValue(data.code)}`);
      }
      if (data.is_active !== undefined) {
        setStatements.push(`is_active = ${data.is_active ? 1 : 0}`);
      }
      if (this.tableName === 'object_statuses' && data.object_type_id !== undefined) {
        setStatements.push(`object_type_id = ${this._formatValue(data.object_type_id)}`);
      }

      let translationUpdate = '';
      if (data.text && data.language_id) {
        translationUpdate = `
  INSERT INTO translations (code, language_id, text)
  SELECT code, ${data.language_id}, ${this._formatValue(data.text)}
  FROM ${this.tableName} WHERE id = ${this._formatValue(id)}
  ON DUPLICATE KEY UPDATE text = ${this._formatValue(data.text)};`;
      }

      return {
        query: `
  UPDATE ${this.tableName}
  SET ${setStatements.length > 0 ? setStatements.join(', ') : 'id = id'}
  WHERE id = ${this._formatValue(id)};
  ${translationUpdate}
  SELECT * FROM ${this.tableName} WHERE id = ${this._formatValue(id)}`.trim(),
        params: { id, ...data },
      };
    }

    buildDelete(id) {
      return {
        query: `
  UPDATE ${this.tableName}
  SET is_active = 0
  WHERE id = ${this._formatValue(id)};

  SELECT 1 as success`.trim(),
        params: { id },
      };
    }

    _formatValue(value) {
      if (value === null || value === undefined) return 'NULL';
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value ? '1' : '0';
      if (typeof value === 'string') {
        const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `'${escaped}'`;
      }
      return 'NULL';
    }
  }

  // ============================================================================
  // TRANSLATION QUERY BUILDER
  // ============================================================================

  class TranslationQueryBuilder {
    buildSelect(params = {}) {
      const conditions = [];
      if (params.code) conditions.push(`code = '${params.code.replace(/'/g, "\\'")}'`);
      if (params.language_id) conditions.push(`language_id = ${params.language_id}`);

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      return {
        query: `
  SELECT code, language_id, text
  FROM translations
  ${whereClause}
  ORDER BY code, language_id`.trim(),
        params,
      };
    }

    buildSelectByKey(code, languageId) {
      return {
        query: `
  SELECT code, language_id, text
  FROM translations
  WHERE code = '${code.replace(/'/g, "\\'")}' AND language_id = ${languageId}`.trim(),
        params: { code, language_id: languageId },
      };
    }

    buildInsert(data) {
      return {
        query: `
  INSERT INTO translations (code, language_id, text)
  VALUES ('${data.code.replace(/'/g, "\\'")}', ${data.language_id}, '${data.text.replace(/'/g, "\\'")}');

  SELECT * FROM translations WHERE code = '${data.code.replace(/'/g, "\\'")}' AND language_id = ${data.language_id}`.trim(),
        params: data,
      };
    }

    buildUpdate(code, languageId, data) {
      return {
        query: `
  UPDATE translations
  SET text = '${data.text.replace(/'/g, "\\'")}'
  WHERE code = '${code.replace(/'/g, "\\'")}' AND language_id = ${languageId};

  SELECT * FROM translations WHERE code = '${code.replace(/'/g, "\\'")}' AND language_id = ${languageId}`.trim(),
        params: { code, language_id: languageId, ...data },
      };
    }

    buildDelete(code, languageId) {
      return {
        query: `
  DELETE FROM translations
  WHERE code = '${code.replace(/'/g, "\\'")}' AND language_id = ${languageId};

  SELECT 1 as success`.trim(),
        params: { code, language_id: languageId },
      };
    }

    buildUpsert(data) {
      return {
        query: `
  INSERT INTO translations (code, language_id, text)
  VALUES ('${data.code.replace(/'/g, "\\'")}', ${data.language_id}, '${data.text.replace(/'/g, "\\'")}')
  ON DUPLICATE KEY UPDATE text = '${data.text.replace(/'/g, "\\'")}';

  SELECT * FROM translations WHERE code = '${data.code.replace(/'/g, "\\'")}' AND language_id = ${data.language_id}`.trim(),
        params: data,
      };
    }
  }

  // ============================================================================
  // FACTORY FUNCTION
  // ============================================================================

  function createQueryBuilder(type) {
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
  // RESPONSE FORMATTERS
  // ============================================================================

  function formatListResponse(data, total, page, perPage) {
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

  function formatItemResponse(data) {
    return { success: true, data };
  }

  function formatErrorResponse(code, message, details) {
    return {
      success: false,
      error: { code, message, details },
    };
  }

  function formatSuccessResponse() {
    return { success: true, data: { success: true } };
  }

  // ============================================================================
  // EXPORTS
  // ============================================================================

  module.exports = {
    QueryBuilder,
    LookupQueryBuilder,
    TranslationQueryBuilder,
    EntityConfigs,
    LOOKUP_TABLE_MAP,
    createQueryBuilder,
    formatListResponse,
    formatItemResponse,
    formatErrorResponse,
    formatSuccessResponse,
  };

  // ============================================================================
  // N8N CODE NODE USAGE EXAMPLE
  // ============================================================================

  const inputData = $input.first().json;
  const { entityType, method, params, query, body } = inputData;

  // Handle different n8n webhook data structures
  // Some webhooks pass query params as params.query, others as query directly
  const queryParams = query || params?.query || {};
  
  // CRITICAL: Verify documents config has translationColumns
  // This is a direct check to ensure the config is correct
  if (entityType === 'documents' && !EntityConfigs.documents.translationColumns) {
    throw new Error('CRITICAL: documents config missing translationColumns!');
  }

  // Debug information (will be included in output)
  const entityConfig = EntityConfigs[entityType];
  
  // Verify documents config has translationColumns
  const documentsConfigCheck = EntityConfigs.documents?.translationColumns;
  
  const debugInfo = {
    entityType: entityType,
    method: method,
    queryParams: queryParams,
    hasEntityConfig: !!entityConfig,
    hasTranslationColumns: !!entityConfig?.translationColumns,
    translationColumns: entityConfig?.translationColumns,
    translationColumnsType: typeof entityConfig?.translationColumns,
    translationColumnsIsArray: Array.isArray(entityConfig?.translationColumns),
    translationColumnsLength: entityConfig?.translationColumns?.length,
    hasLanguageCode: !!queryParams.language_code,
    hasLanguageId: !!queryParams.language_id,
    languageCode: queryParams.language_code,
    languageId: queryParams.language_id,
    documentsConfigHasTranslationColumns: documentsConfigCheck,
    documentsTranslationColumns: EntityConfigs.documents?.translationColumns,
    allEntityTypes: Object.keys(EntityConfigs)
  };

  try {
    const builder = createQueryBuilder(entityType);
    let result;

    switch (method) {
      case 'GET':
        result = params?.id
          ? builder.buildSelectById(params.id, queryParams)
          : builder.buildSelect(queryParams);
        break;
      case 'POST':
        result = builder.buildInsert(body || {});
        break;
      case 'PUT':
        result = builder.buildUpdate(params?.id, body || {});
        break;
      case 'DELETE':
        result = builder.buildDelete(params?.id);
        break;
    }

    // Get translation debug from builder if available
    const builderDebug = builder._lastTranslationDebug || {};
    
    // Check if translation join was actually added
    const queryHasTranslationJoin = result?.query?.includes('LEFT JOIN translations') || false;
    const queryHasTitleColumn = result?.query?.includes('COALESCE(t_title_code.text') || false;
    
    // Merge debug info into result - ensure it's always visible
    const fullDebugInfo = {
      ...debugInfo,
      builderTranslationDebug: builderDebug,
      generatedQueryPreview: result?.query?.substring(0, 200),
      queryIncludesTranslationJoin: queryHasTranslationJoin,
      queryIncludesTitleColumn: queryHasTitleColumn,
      queryLength: result?.query?.length
    };
    
    // Force debug info to be visible - add it multiple ways
    const output = {
      ...result,
      // Add debug as multiple properties to ensure visibility
      debug: fullDebugInfo,
      DEBUG: fullDebugInfo,
      _debug: fullDebugInfo,
      debugInfo: fullDebugInfo,
      // Also add a simple flag that's easy to spot
      HAS_TRANSLATION_SUPPORT: !!entityConfig?.translationColumns,
      TRANSLATION_COLUMNS: entityConfig?.translationColumns
    };

    return [{ json: output }];
  } catch (error) {
    // Include debug info even in error case
    const errorResult = formatErrorResponse('QUERY_ERROR', error.message);
    return [{ 
      json: {
        ...errorResult,
        debug: debugInfo,
        _debug_info: debugInfo
      }
    }];
  }
