/**
 * n8n Code Node - Format Response for Lookup CREATE (Simple & Fixed)
 * 
 * FIXED VERSION - Properly extracts data from MySQL result and original request
 * 
 * Setup:
 * 1. Add this Code node AFTER your MySQL INSERT node
 * 2. Make sure your MySQL node includes a SELECT query after INSERT:
 *    INSERT INTO identification_types (code, is_active, object_type_id) VALUES (...);
 *    SELECT id, code, is_active, object_type_id FROM identification_types WHERE id = LAST_INSERT_ID();
 */

// Get MySQL result from previous node
const mysqlResult = $input.all();

// Get original request data from "Create Lookup" node (adjust node name if different)
let originalData;
try {
  originalData = $('Create Lookup').first().json;
} catch (e) {
  try {
    originalData = $('create queries').first().json;
  } catch (e2) {
    originalData = null;
  }
}

// Extract the created record
let createdRecord = null;

// Try to get the SELECT result from MySQL (should be the last item)
if (mysqlResult && mysqlResult.length > 0) {
  const lastItem = mysqlResult[mysqlResult.length - 1];
  
  // Check if it's a SELECT result with the record
  if (lastItem.json) {
    if (lastItem.json.id !== undefined) {
      // Single row result
      createdRecord = lastItem.json;
    } else if (Array.isArray(lastItem.json) && lastItem.json.length > 0) {
      // Array of results - get first one
      createdRecord = lastItem.json[0];
    }
  }
}

// Build response data
let responseData;

if (createdRecord && createdRecord.id) {
  // Use the record from database (has all fields including object_type_id)
  responseData = {
    id: createdRecord.id,
    code: createdRecord.code,
    is_active: createdRecord.is_active === 1 || createdRecord.is_active === true
  };
  
  // Add object_type_id if present (for identification_types, object_statuses, audit_actions)
  if (createdRecord.object_type_id !== undefined && createdRecord.object_type_id !== null) {
    responseData.object_type_id = parseInt(createdRecord.object_type_id);
  }
} else if (originalData) {
  // Fallback: Build from original request
  const createFields = originalData.create_fields || {};
  responseData = {
    id: null, // Will be set by MySQL insertId if available
    code: originalData.code || createFields.code,
    is_active: createFields.is_active !== undefined ? createFields.is_active : true
  };
  
  // Add object_type_id if present
  if (createFields.object_type_id !== undefined && createFields.object_type_id !== null) {
    responseData.object_type_id = parseInt(createFields.object_type_id);
  }
} else {
  // Last resort
  return {
    json: {
      success: false,
      error: {
        code: 'MISSING_DATA',
        message: 'Could not extract created record data'
      }
    }
  };
}

// Get lookup_type
const lookupType = originalData?.lookup_type || 
                   originalData?.params?.lookup_type || 
                   'unknown';

// Return formatted response
return {
  json: {
    success: true,
    data: responseData,
    lookup_type: lookupType,
    table_name: originalData?.table_name || lookupType.replace(/-/g, '_')
  }
};

