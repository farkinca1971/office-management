# n8n Status Code Node Setup Guide

This guide explains how to set up and use the Status Code node in n8n workflows to return standardized status responses.

## Overview

The Status Code node is a flexible Code node that formats responses based on input data and returns appropriate status codes. It supports multiple response formats and automatically maps error codes to HTTP status codes.

## Node Setup

### Step 1: Add Code Node

1. In your n8n workflow, add a **Code** node
2. Set the language to **JavaScript**
3. Copy the code from `n8n_status_code_node.js`

### Step 2: Configure Input

The node accepts input from previous nodes or webhooks. You can pass status information in several ways:

**From Previous Node**:
```javascript
{
  "success": true,
  "data": { "id": 1, "name": "John" }
}
```

**From Webhook Body**:
```javascript
{
  "success": false,
  "error": "User not found",
  "code": "NOT_FOUND"
}
```

## Response Formats

The node supports multiple status types via the `status_type` parameter:

### 1. API Format (Default)

**Input**:
```json
{
  "status_type": "api",
  "success": true,
  "data": { "id": 1, "name": "John" }
}
```

**Output**:
```json
{
  "success": true,
  "data": { "id": 1, "name": "John" },
  "http_status": 200
}
```

**Error Output**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR",
    "message": "User not found"
  },
  "http_status": 400
}
```

### 2. Workflow Format

**Input**:
```json
{
  "status_type": "workflow",
  "success": true,
  "message": "Operation completed"
}
```

**Output**:
```json
{
  "status": "completed",
  "code": "SUCCESS",
  "message": "Operation completed",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### 3. Validation Format

**Input**:
```json
{
  "status_type": "validation",
  "success": false,
  "error": "Invalid email format",
  "details": { "field": "email", "rule": "format" }
}
```

**Output**:
```json
{
  "valid": false,
  "code": "ERROR",
  "message": "Invalid email format",
  "errors": { "field": "email", "rule": "format" }
}
```

### 4. Operation Format

**Input**:
```json
{
  "status_type": "operation",
  "success": true,
  "data": { "affected_rows": 1 }
}
```

**Output**:
```json
{
  "operation": "success",
  "success": true,
  "message": "Operation successful",
  "result": { "affected_rows": 1 }
}
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status_type` | string | No | Response format: 'api', 'workflow', 'validation', 'operation', 'custom' (default: 'api') |
| `success` | boolean | No | Success/failure status (default: true) |
| `data` | any | No | Data to include in response |
| `error` | string/object | No | Error message or error object |
| `message` | string | No | Custom status message |
| `code` | string | No | Status code (e.g., 'SUCCESS', 'ERROR', 'VALIDATION_ERROR') |
| `http_status` | number | No | HTTP status code (auto-determined if not provided) |
| `details` | object | No | Additional details for errors or metadata |

## Common Use Cases

### Use Case 1: After Database Query

**Workflow**: Webhook → MySQL Query → Status Code Node → Response

**MySQL Node Output**:
```json
{
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ]
}
```

**Status Code Node Input**:
```json
{
  "success": true,
  "data": {{ $json.data }}
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "http_status": 200
}
```

### Use Case 2: Error Handling

**Workflow**: Webhook → Validation → Status Code Node → Response

**Validation Node Output** (if validation fails):
```json
{
  "valid": false,
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

**Status Code Node Input**:
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "error": "Validation failed",
  "details": {{ $json.errors }}
}
```

**Output**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  },
  "http_status": 400
}
```

### Use Case 3: Authentication Response

**Workflow**: Webhook → Database Check → Status Code Node → Response

**Database Check Output** (if user found):
```json
{
  "user": { "id": 1, "username": "john" },
  "password_match": true
}
```

**Status Code Node Input**:
```json
{
  "success": {{ $json.password_match }},
  "data": {{ $json.password_match ? { "user": $json.user, "token": "..." } : null }},
  "error": {{ $json.password_match ? null : "Invalid credentials" }},
  "code": {{ $json.password_match ? "SUCCESS" : "AUTHENTICATION_FAILED" }}
}
```

**Output** (success):
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "john" },
    "token": "..."
  },
  "http_status": 200
}
```

### Use Case 4: Create Operation

**Workflow**: Webhook → MySQL Insert → Status Code Node → Response

**MySQL Insert Output**:
```json
{
  "insertId": 123,
  "affectedRows": 1
}
```

**Status Code Node Input**:
```json
{
  "success": {{ $json.affectedRows > 0 }},
  "data": {{ $json.affectedRows > 0 ? { "id": $json.insertId } : null }},
  "code": {{ $json.affectedRows > 0 ? "CREATED" : "CREATE_FAILED" }},
  "http_status": {{ $json.affectedRows > 0 ? 201 : 400 }}
}
```

**Output**:
```json
{
  "success": true,
  "data": { "id": 123 },
  "http_status": 201
}
```

## Error Code to HTTP Status Mapping

The node automatically maps error codes to HTTP status codes:

| Error Code | HTTP Status |
|------------|-------------|
| `VALIDATION_ERROR`, `INVALID_INPUT` | 400 |
| `UNAUTHORIZED`, `AUTHENTICATION_FAILED` | 401 |
| `FORBIDDEN`, `INSUFFICIENT_PERMISSIONS` | 403 |
| `NOT_FOUND`, `RESOURCE_NOT_FOUND` | 404 |
| `CONFLICT`, `DUPLICATE_ENTRY` | 409 |
| `UNPROCESSABLE_ENTITY`, `BUSINESS_RULE_VIOLATION` | 422 |
| Other errors | 400 |

## Workflow Examples

### Example 1: Simple CRUD Response

```
Webhook → MySQL Query → Status Code Node → HTTP Response
```

**Status Code Node Configuration**:
- Input: `{{ $json }}` (from MySQL node)
- Add: `"success": true` if data exists

### Example 2: Validation Workflow

```
Webhook → Code Node (Validation) → Status Code Node → HTTP Response
```

**Status Code Node Configuration**:
- Input from validation node
- Use `status_type: "validation"`

### Example 3: Error Handling Workflow

```
Webhook → Try/Catch → Status Code Node → HTTP Response
```

**Status Code Node Configuration**:
- Input: Error object from catch block
- Automatically formats as error response

## Tips

1. **Always include `success` parameter** for clarity
2. **Use appropriate `code` values** for better error handling
3. **Include `http_status`** if you need specific HTTP codes
4. **Use `details`** for additional error information
5. **Set `status_type`** based on your API contract

## Integration with Webhook Response

To use the status code in a webhook response:

1. Connect Status Code Node to **Respond to Webhook** node
2. In Respond to Webhook node:
   - **Response Code**: Use `{{ $json.http_status }}`
   - **Response Body**: Use `{{ $json }}`

This ensures the HTTP status code matches the response format.

## See Also

- `n8n_status_code_node.js` - Full implementation
- `n8n_status_code_examples.js` - Simplified examples for common scenarios
- `API_ENDPOINTS_REFERENCE.md` - API response format standards

