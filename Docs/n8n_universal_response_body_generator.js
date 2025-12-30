/**
 * n8n Code Node - Universal Response Body Generator
 *
 * This node generates standardized API responses based on database query results
 * Handles all CRUD operations (GET, POST, PUT, PATCH, DELETE) for any entity
 *
 * Setup:
 * 1. Add a Code node after your MySQL node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This becomes the final response to the webhook
 *
 * Input Parameters (from previous nodes):
 * - MySQL query results (automatic from MySQL node)
 * - operation: Operation type (SELECT, INSERT, UPDATE, DELETE) - from query builder
 * - method: HTTP method (GET, POST, PUT, PATCH, DELETE)
 * - expectSingle: Whether to return single object vs array (optional)
 *
 * Output Formats:
 *
 * Success Response:
 * {
 *   success: true,
 *   data: [...] or {...} or { id: 123 }
 * }
 *
 * Error Response:
 * {
 *   success: false,
 *   error: {
 *     code: 'ERROR_CODE',
 *     message: 'Error message',
 *     details: {...}
 *   }
 * }
 */

// Get all items from previous nodes
const items = $input.all();

// Try to get operation info from the query builder node (if available)
let operation = null;
let method = 'GET';
let expectSingle = false;

// Check if we have metadata from the query builder
if (items.length > 0 && items[0].json) {
  const firstItem = items[0].json;
  operation = firstItem.operation || null;
  method = firstItem.method || 'GET';
  expectSingle = firstItem.expectSingle || false;
}

// Detect operation from method if not provided
if (!operation && method) {
  switch (method.toUpperCase()) {
    case 'GET':
      operation = 'SELECT';
      break;
    case 'POST':
      operation = 'INSERT';
      break;
    case 'PUT':
    case 'PATCH':
      operation = 'UPDATE';
      break;
    case 'DELETE':
      operation = 'DELETE';
      break;
  }
}

// Helper function to clean MySQL row data
const cleanRow = (row) => {
  const cleaned = {};
  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      cleaned[key] = row[key];
    }
  }
  return cleaned;
};

// Helper function to format MySQL results
const formatMySQLResults = (items) => {
  // Check if we have any items
  if (!items || items.length === 0) {
    return null;
  }

  // n8n MySQL node returns results in different formats:
  // 1. Single row: One item with json property containing the row
  // 2. Multiple rows: Each row as a separate item with json property
  // 3. INSERT result: { affectedRows, insertId, ... }
  // 4. UPDATE result: { affectedRows, changedRows, ... }
  // 5. DELETE result: { affectedRows, ... }

  const firstItem = items[0].json;

  // Check if this is a mutation result (INSERT, UPDATE, DELETE)
  if (firstItem && typeof firstItem === 'object' && 'affectedRows' in firstItem) {
    return {
      isMutation: true,
      affectedRows: firstItem.affectedRows || 0,
      insertId: firstItem.insertId || null,
      changedRows: firstItem.changedRows || 0
    };
  }

  // Check if this is a single row result or multiple rows
  if (items.length === 1 && firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
    // Single row result
    return {
      isMutation: false,
      isSingle: true,
      data: cleanRow(firstItem)
    };
  }

  // Multiple rows result
  return {
    isMutation: false,
    isSingle: false,
    data: items.map(item => cleanRow(item.json))
  };
};

// Format the MySQL results
const formattedResults = formatMySQLResults(items);

// Handle empty results
if (!formattedResults) {
  return {
    json: {
      success: true,
      data: expectSingle ? null : []
    }
  };
}

// Build response based on operation type
let response = {
  success: true
};

if (formattedResults.isMutation) {
  // Handle INSERT, UPDATE, DELETE results
  switch (operation) {
    case 'INSERT':
      // Return the inserted ID
      if (formattedResults.insertId) {
        response.data = {
          id: formattedResults.insertId,
          affectedRows: formattedResults.affectedRows
        };
      } else {
        response.data = {
          affectedRows: formattedResults.affectedRows
        };
      }
      break;

    case 'UPDATE':
      // Return update confirmation
      response.data = {
        affectedRows: formattedResults.affectedRows,
        changedRows: formattedResults.changedRows
      };
      break;

    case 'DELETE':
      // Return delete confirmation
      response.data = {
        affectedRows: formattedResults.affectedRows
      };
      // For soft deletes, we might want to confirm success differently
      response.success = formattedResults.affectedRows > 0;
      if (!response.success) {
        response.error = {
          code: 'NOT_FOUND',
          message: 'No records were deleted. The record may not exist.'
        };
      }
      break;

    default:
      // Unknown mutation type
      response.data = {
        affectedRows: formattedResults.affectedRows
      };
  }
} else {
  // Handle SELECT results
  if (expectSingle || formattedResults.isSingle) {
    // Return single object
    response.data = formattedResults.data;
  } else {
    // Return array of objects
    response.data = Array.isArray(formattedResults.data) ? formattedResults.data : [formattedResults.data];
  }
}

// Return the standardized response
return {
  json: response
};
