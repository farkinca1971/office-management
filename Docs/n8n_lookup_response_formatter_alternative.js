/**
 * n8n Code Node - Format MySQL Response (Alternative - if MySQL returns data differently)
 * 
 * Use this version if your MySQL node returns data in a different format
 * 
 * IMPORTANT: Set node mode to "Run Once for All Items"
 */

// Try different ways MySQL might return data
let data = [];

// Method 1: Standard MySQL node output (each row is an item)
const allItems = $input.all();
if (allItems && allItems.length > 0) {
  for (const item of allItems) {
    if (item.json) {
      // Direct row object (most common)
      if (typeof item.json === 'object' && !Array.isArray(item.json)) {
        data.push(item.json);
      }
      // Wrapped in data property
      else if (item.json.data && Array.isArray(item.json.data)) {
        data = data.concat(item.json.data);
      }
      // Wrapped in rows property
      else if (item.json.rows && Array.isArray(item.json.rows)) {
        data = data.concat(item.json.rows);
      }
      // Array of rows
      else if (Array.isArray(item.json)) {
        data = data.concat(item.json);
      }
    }
  }
}

// Method 2: If MySQL returns single item with all rows
// (Some MySQL configurations return all rows in first item)
if (data.length === 0 && allItems.length > 0 && allItems[0].json) {
  const firstItem = allItems[0].json;
  
  // Check if first item contains all rows as an array
  if (Array.isArray(firstItem)) {
    data = firstItem;
  }
  // Check if wrapped
  else if (Array.isArray(firstItem.data)) {
    data = firstItem.data;
  }
  else if (Array.isArray(firstItem.rows)) {
    data = firstItem.rows;
  }
  // Single row
  else if (typeof firstItem === 'object') {
    data = [firstItem];
  }
}

// Return formatted response
return {
  json: {
    success: true,
    data: data
  }
};

