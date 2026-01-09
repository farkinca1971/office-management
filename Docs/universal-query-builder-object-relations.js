/**
 * Universal Query Builder for Object Relations
 * 
 * This script builds SQL queries for the object_relations table, dynamically joining
 * to the appropriate entity table (persons, companies, documents, etc.) based on
 * the object_to_id's object_type_id.
 * 
 * Parameters:
 * - object_from_id: The source object ID (required, from URL params or query)
 * - object_relation_type_id: Filter by relation type ID (optional, from query params)
 * - language_id: Language ID for translations (REQUIRED, MUST be sent in X-Language-ID header)
 * 
 * Usage in n8n:
 * 1. Add a Code node
 * 2. Paste this entire script
 * 3. Uncomment the last line: return main();
 * 4. Connect to a MySQL node
 * 5. In the MySQL node, use: {{ $json.query }} as the query
 * 
 * IMPORTANT: The API endpoint MUST receive language_id in the X-Language-ID header.
 * The query builder will throw an error if the header is missing.
 * 
 * The query will:
 * - Join to the appropriate entity table based on object_type_id
 * - Include all entity-specific columns with entity prefix (e.g., p_first_name, c_company_name)
 * - Join translation tables for code columns using the language_id from header
 * - Provide a unified related_object_display_name field
 * - Filter by object_from_id and optionally object_relation_type_id
 * 
 * IMPORTANT: Update the objectTypeId values in EntityConfigs to match your database!
 * You can find the correct IDs by querying: SELECT id, code FROM object_types;
 * 
 * @author Claude Code
 * @version 1.0.0
 */

// ============================================================================
// ENTITY CONFIGURATIONS
// ============================================================================

const EntityConfigs = {
  person: {
    tableName: 'persons',
    alias: 'p',
    objectTypeId: 1, // Assuming person has object_type_id = 1
    selectColumns: [
      'p.id',
      'p.first_name',
      'p.middle_name',
      'p.last_name',
      'p.mother_name',
      'p.sex_id',
      'p.salutation_id',
      'p.birth_date'
    ],
    translationColumns: [
      { codeColumn: 'sex_id', table: 'sexes', alias: 's', codeField: 'code', nameField: 'sex_name' },
      { codeColumn: 'salutation_id', table: 'salutations', alias: 'sal', codeField: 'code', nameField: 'salutation_name' }
    ],
    displayName: "CONCAT(COALESCE(p.first_name, ''), ' ', COALESCE(p.last_name, ''))"
  },
  
  company: {
    tableName: 'companies',
    alias: 'c',
    objectTypeId: 2, // Assuming company has object_type_id = 2
    selectColumns: [
      'c.id',
      'c.company_id',
      'c.company_name'
    ],
    translationColumns: [],
    displayName: 'c.company_name'
  },
  
  user: {
    tableName: 'users',
    alias: 'u',
    objectTypeId: 3, // Assuming user has object_type_id = 3
    selectColumns: [
      'u.id',
      'u.username'
    ],
    translationColumns: [],
    displayName: 'u.username'
  },
  
  document: {
    tableName: 'documents',
    alias: 'd',
    objectTypeId: 4, // Assuming document has object_type_id = 4
    selectColumns: [
      'd.id',
      'd.title_code',
      'd.document_type_id',
      'd.document_date',
      'd.document_number',
      'd.expiry_date',
      'd.is_active'
    ],
    translationColumns: [
      { codeColumn: 'title_code', table: 'translations', alias: 'dt', codeField: 'code', nameField: 'title', directCode: true },
      { codeColumn: 'document_type_id', table: 'document_types', alias: 'dtype', codeField: 'code', nameField: 'document_type_name' }
    ],
    displayName: 'dt.text'
  },
  
  invoice: {
    tableName: 'invoices',
    alias: 'i',
    objectTypeId: 5, // Assuming invoice has object_type_id = 5
    selectColumns: [
      'i.id',
      'i.invoice_number',
      'i.issue_date',
      'i.due_date',
      'i.final_amount',
      'i.currency_id',
      'i.is_paid',
      'i.is_void'
    ],
    translationColumns: [],
    displayName: 'i.invoice_number'
  },
  
  transaction: {
    tableName: 'transactions',
    alias: 't',
    objectTypeId: 6, // Assuming transaction has object_type_id = 6
    selectColumns: [
      't.id',
      't.transaction_type_id',
      't.transaction_date_start',
      't.transaction_date_end',
      't.is_active'
    ],
    translationColumns: [],
    displayName: "CONCAT('Transaction #', t.id)"
  },
  
  file: {
    tableName: 'files',
    alias: 'f',
    objectTypeId: 7, // Assuming file has object_type_id = 7
    selectColumns: [
      'f.id',
      'f.filename',
      'f.original_filename',
      'f.file_path',
      'f.mime_type',
      'f.file_size',
      'f.upload_date'
    ],
    translationColumns: [],
    displayName: 'f.filename'
  }
};

