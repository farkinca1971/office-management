/**
 * n8n Code Node - Persons List Response Formatter
 *
 * This node formats the MySQL query results into a standardized API response
 * for the GET /api/v1/persons endpoint
 *
 * Setup:
 * 1. Add a Code node after your MySQL node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This becomes the final response
 *
 * Input: Raw MySQL query results from the previous node
 * Output: Formatted API response matching the frontend expectations
 */

// Get the MySQL query results from the previous node
const items = $input.all();

// Check if we have data
if (!items || items.length === 0) {
  return {
    json: {
      success: true,
      data: []
    }
  };
}

// Extract the data array from the first item
// MySQL node returns results in items[0].json (which is an array of rows)
const rawData = items[0].json;

// Check if rawData is an array
if (!Array.isArray(rawData)) {
  return {
    json: {
      success: false,
      error: {
        code: 'INVALID_DATA_FORMAT',
        message: 'Expected array of persons from database'
      }
    }
  };
}

// Transform each person record to match the frontend Person interface
const persons = rawData.map(row => {
  return {
    // Person-specific fields
    id: row.id,
    first_name: row.first_name || '',
    middle_name: row.middle_name || null,
    last_name: row.last_name || '',
    mother_name: row.mother_name || null,
    sex_id: row.sex_id || null,
    salutation_id: row.salutation_id || null,
    birth_date: row.birth_date || null,

    // Fields from objects table (extended fields)
    object_type_id: row.object_type_id || null,
    object_status_id: row.object_status_id || null,

    // BaseEntity fields (created_at, updated_at)
    created_at: row.created_at || null,
    updated_at: row.updated_at || null
  };
});

// Return standardized API response
return {
  json: {
    success: true,
    data: persons
  }
};
