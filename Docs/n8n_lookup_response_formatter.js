/**
 * n8n Code Node - Format MySQL Response for Lookup Tables
 * 
 * This node formats the MySQL query results into the standard API response format
 * that the frontend expects: { success: true, data: [...] }
 * 
 * Place this node AFTER the MySQL node and BEFORE the "Respond to Webhook" node
 * 
 * Workflow structure:
 * Webhook → Extract (build SQL) → MySQL → Format Response (this node) → Respond to Webhook
 * 
 * IMPORTANT SETTINGS:
 * - Mode: "Run Once for All Items" (NOT "Run Once for Each Item")
 * - Language: JavaScript
 */

// Get the MySQL query results from the previous node
// MySQL node returns each row as a separate item in $input.all()
// Each item has a json property containing the row data
const mysqlResults = $input.all();

// Check if we have results
if (!mysqlResults || mysqlResults.length === 0) {
  return {
    json: {
      success: true,
      data: []
    }
  };
}

// Extract data from MySQL results
// MySQL node returns results as an array of items, where each item represents a row
// Each item has a json property containing the row data as an object
let data = [];

for (const item of mysqlResults) {
  // MySQL node returns each row as item.json (an object with column names as keys)
  if (item.json) {
    // Most common case: item.json is a plain object representing one row
    if (typeof item.json === 'object' && item.json !== null && !Array.isArray(item.json)) {
      // Check if it's wrapped in a data property (some MySQL configurations)
      if (item.json.data && Array.isArray(item.json.data)) {
        data = data.concat(item.json.data);
      } 
      // Check if it's wrapped in a rows property
      else if (item.json.rows && Array.isArray(item.json.rows)) {
        data = data.concat(item.json.rows);
      }
      // Direct row object - this is the most common case
      else {
        data.push(item.json);
      }
    }
    // If json is an array (uncommon but possible)
    else if (Array.isArray(item.json)) {
      data = data.concat(item.json);
    }
  }
}

// Return formatted response in the format expected by frontend
return {
  json: {
    success: true,
    data: data
  }
};