// ============================================================================
// QUERY BUILDER FUNCTION
// ============================================================================

/**
 * Builds a SQL query for object_relations with dynamic entity joins
 * Uses UNION ALL to create separate queries for each entity type
 * Each query only joins its specific entity table using INNER JOIN
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.object_from_id - Source object ID (required)
 * @param {number} [params.object_relation_type_id] - Filter by relation type ID (optional)
 * @param {number} params.language_id - Language ID for translations (required)
 * @returns {string} SQL query string
 */
function buildObjectRelationsQuery(params) {
  const { object_from_id, object_relation_type_id, language_id } = params;
  
  if (!object_from_id) {
    throw new Error('object_from_id is required');
  }
  
  if (!language_id) {
    throw new Error('language_id is required');
  }
  
  // Build base WHERE clause for relations
  let baseWhereClause = `
    or_rel.object_from_id = ${object_from_id}
    AND or_rel.is_active = 1`;
  
  if (object_relation_type_id !== undefined && object_relation_type_id !== null) {
    baseWhereClause += `
    AND or_rel.object_relation_type_id = ${object_relation_type_id}`;
  }
  
  // Build common columns that appear in all UNION branches
  const commonColumns = `
    -- Relation fields
    or_rel.id AS relation_id,
    or_rel.object_from_id,
    or_rel.object_to_id,
    or_rel.object_relation_type_id,
    or_rel.note AS relation_note,
    or_rel.is_active AS relation_is_active,
    or_rel.created_at AS relation_created_at,
    or_rel.updated_at AS relation_updated_at,
    or_rel.created_by AS relation_created_by,
    
    -- Object type information
    o_to.id AS related_object_id,
    o_to.object_type_id,
    ot.code AS object_type_code,
    ot_name.text AS object_type_name,
    
    -- Object status
    o_to.object_status_id,
    os.code AS object_status_code,
    os_name.text AS object_status_name,
    
    -- Relation type information
    ort.code AS relation_type_code,
    ort_name.text AS relation_type_name`;
  
  // Collect all possible entity columns to ensure UNION branches have same structure
  const allEntityColumns = new Map(); // Map<alias_columnName, {entity, column, colName}>
  
  Object.values(EntityConfigs).forEach((entity) => {
    entity.selectColumns.forEach(col => {
      const colName = col.split('.')[1];
      const aliasColName = `${entity.alias}_${colName}`;
      if (!allEntityColumns.has(aliasColName)) {
        allEntityColumns.set(aliasColName, { entity, column: col, colName });
      }
    });
  });
  
  // Build UNION ALL queries for each entity type
  const unionQueries = [];
  
  Object.values(EntityConfigs).forEach((entity) => {
    // Build entity-specific columns - include all possible columns, use NULL for non-applicable ones
    const entityColumns = Array.from(allEntityColumns.entries()).map(([aliasColName, colInfo]) => {
      if (colInfo.entity === entity) {
        // This column belongs to this entity
        return `${colInfo.column} AS ${aliasColName}`;
      } else {
        // This column doesn't belong to this entity, use NULL
        return `NULL AS ${aliasColName}`;
      }
    });
    
    // Build translation joins for this entity
    const translationJoins = [];
    entity.translationColumns.forEach((transCol) => {
      if (transCol.directCode) {
        // Direct translation code (like title_code in documents)
        translationJoins.push(`
    LEFT JOIN translations ${transCol.alias} ON ${transCol.alias}.code = ${entity.alias}.${transCol.codeColumn} AND ${transCol.alias}.language_id = ${language_id}`);
      } else {
        // Translation via lookup table (like sex_id -> sexes -> code -> translations)
        const lookupTable = transCol.table;
        const lookupAlias = transCol.alias;
        const codeField = transCol.codeField;
        
        // First join to lookup table
        translationJoins.push(`
    LEFT JOIN ${lookupTable} ${lookupAlias} ON ${lookupAlias}.id = ${entity.alias}.${transCol.codeColumn}`);
        
        // Then join to translations
        translationJoins.push(`
    LEFT JOIN translations ${lookupAlias}_t ON ${lookupAlias}_t.code = ${lookupAlias}.${codeField} AND ${lookupAlias}_t.language_id = ${language_id}`);
      }
    });
    
    // Build the SELECT for this entity type
    // Use INNER JOIN for the entity table so we only get rows where this entity type matches
    const entitySelect = `
SELECT 
    ${commonColumns},
    ${entityColumns.join(',\n    ')},
    ${entity.displayName} AS related_object_display_name
FROM object_relations or_rel
    
    -- Join to objects table for object_to_id (filter by this entity's object_type_id)
    INNER JOIN objects o_to ON o_to.id = or_rel.object_to_id AND o_to.object_type_id = ${entity.objectTypeId}
    
    -- Join to object_types for object type information
    INNER JOIN object_types ot ON ot.id = o_to.object_type_id
    LEFT JOIN translations ot_name ON ot_name.code = ot.code AND ot_name.language_id = ${language_id}
    
    -- Join to object_statuses for status information
    LEFT JOIN object_statuses os ON os.id = o_to.object_status_id
    LEFT JOIN translations os_name ON os_name.code = os.code AND os_name.language_id = ${language_id}
    
    -- Join to object_relation_types for relation type information
    INNER JOIN object_relation_types ort ON ort.id = or_rel.object_relation_type_id
    LEFT JOIN translations ort_name ON ort_name.code = ort.code AND ort_name.language_id = ${language_id}
    
    -- INNER JOIN to the specific entity table - only returns rows where this entity exists
    INNER JOIN ${entity.tableName} ${entity.alias} ON ${entity.alias}.id = o_to.id${translationJoins.join('')}
    
WHERE ${baseWhereClause}`;
    
    unionQueries.push(entitySelect);
  });
  
  // Combine all UNION ALL queries
  const query = unionQueries.join('\n\nUNION ALL\n\n') + `
ORDER BY relation_created_at DESC;`;
  
  return query;
}

