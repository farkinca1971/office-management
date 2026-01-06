/**
 * n8n Code Node - Format Response for Lookup CREATE (Fixed)
 * 
 * This node formats the API response after successfully creating a lookup item
 * Properly handles identification_types and other lookup tables with object_type_id
 * 
 * Setup:
 * 1. Add a Code node AFTER the MySQL "Inserts" node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This node formats the response with the created item data
 * 
 * Input:
 * - Previous node should be MySQL node that executed insert queries
 * - Original data from "Create Lookup" node (or whatever you named it)
 * 
 * IMPORTANT: Make sure your MySQL node executes a SELECT query after INSERT
 * to get the full record. Example:
 * 
 * INSERT INTO identification_types (code, is_active, object_type_id) 
 * VALUES ('test_code', 1, 1);
 * 
 * SELECT id, code, is_active, object_type_id 
 * FROM identification_types 
 * WHERE id = LAST_INSERT_ID();
 */

// Get MySQL result from previous node (Inserts)
// The MySQL node should return the SELECT query result with the created record
const mysqlItems = $input.all();

// Get original data from "Create Lookup" node
// Adjust the node name if yours is different (e.g., 'create queries', 'Create Lookup', etc.)
let originalData;
try {
  originalData = $('Create Lookup').first().json;
} catch (e) {
  // Try alternative node names
  try {
    originalData = $('create queries').first().json;
  } catch (e2) {
    // If we can't find the original data, we'll build from what we have
    originalData = null;
  }
}

// Extract the created record from MySQL result
let createdRecord = null;
let insertedId = null;

if (mysqlItems && mysqlItems.length > 0) {
  // If MySQL returned a SELECT result, use that
  const lastItem = mysqlItems[mysqlItems.length - 1];
  
  if (lastItem.json && typeof lastItem.json === 'object') {
    // Check if it's a single row result
    if (lastItem.json.id !== undefined) {
      createdRecord = lastItem.json;
      insertedId = createdRecord.id;
    } else if (Array.isArray(lastItem.json)) {
      // If it's an array, get the first item
      if (lastItem.json.length > 0 && lastItem.json[0].id !== undefined) {
        createdRecord = lastItem.json[0];
        insertedId = createdRecord.id;
      }
    }
  }
  
  // Fallback: Try to get insertId from MySQL result
  if (!insertedId) {
    if (lastItem.json?.insertId) {
      insertedId = lastItem.json.insertId;
    } else if (lastItem.json?.[0]?.insertId) {
      insertedId = lastItem.json[0].insertId;
    }
  }
}

// Build response data
let responseData = {};

if (createdRecord) {
  // Use the record from database (best case - has all fields)
  responseData = {
    id: createdRecord.id,
    code: createdRecord.code,
    is_active: createdRecord.is_active === 1 || createdRecord.is_active === true
  };
  
  // Add object_type_id if present (for object_statuses, identification_types, audit_actions)
  if (createdRecord.object_type_id !== undefined) {
    responseData.object_type_id = createdRecord.object_type_id;
  }
} else if (originalData) {
  // Fallback: Build from original request data
  responseData = {
    id: insertedId,
    code: originalData.code || originalData.create_fields?.code,
    is_active: originalData.create_fields?.is_active !== undefined 
      ? originalData.create_fields.is_active 
      : true
  };
  
  // Add object_type_id if present
  if (originalData.create_fields?.object_type_id !== undefined) {
    responseData.object_type_id = parseInt(originalData.create_fields.object_type_id);
  }
} else {
  // Last resort: Build minimal response
  responseData = {
    id: insertedId,
    code: null,
    is_active: true
  };
}

// Get lookup_type and table_name
const lookupType = originalData?.lookup_type || 
                   originalData?.params?.lookup_type || 
                   'unknown';
const tableName = originalData?.table_name || lookupType.replace(/-/g, '_');

// Return formatted response
return {
  json: {
    success: true,
    data: responseData,
    lookup_type: lookupType,
    table_name: tableName
  }
};

