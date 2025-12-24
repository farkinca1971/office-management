/**
 * n8n Code Node - Status Response Handler
 * 
 * This node returns a status response based on input data and conditions
 * 
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect this node in your workflow where status determination is needed
 * 
 * Input Parameters (from previous node or webhook):
 * - status_type: Type of status to return (optional, default: 'api')
 *   Options: 'api', 'workflow', 'validation', 'operation', 'custom'
 * 
 * - success: Boolean indicating success/failure (optional)
 * - data: Data to include in response (optional)
 * - error: Error object or message (optional)
 * - message: Custom status message (optional)
 * - code: Status code (optional, e.g., 'SUCCESS', 'ERROR', 'VALIDATION_ERROR')
 * - http_status: HTTP status code (optional, default: 200 for success, 400 for error)
 * 
 * Usage Examples:
 * 
 * 1. Simple Success Response:
 *    Input: { success: true, data: { id: 1, name: "John" } }
 *    Output: { success: true, data: { id: 1, name: "John" } }
 * 
 * 2. Error Response:
 *    Input: { success: false, error: "User not found" }
 *    Output: { success: false, error: { code: "ERROR", message: "User not found" } }
 * 
 * 3. Validation Error:
 *    Input: { success: false, code: "VALIDATION_ERROR", message: "Invalid input" }
 *    Output: { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input" } }
 * 
 * 4. Custom Status:
 *    Input: { status_type: "custom", code: "PENDING", message: "Processing..." }
 *    Output: { success: true, status: "PENDING", message: "Processing..." }
 */

// Get input data from previous node
const inputData = $input.all()[0].json;

// Extract parameters from input
const statusType = inputData.status_type || inputData.query?.status_type || 'api';
const success = inputData.success !== undefined ? inputData.success : (inputData.query?.success !== undefined ? inputData.query.success : true);
const data = inputData.data || inputData.query?.data || inputData.body?.data || null;
const error = inputData.error || inputData.query?.error || inputData.body?.error || null;
const message = inputData.message || inputData.query?.message || inputData.body?.message || null;
const code = inputData.code || inputData.query?.code || inputData.body?.code || null;
const httpStatus = inputData.http_status || inputData.query?.http_status || inputData.body?.http_status || null;
const details = inputData.details || inputData.query?.details || inputData.body?.details || null;

// Determine actual success status
// If error exists, assume failure unless explicitly set to success
let actualSuccess = success;
if (error && success === true) {
  actualSuccess = false;
}

// Determine status code based on input
let statusCode = code;
if (!statusCode) {
  if (actualSuccess) {
    statusCode = 'SUCCESS';
  } else {
    statusCode = 'ERROR';
  }
}

// Determine HTTP status code
let httpStatusCode = httpStatus;
if (!httpStatusCode) {
  if (actualSuccess) {
    httpStatusCode = 200;
  } else {
    // Map error codes to HTTP status codes
    if (statusCode === 'VALIDATION_ERROR' || statusCode === 'INVALID_INPUT') {
      httpStatusCode = 400;
    } else if (statusCode === 'UNAUTHORIZED' || statusCode === 'AUTHENTICATION_FAILED') {
      httpStatusCode = 401;
    } else if (statusCode === 'FORBIDDEN' || statusCode === 'INSUFFICIENT_PERMISSIONS') {
      httpStatusCode = 403;
    } else if (statusCode === 'NOT_FOUND' || statusCode === 'RESOURCE_NOT_FOUND') {
      httpStatusCode = 404;
    } else if (statusCode === 'CONFLICT' || statusCode === 'DUPLICATE_ENTRY') {
      httpStatusCode = 409;
    } else if (statusCode === 'UNPROCESSABLE_ENTITY' || statusCode === 'BUSINESS_RULE_VIOLATION') {
      httpStatusCode = 422;
    } else {
      httpStatusCode = 400; // Default error status
    }
  }
}

// Build response based on status type
let response = {};

switch (statusType) {
  case 'api':
    // Standard API response format
    if (actualSuccess) {
      response = {
        success: true,
        data: data
      };
      
      // Add message if provided
      if (message) {
        response.message = message;
      }
    } else {
      response = {
        success: false,
        error: {
          code: statusCode,
          message: error || message || 'An error occurred'
        }
      };
      
      // Add details if provided
      if (details) {
        response.error.details = details;
      }
      
      // Add data if provided (for partial success scenarios)
      if (data) {
        response.data = data;
      }
    }
    break;

  case 'workflow':
    // Workflow status format
    response = {
      status: actualSuccess ? 'completed' : 'failed',
      code: statusCode,
      message: message || (actualSuccess ? 'Operation completed successfully' : (error || 'Operation failed')),
      timestamp: new Date().toISOString()
    };
    
    if (data) {
      response.data = data;
    }
    
    if (details) {
      response.details = details;
    }
    break;

  case 'validation':
    // Validation response format
    response = {
      valid: actualSuccess,
      code: statusCode,
      message: message || (actualSuccess ? 'Validation passed' : (error || 'Validation failed'))
    };
    
    if (!actualSuccess && details) {
      response.errors = details;
    }
    
    if (data) {
      response.data = data;
    }
    break;

  case 'operation':
    // Operation status format
    response = {
      operation: statusCode.toLowerCase(),
      success: actualSuccess,
      message: message || (actualSuccess ? 'Operation successful' : (error || 'Operation failed'))
    };
    
    if (data) {
      response.result = data;
    }
    
    if (details) {
      response.metadata = details;
    }
    break;

  case 'custom':
    // Custom format - use input as-is with status additions
    response = {
      ...inputData,
      success: actualSuccess,
      code: statusCode,
      http_status: httpStatusCode
    };
    
    if (message && !response.message) {
      response.message = message;
    }
    break;

  default:
    // Default to API format
    response = {
      success: actualSuccess,
      ...(actualSuccess ? { data: data } : {
        error: {
          code: statusCode,
          message: error || message || 'An error occurred'
        }
      })
    };
}

// Add HTTP status code to response (useful for webhook responses)
response.http_status = httpStatusCode;

// Return the response
return {
  json: response
};

