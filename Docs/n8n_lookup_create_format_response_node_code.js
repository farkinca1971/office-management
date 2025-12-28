/**
 * n8n Code Node - Format Response for Lookup CREATE
 * 
 * This node formats the API response after successfully creating a lookup item
 * 
 * Setup:
 * 1. Add a Code node AFTER the MySQL "Inserts" node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This node formats the response with the created item data
 * 
 * Input:
 * - Previous node should be MySQL node that executed insert queries
 * - Original data from "create queries" node
 */

// Get MySQL result from previous node (Inserts)
const mysqlResult = $input.all()[0].json;

// Get original data from "create queries" node
const originalData = $('create queries').item.json;

// Extract the lookup table insert ID
// When executing multiple queries, MySQL returns results for each query
// The lookup table insert is the last INSERT query (after translation inserts)
// MySQL returns insertId for the last INSERT statement
let insertedId = null;

// Try different ways to get the insert ID
if (mysqlResult.insertId) {
  insertedId = mysqlResult.insertId;
} else if (mysqlResult[0]?.insertId) {
  insertedId = mysqlResult[0].insertId;
} else if (Array.isArray(mysqlResult) && mysqlResult.length > 0) {
  // If multiple results, get the last one (which should be the lookup table insert)
  const lastResult = mysqlResult[mysqlResult.length - 1];
  insertedId = lastResult.insertId || lastResult[0]?.insertId;
}

// If we still don't have an ID, try to query it from the database using the code
// This is a fallback in case insertId is not available
if (!insertedId && originalData.code) {
  // We'll need to query the database, but for now, we'll return what we have
  // The frontend can handle a response without ID if needed
}

// Build response data
const responseData = {
  id: insertedId,
  code: originalData.code,
  is_active: originalData.create_fields.is_active
};

// Add translation info if translation was created
if (originalData.has_translation && originalData.create_fields.text) {
  responseData.translation = {
    text: originalData.create_fields.text,
    language_id: originalData.create_fields.language_id || null,
    language_code: originalData.language_code
  };
}

// Add object_type_id if this is an object_status
if (originalData.create_fields.object_type_id) {
  responseData.object_type_id = originalData.create_fields.object_type_id;
}

// Return formatted response
return {
  json: {
    success: true,
    data: responseData,
    lookup_type: originalData.lookup_type,
    table_name: originalData.table_name
  }
};

