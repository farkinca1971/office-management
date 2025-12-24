/**
 * n8n Code Node - Status Response Examples
 * 
 * This file contains simplified examples of status code nodes for common scenarios
 * Copy the example that fits your use case
 */

// ============================================================================
// EXAMPLE 1: Simple Success/Error Status
// ============================================================================
// Use this for basic success/error responses

const inputData = $input.all()[0].json;
const success = inputData.success !== undefined ? inputData.success : true;
const data = inputData.data || null;
const error = inputData.error || null;

return {
  json: {
    success: success,
    ...(success ? { data: data } : { error: { message: error || 'An error occurred' } })
  }
};

// ============================================================================
// EXAMPLE 2: API Response with Status Code
// ============================================================================
// Use this for standard API responses with HTTP status codes

const inputData = $input.all()[0].json;
const success = inputData.success !== undefined ? inputData.success : true;
const data = inputData.data || null;
const errorCode = inputData.error_code || 'ERROR';
const errorMessage = inputData.error_message || 'An error occurred';

let httpStatus = 200;
if (!success) {
  // Map error codes to HTTP status
  const statusMap = {
    'VALIDATION_ERROR': 400,
    'UNAUTHORIZED': 401,
    'FORBIDDEN': 403,
    'NOT_FOUND': 404,
    'CONFLICT': 409,
    'SERVER_ERROR': 500
  };
  httpStatus = statusMap[errorCode] || 400;
}

return {
  json: {
    success: success,
    http_status: httpStatus,
    ...(success ? { data: data } : {
      error: {
        code: errorCode,
        message: errorMessage
      }
    })
  }
};

// ============================================================================
// EXAMPLE 3: Validation Status
// ============================================================================
// Use this when validating input data

const inputData = $input.all()[0].json;
const isValid = inputData.is_valid !== undefined ? inputData.is_valid : true;
const errors = inputData.errors || [];
const data = inputData.data || null;

return {
  json: {
    valid: isValid,
    ...(isValid ? { data: data } : { errors: errors })
  }
};

// ============================================================================
// EXAMPLE 4: Database Operation Status
// ============================================================================
// Use this after database operations (INSERT, UPDATE, DELETE)

const inputData = $input.all()[0].json;
const operation = inputData.operation || 'unknown'; // 'insert', 'update', 'delete'
const affectedRows = inputData.affected_rows || 0;
const success = affectedRows > 0;
const data = inputData.data || null;

return {
  json: {
    success: success,
    operation: operation,
    affected_rows: affectedRows,
    ...(success ? { data: data } : {
      error: {
        message: `${operation} operation failed - no rows affected`
      }
    })
  }
};

// ============================================================================
// EXAMPLE 5: Conditional Status Based on Data
// ============================================================================
// Use this when status depends on data content

const inputData = $input.all()[0].json;
const data = inputData.data || inputData.result || null;

// Determine status based on data
let success = false;
let message = 'No data found';
let code = 'NO_DATA';

if (data) {
  if (Array.isArray(data) && data.length > 0) {
    success = true;
    message = `Found ${data.length} items`;
    code = 'SUCCESS';
  } else if (typeof data === 'object' && Object.keys(data).length > 0) {
    success = true;
    message = 'Data retrieved successfully';
    code = 'SUCCESS';
  } else if (data !== null && data !== undefined) {
    success = true;
    message = 'Data retrieved successfully';
    code = 'SUCCESS';
  }
}

return {
  json: {
    success: success,
    code: code,
    message: message,
    ...(success ? { data: data } : {})
  }
};

// ============================================================================
// EXAMPLE 6: Authentication Status
// ============================================================================
// Use this for login/signup operations

const inputData = $input.all()[0].json;
const authenticated = inputData.authenticated !== undefined ? inputData.authenticated : false;
const user = inputData.user || null;
const token = inputData.token || null;
const error = inputData.error || null;

if (authenticated && user && token) {
  return {
    json: {
      success: true,
      data: {
        token: token,
        user: user
      }
    }
  };
} else {
  return {
    json: {
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: error || 'Authentication failed'
      }
    }
  };
}

// ============================================================================
// EXAMPLE 7: Pagination Status
// ============================================================================
// Use this for list responses with pagination

const inputData = $input.all()[0].json;
const data = inputData.data || [];
const total = inputData.total || 0;
const page = inputData.page || 1;
const perPage = inputData.per_page || 20;
const totalPages = Math.ceil(total / perPage);

return {
  json: {
    success: true,
    data: data,
    pagination: {
      page: page,
      per_page: perPage,
      total: total,
      total_pages: totalPages
    }
  }
};

// ============================================================================
// EXAMPLE 8: Error Handler (Catch Errors from Previous Nodes)
// ============================================================================
// Use this to handle errors from previous nodes

const inputData = $input.all()[0].json;

// Check if previous node had an error
if (inputData.error) {
  return {
    json: {
      success: false,
      error: {
        code: inputData.error.code || 'ERROR',
        message: inputData.error.message || 'An error occurred',
        details: inputData.error.details || null
      }
    }
  };
}

// If no error, pass through the data
return {
  json: {
    success: true,
    data: inputData.data || inputData
  }
};

