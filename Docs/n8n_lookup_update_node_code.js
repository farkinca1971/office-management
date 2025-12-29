/**
 * n8n Code Node - Universal Lookup Table UPDATE Handler
 * 
 * This node handles UPDATE operations for all lookup/reference data tables
 * Supports updating lookup items and their translations in a single operation
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
 * - id: The ID of the item to update (required, from path parameter)
 * 
 * Request Body (optional fields):
 * - code: Updated code for the lookup item
 * - is_active: Updated active status (true/false)
 * - text: Translation text for the current language
 * - language_id: Language ID for the translation
 * 
 * Behavior:
 * - If text and language_id are provided, updates/creates translation
 * - If only text is provided, uses current request language context
 * - Updates are performed in transaction-safe order (lookup table first, then translation)
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract lookup_type from params object (n8n webhook provides path params in params object)
// The webhook path /api/v1/lookups/:lookup_type/:id extracts lookup_type and id into params
let lookupType = inputData.params?.lookup_type || 
                 inputData.lookup_type || 
                 inputData.query?.lookup_type || 
                 inputData.body?.lookup_type;

// Extract id from path parameter
let itemId = inputData.params?.id || 
             inputData.id || 
             inputData.query?.id || 
             inputData.body?.id;

// Normalize lookup_type: convert hyphens to underscores
if (lookupType && typeof lookupType === 'string') {
  lookupType = lookupType.replace(/-/g, '_');
}

// Extract update fields from request body
const updateCode = inputData.body?.code;
const updateIsActive = inputData.body?.is_active;
const updateText = inputData.body?.text;
// language_id is now always included in request body from frontend
// If not provided, default to English (1) for backward compatibility
const updateLanguageId = inputData.body?.language_id !== undefined && inputData.body?.language_id !== null 
  ? inputData.body.language_id 
  : 1; // Default to English (1) if not provided

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

// Validate id
if (!itemId) {
  return {
    success: false,
    error: {
      code: 'MISSING_ID',
      message: 'Item ID is required for update operation',
      details: {
        provided: itemId
      }
    }
  };
}

// Parse id to integer
const parsedId = parseInt(itemId);
if (isNaN(parsedId)) {
  return {
    success: false,
    error: {
      code: 'INVALID_ID',
      message: 'Item ID must be a valid integer',
      details: {
        provided: itemId
      }
    }
  };
}

// Check if there are any fields to update
const hasLookupUpdate = updateCode !== undefined || updateIsActive !== undefined;
const hasTranslationUpdate = updateText !== undefined;

if (!hasLookupUpdate && !hasTranslationUpdate) {
  return {
    success: false,
    error: {
      code: 'NO_UPDATE_FIELDS',
      message: 'No fields provided for update. At least one of: code, is_active, text must be provided.',
      details: {
        received_fields: {
          code: updateCode,
          is_active: updateIsActive,
          text: updateText,
          language_id: updateLanguageId
        }
      }
    }
  };
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

// Build UPDATE query for lookup table
let lookupUpdateQuery = null;
let lookupUpdateParams = [];

if (hasLookupUpdate) {
  const updateFields = [];
  
  if (updateCode !== undefined) {
    // Escape single quotes in code
    const escapedCode = updateCode.replace(/'/g, "''");
    updateFields.push(`code = '${escapedCode}'`);
  }
  
  if (updateIsActive !== undefined) {
    const isActiveValue = updateIsActive === true || updateIsActive === 'true' || updateIsActive === 1 ? 1 : 0;
    updateFields.push(`is_active = ${isActiveValue}`);
  }
  
  if (updateFields.length > 0) {
    lookupUpdateQuery = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ${parsedId}`;
  }
}

// Build translation update/insert queries
let translationQueries = [];
let translationParams = [];

if (hasTranslationUpdate) {
  // Determine language_id for translation
  let translationLangId = null;
  
  if (updateLanguageId !== undefined) {
    translationLangId = parseInt(updateLanguageId);
    if (isNaN(translationLangId)) {
      return {
        success: false,
        error: {
          code: 'INVALID_LANGUAGE_ID',
          message: 'language_id must be a valid integer',
          details: {
            provided: updateLanguageId
          }
        }
      };
    }
  } else {
    // Use language_code to get language_id
    // This will be resolved in the SQL query
    translationLangId = `(SELECT id FROM languages WHERE code = '${languageCode.replace(/'/g, "''")}')`;
  }
  
  // Escape single quotes in text
  const escapedText = updateText.replace(/'/g, "''");
  
  // Get the code to use for translation
  // If code is being updated, we need to handle it carefully:
  // 1. First, update all existing translations to use the new code
  // 2. Then use the new code for the new/updated translation
  let translationCode = null;
  
  if (updateCode !== undefined) {
    // Code is being updated - use the new code
    const escapedNewCode = updateCode.replace(/'/g, "''");
    translationCode = escapedNewCode;
    
    // Add query to update all existing translations to use the new code
    // This must happen BEFORE the lookup table update, so translations reference the new code
    translationQueries.push({
      query: `
        UPDATE translations t
        INNER JOIN ${tableName} lt ON t.code = lt.code
        SET t.code = '${escapedNewCode}'
        WHERE lt.id = ${parsedId} AND t.code != '${escapedNewCode}'
      `.trim(),
      type: 'translation_code_update',
      description: `Update all translations to use new code for ${lookupType}`,
      execute_before_lookup: true
    });
  } else {
    // Code is not being updated - get existing code from database
    // We'll use a subquery in the INSERT statement
    translationCode = `(SELECT code FROM ${tableName} WHERE id = ${parsedId})`;
  }
  
  // Build INSERT ... ON DUPLICATE KEY UPDATE query for translation
  // This will insert if translation doesn't exist, or update if it does
  let translationInsertQuery = null;
  
  if (typeof translationLangId === 'number') {
    // Direct language_id value
    if (typeof translationCode === 'string' && translationCode.startsWith('(SELECT')) {
      // Code is a subquery - use SELECT form
      translationInsertQuery = `
        INSERT INTO translations (code, language_id, text)
        SELECT ${translationCode}, ${translationLangId}, '${escapedText}'
        FROM ${tableName}
        WHERE id = ${parsedId}
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `;
    } else {
      // Code is a direct value
      translationInsertQuery = `
        INSERT INTO translations (code, language_id, text)
        VALUES ('${translationCode}', ${translationLangId}, '${escapedText}')
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `;
    }
  } else {
    // Language_id is a subquery
    if (typeof translationCode === 'string' && translationCode.startsWith('(SELECT')) {
      // Both code and language_id are subqueries
      translationInsertQuery = `
        INSERT INTO translations (code, language_id, text)
        SELECT ${translationCode}, ${translationLangId}, '${escapedText}'
        FROM ${tableName} lt
        CROSS JOIN languages l
        WHERE lt.id = ${parsedId} AND l.code = '${languageCode.replace(/'/g, "''")}'
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `;
    } else {
      // Code is direct value, language_id is subquery
      translationInsertQuery = `
        INSERT INTO translations (code, language_id, text)
        SELECT '${translationCode}', ${translationLangId}, '${escapedText}'
        FROM languages
        WHERE code = '${languageCode.replace(/'/g, "''")}'
        ON DUPLICATE KEY UPDATE text = '${escapedText}'
      `;
    }
  }
  
  translationQueries.push({
    query: translationInsertQuery.trim(),
    type: 'translation_update',
    description: `Update/create translation for ${lookupType}`
  });
}

// Combine all queries in the correct order
// Order: translation code updates (if code changed) -> lookup update -> translation insert/update
const allQueries = [];

// First: Update translation codes if code is being changed
const codeUpdateQueries = translationQueries.filter(q => q.execute_before_lookup);
codeUpdateQueries.forEach(q => {
  allQueries.push({
    query: q.query,
    type: q.type,
    description: q.description
  });
});

// Second: Update lookup table
if (lookupUpdateQuery) {
  allQueries.push({
    query: lookupUpdateQuery.trim(),
    type: 'lookup_update',
    description: `Update ${tableName} record with id ${parsedId}`
  });
}

// Third: Insert/update specific translation
const translationInsertQueries = translationQueries.filter(q => !q.execute_before_lookup);
translationInsertQueries.forEach(q => {
  allQueries.push({
    query: q.query,
    type: q.type,
    description: q.description
  });
});

// Return queries and metadata
return {
  json: {
    queries: allQueries,
    lookup_type: lookupType,
    table_name: tableName,
    item_id: parsedId,
    update_fields: {
      code: updateCode,
      is_active: updateIsActive,
      text: updateText,
      language_id: updateLanguageId
    },
    has_lookup_update: hasLookupUpdate,
    has_translation_update: hasTranslationUpdate,
    language_code: languageCode,
    // For single query execution (if only one query)
    query: allQueries.length === 1 ? allQueries[0].query : null,
    // For multiple query execution
    execute_all: allQueries.map(q => q.query).join(';\n'),
    metadata: {
      total_queries: allQueries.length,
      lookup_queries: allQueries.filter(q => q.type === 'lookup_update').length,
      translation_queries: allQueries.filter(q => q.type === 'translation_update').length
    }
  }
};

