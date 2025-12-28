/**
 * n8n Code Node - Universal Lookup Table CREATE Handler
 * 
 * This node handles CREATE operations for all lookup/reference data tables
 * Supports creating lookup items and their translations in a single operation
 * 
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect MySQL node(s) after this code node
 * 5. Execute the queries returned from this node
 * 
 * Input Parameters (from webhook or previous node):
 * - lookup_type: Type of lookup (required)
 *   Options: 'languages', 'object-types', 'object-statuses', 'sexes', 
 *            'salutations', 'product-categories', 'countries', 
 *            'address-types', 'address-area-types', 'contact-types', 
 *            'transaction-types', 'currencies', 'object-relation-types'
 *   Note: Hyphens are automatically converted to underscores
 * 
 * Request Body (required fields):
 * - code: Unique code for the lookup item (required, automatically trimmed)
 * 
 * Request Body (optional fields):
 * - is_active: Active status (default: true)
 * - text: Translation text for the current language (automatically trimmed)
 * - language_id: Language ID for the translation
 * - object_type_id: For object-statuses only - the object type this status belongs to
 * 
 * Behavior:
 * - Automatically trims leading/trailing whitespace from code and text fields
 * - Validates that code does not already exist in lookup table or translations table
 * - If text and language_id are provided, creates translation
 * - If only text is provided, uses current request language context
 * - IMPORTANT: Creates translation FIRST, then lookup item (due to foreign key constraints)
 * - For object-statuses, object_type_id is required
 * 
 * Query Execution Order:
 * 1. Validation queries (check for duplicates)
 * 2. Translation insert (if provided) - MUST be before lookup insert
 * 3. Lookup table insert - AFTER translation (foreign key: lookup.code -> translations.code)
 * 
 * Validation:
 * - Checks if code exists in the lookup table before inserting
 * - Checks if code exists in the translations table before inserting
 * - Returns validation queries that must be executed first
 * - Use n8n_lookup_create_validation_node_code.js to check validation results
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract lookup_type from params object (n8n webhook provides path params in params object)
// The webhook path /api/v1/lookups/:lookup_type extracts lookup_type into params
let lookupType = inputData.params?.lookup_type || 
                 inputData.lookup_type || 
                 inputData.query?.lookup_type || 
                 inputData.body?.lookup_type;

// Normalize lookup_type: convert hyphens to underscores
if (lookupType && typeof lookupType === 'string') {
  lookupType = lookupType.replace(/-/g, '_');
}

// Extract create fields from request body
const createCode = inputData.body?.code;
const createIsActive = inputData.body?.is_active !== undefined ? inputData.body.is_active : true;
const createText = inputData.body?.text;
const createLanguageId = inputData.body?.language_id;
const objectTypeId = inputData.body?.object_type_id || inputData.query?.object_type_id;

// Extract language_code from query parameters or headers (for translation context)
const languageCode = inputData.query?.language_code || 
                    inputData.language_code || 
                    inputData.body?.language_code || 
                    inputData.headers?.['accept-language'] || 
                    'en';

// Validate lookup type
const validLookupTypes = [
  'languages',
  'object_types',
  'object_statuses',
  'sexes',
  'salutations',
  'product_categories',
  'countries',
  'address_types',
  'address_area_types',
  'contact_types',
  'transaction_types',
  'currencies',
  'object_relation_types'
];

if (!lookupType || !validLookupTypes.includes(lookupType)) {
  return {
    success: false,
    error: {
      code: 'INVALID_LOOKUP_TYPE',
      message: `Invalid lookup_type. Must be one of: ${validLookupTypes.join(', ')}`,
      details: {
        provided: lookupType,
        valid_types: validLookupTypes
      }
    }
  };
}

// Validate required fields
if (!createCode || typeof createCode !== 'string' || createCode.trim() === '') {
  return {
    success: false,
    error: {
      code: 'MISSING_CODE',
      message: 'Code is required and must be a non-empty string',
      details: {
        provided: createCode
      }
    }
  };
}

// Trim the code to remove leading/trailing whitespace
const trimmedCode = createCode.trim();

// Special validation for object_statuses
if (lookupType === 'object_statuses' && !objectTypeId) {
  return {
    success: false,
    error: {
      code: 'MISSING_OBJECT_TYPE_ID',
      message: 'object_type_id is required for object_statuses',
      details: {
        provided: objectTypeId
      }
    }
  };
}

// Validate object_type_id if provided
if (objectTypeId !== undefined) {
  const parsedObjectTypeId = parseInt(objectTypeId);
  if (isNaN(parsedObjectTypeId)) {
    return {
      success: false,
      error: {
        code: 'INVALID_OBJECT_TYPE_ID',
        message: 'object_type_id must be a valid integer',
        details: {
          provided: objectTypeId
        }
      }
    };
  }
}

// Map lookup types to table names
const tableMap = {
  'languages': 'languages',
  'object_types': 'object_types',
  'object_statuses': 'object_statuses',
  'sexes': 'sexes',
  'salutations': 'salutations',
  'product_categories': 'product_categories',
  'countries': 'countries',
  'address_types': 'address_types',
  'address_area_types': 'address_area_types',
  'contact_types': 'contact_types',
  'transaction_types': 'transaction_types',
  'currencies': 'currencies',
  'object_relation_types': 'object_relation_types'
};

const tableName = tableMap[lookupType];

// Escape single quotes in code (using trimmed code)
const escapedCode = trimmedCode.replace(/'/g, "''");

// Check if code already exists in lookup table
const checkLookupTableQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE code = '${escapedCode}'`;

// Check if code already exists in translations table
const checkTranslationsTableQuery = `SELECT COUNT(*) as count FROM translations WHERE code = '${escapedCode}'`;

// Add validation queries to check for duplicates
// These queries should be executed first to validate uniqueness
const validationQueries = [
  {
    query: checkLookupTableQuery.trim(),
    type: 'validation_lookup_check',
    description: `Check if code '${trimmedCode}' already exists in ${tableName} table`
  },
  {
    query: checkTranslationsTableQuery.trim(),
    type: 'validation_translation_check',
    description: `Check if code '${trimmedCode}' already exists in translations table`
  }
];

// Normalize is_active to 0 or 1
const isActiveValue = createIsActive === true || createIsActive === 'true' || createIsActive === 1 ? 1 : 0;

// Build INSERT query for lookup table
let lookupInsertQuery = null;

if (lookupType === 'object_statuses') {
  // object_statuses requires object_type_id
  const parsedObjectTypeId = parseInt(objectTypeId);
  lookupInsertQuery = `INSERT INTO ${tableName} (code, is_active, object_type_id) VALUES ('${escapedCode}', ${isActiveValue}, ${parsedObjectTypeId})`;
} else {
  // All other lookup tables
  lookupInsertQuery = `INSERT INTO ${tableName} (code, is_active) VALUES ('${escapedCode}', ${isActiveValue})`;
}

// Build translation insert queries
let translationQueries = [];
const hasTranslation = createText !== undefined && createText !== null && createText.trim() !== '';

if (hasTranslation) {
  // Determine language_id for translation
  let translationLangId = null;
  
  if (createLanguageId !== undefined && createLanguageId !== null) {
    translationLangId = parseInt(createLanguageId);
    if (isNaN(translationLangId)) {
      return {
        success: false,
        error: {
          code: 'INVALID_LANGUAGE_ID',
          message: 'language_id must be a valid integer',
          details: {
            provided: createLanguageId
          }
        }
      };
    }
  }
  
  // Trim and escape single quotes in text
  const trimmedText = typeof createText === 'string' ? createText.trim() : createText;
  const escapedText = trimmedText.replace(/'/g, "''");
  
  // Build INSERT ... ON DUPLICATE KEY UPDATE query for translation
  // This will insert if translation doesn't exist, or update if it does
  if (translationLangId !== null) {
    // Direct language_id value
    translationQueries.push({
      query: `
        INSERT INTO translations (code, language_id, text)
        VALUES ('${escapedCode}', ${translationLangId}, '${escapedText}')
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `.trim(),
      type: 'translation_insert',
      description: `Create/update translation for ${lookupType} with language_id ${translationLangId}`
    });
  } else {
    // Use language_code to get language_id
    const escapedLanguageCode = languageCode.replace(/'/g, "''");
    translationQueries.push({
      query: `
        INSERT INTO translations (code, language_id, text)
        SELECT '${escapedCode}', l.id, '${escapedText}'
        FROM languages l
        WHERE l.code = '${escapedLanguageCode}'
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `.trim(),
      type: 'translation_insert',
      description: `Create/update translation for ${lookupType} with language_code '${languageCode}'`
    });
  }
  
  // If we want to create translations for ALL languages (using the provided text as default)
  // This is optional - uncomment if you want this behavior
  /*
  translationQueries.push({
    query: `
      INSERT INTO translations (code, language_id, text)
      SELECT '${escapedCode}', l.id, '${escapedText}'
      FROM languages l
      WHERE NOT EXISTS (
        SELECT 1 FROM translations t 
        WHERE t.code = '${escapedCode}' AND t.language_id = l.id
      )
    `.trim(),
    type: 'translation_insert_all',
    description: `Create translations for all languages for ${lookupType}`
  });
  */
}