// ============================================================================
// N8N INTEGRATION
// ============================================================================

/**
 * Main function for n8n Code node
 * Extracts parameters from n8n context and builds the query
 * 
 * IMPORTANT: language_id can be sent in query params or X-Language-ID header
 */
function main() {
  // Get parameters from n8n context
  const object_from_id = $input.first().json.query?.object_from_id || 
                         $input.first().json.params?.object_from_id || 
                         $input.first().json.body?.object_from_id;
  const object_relation_type_id = $input.first().json.query?.object_relation_type_id || 
                                  $input.first().json.params?.object_relation_type_id || 
                                  $input.first().json.body?.object_relation_type_id;
  
  // Get language_id from query params or X-Language-ID header (REQUIRED)
  const language_id = $input.first().json.query?.language_id ||
                      $input.first().json.headers?.['x-language-id'] || 
                      $input.first().json.headers?.['X-Language-ID'] ||
                      $input.first().json.headers?.['X-LANGUAGE-ID'] ||
                      null;
  
  if (!language_id) {
    throw new Error('language_id is required and must be sent in query params or X-Language-ID header');
  }
  
  if (!object_from_id) {
    throw new Error('object_from_id is required');
  }
  
  // Build the query
  const query = buildObjectRelationsQuery({
    object_from_id,
    object_relation_type_id,
    language_id: parseInt(language_id)
  });
  
  // Return the query for use in MySQL node
  return {
    query: query,
    params: {
      object_from_id,
      object_relation_type_id,
      language_id: parseInt(language_id)
    }
  };
}

// Export for use in n8n
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildObjectRelationsQuery, main };
}

// For direct execution in n8n Code node
// Uncomment the line below if running directly in n8n:
// return main();

