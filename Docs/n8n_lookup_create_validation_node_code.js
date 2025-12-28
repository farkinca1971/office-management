/**
 * n8n Code Node - Validation Checker for Lookup CREATE
 * 
 * This node should be placed AFTER the MySQL node that executes validation queries
 * It checks if the code already exists in the lookup table or translations table
 * 
 * Setup:
 * 1. Add a Code node AFTER the MySQL validation queries node
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. This node will check the validation results and return an error if duplicates are found
 * 
 * Input:
 * - Previous node should be a MySQL node that executed the validation queries
 * - Expected format: Array of query results with 'count' field
 */

// Get input data from previous MySQL node
const inputData = $input.all();

// The MySQL node should return results for the validation queries
// First result: lookup table check
// Second result: translations table check

if (!inputData || inputData.length < 2) {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation queries did not return expected results',
      details: {
        received_results: inputData ? inputData.length : 0,
        expected_results: 2
      }
    }
  };
}

// Extract count from first query result (lookup table check)
const lookupTableResult = inputData[0].json;
const lookupTableCount = lookupTableResult[0]?.count || 
                         lookupTableResult.count || 
                         (Array.isArray(lookupTableResult) ? lookupTableResult[0]?.count : 0);

// Extract count from second query result (translations table check)
const translationsTableResult = inputData[1].json;
const translationsTableCount = translationsTableResult[0]?.count || 
                               translationsTableResult.count || 
                               (Array.isArray(translationsTableResult) ? translationsTableResult[0]?.count : 0);

// Parse counts to integers
const lookupCount = parseInt(lookupTableCount) || 0;
const translationsCount = parseInt(translationsTableCount) || 0;

// Check if code exists in lookup table
if (lookupCount > 0) {
  return {
    success: false,
    error: {
      code: 'DUPLICATE_CODE',
      message: 'Code already exists in the lookup table',
      details: {
        code: inputData[0].json?.code || 'unknown',
        lookup_table_count: lookupCount,
        translations_table_count: translationsCount
      }
    }
  };
}

// Check if code exists in translations table
if (translationsCount > 0) {
  return {
    success: false,
    error: {
      code: 'DUPLICATE_CODE',
      message: 'Code already exists in the translations table',
      details: {
        code: inputData[0].json?.code || 'unknown',
        lookup_table_count: lookupCount,
        translations_table_count: translationsCount
      }
    }
  };
}

// Validation passed - code does not exist in either table
// Pass through the original input data for the next node (insert queries)
return {
  json: {
    success: true,
    validation_passed: true,
    lookup_table_count: lookupCount,
    translations_table_count: translationsCount,
    message: 'Code validation passed - code does not exist in lookup or translations table',
    // Pass through original data from CREATE node
    original_data: $('Code Node (CREATE)').item?.json || {}
  }
};