// Combine all queries in the correct order
// IMPORTANT: Due to foreign key constraints (lookup tables reference translations.code),
// we must insert translations FIRST, then the lookup table record
// Order: validation checks -> translation insert(s) -> lookup insert
const allQueries = [];

// First: Add validation queries (these should be executed first in n8n workflow)
// Note: In n8n, you'll need to execute these validation queries first and check results
// before proceeding with inserts. The validation results will be in the previous node's output.
allQueries.push(...validationQueries);

// Second: Insert/update translation(s) FIRST (before lookup table)
// This is required because lookup tables have foreign key constraints referencing translations.code
translationQueries.forEach((tq) => {
  allQueries.push({
    query: tq.query,
    type: tq.type,
    description: tq.description
  });
});

// Third: Insert lookup table record AFTER translation
// The translation must exist first due to foreign key constraint: lookup.code -> translations.code
allQueries.push({
  query: lookupInsertQuery.trim(),
  type: 'lookup_insert',
  description: `Insert ${tableName} record with code '${trimmedCode}'`
});

// Return queries and metadata
// Note: The validation queries should be executed first in a separate MySQL node
// Check the results before executing the insert queries
return {
  json: {
    queries: allQueries,
    validation_queries: validationQueries,
    insert_queries: allQueries.filter(q => q.type !== 'validation_lookup_check' && q.type !== 'validation_translation_check'),
    lookup_type: lookupType,
    table_name: tableName,
    code: trimmedCode,
    create_fields: {
      code: trimmedCode,
      is_active: createIsActive,
      text: hasTranslation ? (typeof createText === 'string' ? createText.trim() : createText) : createText,
      language_id: createLanguageId,
      object_type_id: objectTypeId
    },
    has_translation: hasTranslation,
    language_code: languageCode,
    // For single query execution (if only one query - not recommended with validation)
    query: allQueries.length === 1 ? allQueries[0].query : null,
    // For multiple query execution (includes validation - execute in order)
    execute_all: allQueries.map(q => q.query).join(';\n'),
    // Validation queries only (execute these first)
    execute_validation: validationQueries.map(q => q.query).join(';\n'),
    // Insert queries only (execute after validation passes)
    execute_inserts: allQueries
      .filter(q => q.type !== 'validation_lookup_check' && q.type !== 'validation_translation_check')
      .map(q => q.query)
      .join(';\n'),
    metadata: {
      total_queries: allQueries.length,
      validation_queries: validationQueries.length,
      lookup_queries: allQueries.filter(q => q.type === 'lookup_insert').length,
      translation_queries: allQueries.filter(q => q.type === 'translation_insert' || q.type === 'translation_insert_all').length,
      validation_note: 'Execute validation queries first and check results before executing insert queries'
    }
  }
};

