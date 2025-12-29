/**
 * n8n Code Node - Universal Lookup Table DELETE Handler
 * 
 * This node handles DELETE operations for all lookup/reference data tables
 * Performs soft delete by setting is_active = false
 * 
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect a MySQL node after this code node
 * 5. Execute the query returned from this node
 * 
 * Input Parameters (from webhook or previous node):
 * - lookup_type: Type of lookup (required)
 *   Options: 'languages', 'object-types', 'object-statuses', 'sexes', 
 *            'salutations', 'product-categories', 'countries', 
 *            'address-types', 'address-area-types', 'contact-types', 
 *            'transaction-types', 'currencies', 'object-relation-types'
 *   Note: Hyphens are automatically converted to underscores
 * 
 * - id: The ID of the item to delete (required, from path parameter)
 * 
 * Behavior:
 * - Performs soft delete by setting is_active = false
 * - Does not physically remove the record from the database
 * - Does not delete related translations (they remain in the database)
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

// Extract language_id from request body (for consistency and audit purposes)
// language_id is now always included in request body from frontend
// If not provided, default to English (1) for backward compatibility
const languageId = inputData.body?.language_id !== undefined && inputData.body?.language_id !== null 
  ? inputData.body.language_id 
  : 1; // Default to English (1) if not provided

// Normalize lookup_type: convert hyphens to underscores
if (lookupType && typeof lookupType === 'string') {
  lookupType = lookupType.replace(/-/g, '_');
}

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
      message: 'Item ID is required for delete operation',
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

// Build UPDATE query for soft delete (set is_active = false)
const deleteQuery = `UPDATE ${tableName} SET is_active = 0 WHERE id = ${parsedId}`;

// Return query and metadata
return {
  json: {
    query: deleteQuery.trim(),
    lookup_type: lookupType,
    table_name: tableName,
    item_id: parsedId,
    operation: 'soft_delete',
    description: `Soft delete ${tableName} record with id ${parsedId} (set is_active = false)`,
    // Always include current language_id (now always provided from frontend)
    language_id: typeof languageId === 'number' ? languageId : (parseInt(languageId) || 1),
    metadata: {
      note: 'This is a soft delete. The record is not physically removed from the database.',
      translations_note: 'Related translations remain in the database and are not deleted.'
    }
  }
};

