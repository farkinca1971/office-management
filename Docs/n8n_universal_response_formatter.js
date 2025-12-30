/**
 * n8n Code Node - Universal Response Formatter
 *
 * This node formats MySQL query results into standardized API responses
 * Works for any entity type (persons, companies, employees, etc.)
 *
 * Setup:
 * 1. Add a Code node after your MySQL node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This becomes the final response
 *
 * Input: Raw MySQL query results from the previous node
 * Output: Formatted API response
 *
 * Response format:
 * {
 *   success: true,
 *   data: [...] or {...}
 * }
 *
 * OR on error:
 * {
 *   success: false,
 *   error: {
 *     code: 'ERROR_CODE',
 *     message: 'Error message'
 *   }
 * }
 */

// Get the MySQL query results from the previous node
const items = $input.all();

// Check if we have any items
if (!items || items.length === 0) {
  // No data from database - return empty array
  return {
    json: {
      success: true,
      data: []
    }
  };
}

// Handle different n8n MySQL output formats
let responseData;

if (items.length === 1 && items[0].json && typeof items[0].json === 'object' && !Array.isArray(items[0].json)) {
  // Single row result (GET by ID)
  // The MySQL node returns one item with json property containing the row
  const row = items[0].json;
  const cleanRow = {};
  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      cleanRow[key] = row[key];
    }
  }
  responseData = cleanRow;
} else {
  // Multiple rows result (GET list)
  // The MySQL node returns each row as a separate item
  // Each item has a 'json' property containing the row data
  responseData = items.map(item => {
    const row = item.json;
    const cleanRow = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        cleanRow[key] = row[key];
      }
    }
    return cleanRow;
  });
}

// Return standardized successful response
return {
  json: {
    success: true,
    data: responseData
  }
};
