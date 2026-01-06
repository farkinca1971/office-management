/**
 * n8n Code Node - Document Files Response Formatter
 *
 * This node formats MySQL query results for document files into standardized API responses
 * 
 * Setup:
 * 1. Add a Code node after your MySQL node that fetches files for a document
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This becomes the final response
 *
 * Input: Raw MySQL query results from the previous node (files for a document)
 * Output: Formatted API response
 *
 * Response format:
 * {
 *   success: true,
 *   data: [ ... ] // Array of file objects
 * }
 */

// Get all items from the previous node
const items = $input.all();

// Check if we have any items
if (!items || items.length === 0) {
  // No files found - return empty array
  return {
    json: {
      success: true,
      data: []
    }
  };
}

// Extract the json property from each item
// n8n MySQL node returns each row as a separate item with a 'json' property
const files = items.map(item => {
  const row = item.json;
  // Clean row by copying all properties
  const cleanRow = {};
  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      cleanRow[key] = row[key];
    }
  }
  return cleanRow;
});

// Return standardized API response
return {
  json: {
    success: true,
    data: files
  }
};

