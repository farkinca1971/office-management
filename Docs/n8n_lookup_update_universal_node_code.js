/**
 * n8n Code Node - Universal Lookup Table UPDATE Handler (Dynamic SQL)
 * 
 * This node handles UPDATE operations for all lookup/reference data tables
 * using old/new value pairs to determine what fields actually changed.
 * 
 * NOTE: This script only handles the main lookup table update.
 * Translation updates are handled separately.
 * 
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect MySQL node(s) after this code node
 * 5. Execute the queries returned from this node
 * 
 * Input Parameters (from webhook):
 * - lookup_type: Type of lookup (required, from path parameter)
 *   Options: 'languages', 'object-types', 'object-statuses', 'sexes', 
 *            'salutations', 'product-categories', 'countries', 
 *            'address-types', 'address-area-types', 'contact-types', 
 *            'transaction-types', 'currencies', 'object-relation-types'
 * 
 * - id: The ID of the item to update (required, from path parameter)
 * 
 * Request Body Format:
 * {
 *   "old_code": "original_code",
 *   "new_code": "new_code",
 *   "old_is_active": true,
 *   "new_is_active": true,
 *   "old_object_type_id": 0,
 *   "new_object_type_id": 0,
 *   "old_text": "Original translation",
 *   "new_text": "New translation",
 *   "language_id": 1
 * }
 * 
 * Behavior:
 * - Compares old vs new values to determine what actually changed
 * - Updates only fields that have changed (code, is_active, object_type_id)
 * - If code changed, updates all translation references first, then updates lookup table
 * - Handles object_type_id for tables that support it (object_statuses, object_relation_types)
 * 
 * Query Execution Order:
 * 1. Create new translation items with new code but old text values (if code changed)
 *    - Creates translations with new_code to satisfy foreign key constraint
 * 2. Update lookup table (code, is_active, object_type_id)
 * 3. Delete old translation items with old code
 * 
 * Note: The lookup table has a foreign key constraint referencing translations.code.
 * To avoid constraint violations, we first create translations with the new code,
 * then update the lookup table, then delete the old translations.
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract lookup_type from params object
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

// Extract old/new values from request body
const body = inputData.body || {};
const oldCode = body.old_code;
const newCode = body.new_code;
const oldIsActive = body.old_is_active;
const newIsActive = body.new_is_active;
const oldObjectTypeId = body.old_object_type_id;
const newObjectTypeId = body.new_object_type_id;
const oldText = body.old_text;
const newText = body.new_text;
// language_id is now always included in request body from frontend
// If not provided, default to English (1) for backward compatibility
const languageId = body.language_id !== undefined && body.language_id !== null 
  ? body.language_id 
  : 1; // Default to English (1) if not provided

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

// Determine which tables support object_type_id
const tablesWithObjectTypeId = ['object_statuses', 'object_relation_types'];
const supportsObjectTypeId = tablesWithObjectTypeId.includes(lookupType);

// Helper function to escape SQL strings
function escapeSql(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/'/g, "''");
}

// Helper function to convert boolean to int
function boolToInt(val) {
  if (val === true || val === 'true' || val === 1 || val === '1') return 1;
  return 0;
}

// Determine what fields actually changed
const codeChanged = oldCode !== undefined && newCode !== undefined && oldCode !== newCode;
const isActiveChanged = oldIsActive !== undefined && newIsActive !== undefined && 
                        boolToInt(oldIsActive) !== boolToInt(newIsActive);
const objectTypeIdChanged = supportsObjectTypeId && 
                            oldObjectTypeId !== undefined && 
                            newObjectTypeId !== undefined && 
                            oldObjectTypeId !== newObjectTypeId;

// Check if there are any changes
if (!codeChanged && !isActiveChanged && !objectTypeIdChanged) {
  return {
    success: false,
    error: {
      code: 'NO_CHANGES',
      message: 'No changes detected. All old and new values are the same.',
      details: {
        old_code: oldCode,
        new_code: newCode,
        old_is_active: oldIsActive,
        new_is_active: newIsActive,
        old_object_type_id: oldObjectTypeId,
        new_object_type_id: newObjectTypeId
      }
    }
  };
}

// Array to store all queries in execution order
const allQueries = [];

// STEP 1: Create new translation items with new code but old text values (if code changed)
// This must happen FIRST to satisfy foreign key constraint
// The lookup table has a foreign key constraint referencing translations.code
// So the new code must exist in translations before we can update the lookup table
if (codeChanged) {
  const escapedOldCode = escapeSql(oldCode);
  const escapedNewCode = escapeSql(newCode);
  
  // Create new translation items with new code but keep old text values
  // Use ON DUPLICATE KEY UPDATE to handle cases where translations already exist
  const createNewTranslationsQuery = `
    INSERT INTO translations (code, language_id, text)
    SELECT '${escapedNewCode}', language_id, text
    FROM translations
    WHERE code = '${escapedOldCode}'
    ON DUPLICATE KEY UPDATE text = VALUES(text)
  `.trim();
  
  allQueries.push({
    query: createNewTranslationsQuery,
    type: 'translation_code_create',
    description: `Create new translation items with code '${escapedNewCode}' using old text values from '${escapedOldCode}'`
  });
}

// STEP 2: Update lookup table fields
const updateFields = [];

if (codeChanged) {
  const escapedNewCode = escapeSql(newCode);
  updateFields.push(`code = '${escapedNewCode}'`);
}

if (isActiveChanged) {
  const isActiveValue = boolToInt(newIsActive);
  updateFields.push(`is_active = ${isActiveValue}`);
}

if (objectTypeIdChanged) {
  const objectTypeIdValue = newObjectTypeId !== undefined ? parseInt(newObjectTypeId) : 0;
  if (isNaN(objectTypeIdValue)) {
    return {
      success: false,
      error: {
        code: 'INVALID_OBJECT_TYPE_ID',
        message: 'new_object_type_id must be a valid integer',
        details: {
          provided: newObjectTypeId
        }
      }
    };
  }
  updateFields.push(`object_type_id = ${objectTypeIdValue}`);
}

if (updateFields.length > 0) {
  const lookupUpdateQuery = `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE id = ${parsedId}`;
  allQueries.push({
    query: lookupUpdateQuery.trim(),
    type: 'lookup_update',
    description: `Update ${tableName} record with id ${parsedId}`
  });
}

// STEP 3: Delete old translation items with old code (if code changed)
// This happens AFTER updating the lookup table
// Now we can safely delete all translations with the old code
if (codeChanged) {
  const escapedOldCode = escapeSql(oldCode);
  
  const deleteOldTranslationsQuery = `
    DELETE FROM translations
    WHERE code = '${escapedOldCode}'
  `.trim();
  
  allQueries.push({
    query: deleteOldTranslationsQuery,
    type: 'translation_code_delete',
    description: `Delete all translation items with old code '${escapedOldCode}'`
  });
}

// Return queries and metadata
return {
  json: {
    queries: allQueries,
    lookup_type: lookupType,
    table_name: tableName,
    item_id: parsedId,
    changes: {
      code_changed: codeChanged,
      is_active_changed: isActiveChanged,
      object_type_id_changed: objectTypeIdChanged
    },
    // Always include all old and new values, even if they didn't change
    old_values: {
      code: oldCode !== undefined ? oldCode : '',
      is_active: oldIsActive !== undefined ? oldIsActive : true,
      object_type_id: oldObjectTypeId !== undefined ? oldObjectTypeId : 0,
      text: oldText !== undefined ? oldText : ''
    },
    new_values: {
      code: newCode !== undefined ? newCode : '',
      is_active: newIsActive !== undefined ? newIsActive : true,
      object_type_id: newObjectTypeId !== undefined ? newObjectTypeId : 0,
      text: newText !== undefined ? newText : ''
    },
    // Always include current language_id (now always provided from frontend)
    language_id: typeof languageId === 'number' ? languageId : (parseInt(languageId) || 1),
    // For single query execution (if only one query)
    query: allQueries.length === 1 ? allQueries[0].query : null,
    // For multiple query execution (semicolon-separated)
    execute_all: allQueries.map(q => q.query).join(';\n'),
    // Individual queries for step-by-step execution
    query_list: allQueries.map((q, index) => ({
      step: index + 1,
      query: q.query,
      type: q.type,
      description: q.description
    })),
    metadata: {
      total_queries: allQueries.length,
      translation_code_create_queries: allQueries.filter(q => q.type === 'translation_code_create').length,
      translation_code_delete_queries: allQueries.filter(q => q.type === 'translation_code_delete').length,
      lookup_queries: allQueries.filter(q => q.type === 'lookup_update').length,
      supports_object_type_id: supportsObjectTypeId
    }
  }
};

