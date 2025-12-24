# n8n Webhook Integration Guide

This guide explains how to set up n8n webhooks to work with the frontend API layer.

## Overview

The frontend communicates with n8n webhooks using standard HTTP methods (GET, POST, PUT, DELETE). Each endpoint in the API contract corresponds to an n8n webhook node in your workflow.

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend root directory:

```env
# n8n Webhook Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5678/api/v1

# Optional: n8n API Key (if authentication is required)
NEXT_PUBLIC_N8N_API_KEY=your-api-key-here

# API Timeout (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=30000
```

### n8n Instance URLs

- **Local Development**: `http://localhost:5678/api/v1`
- **Production**: `https://your-n8n-instance.com/api/v1`

## Webhook Setup in n8n

### 1. Create Webhook Nodes

For each API endpoint, create a webhook trigger node in n8n:

1. Add a **Webhook** node
2. Set the **HTTP Method** (GET, POST, PUT, DELETE)
3. Set the **Path** (e.g., `/api/v1/persons`)
4. Configure authentication if needed
5. Connect to your workflow logic

### 2. Webhook Path Structure

All webhooks should follow this pattern:
```
/api/v1/{resource}
```

Examples:
- `/api/v1/persons` - Person operations
- `/api/v1/companies` - Company operations
- `/api/v1/invoices` - Invoice operations
- `/api/v1/languages` - Lookup data

### 3. Response Format

n8n webhooks should return responses in this format:

**Success Response (Single Item)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

**Success Response (List)**:
```json
{
  "success": true,
  "data": [
    { "id": 1, "first_name": "John" },
    { "id": 2, "first_name": "Jane" }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'first_name' is required",
    "details": {
      "field": "first_name",
      "reason": "required"
    }
  }
}
```

## HTTP Methods

### GET Requests
- Used for: Fetching data, listing resources
- Query Parameters: Passed as URL query string
- Example: `GET /api/v1/persons?page=1&per_page=20`

### POST Requests
- Used for: Creating new resources
- Request Body: JSON payload with resource data
- Example: `POST /api/v1/persons` with body `{ "first_name": "John", "last_name": "Doe" }`

### PUT Requests
- Used for: Updating existing resources
- Request Body: JSON payload with updated fields
- Example: `PUT /api/v1/persons/1` with body `{ "first_name": "Jane" }`

### DELETE Requests
- Used for: Deleting resources (soft delete)
- Example: `DELETE /api/v1/persons/1`

## Authentication

### Token-Based Authentication

If your n8n workflow requires authentication:

1. The frontend sends a token in the `Authorization` header:
   ```
   Authorization: Bearer {token}
   ```

2. In n8n, extract the token from headers:
   - Use an **HTTP Request** node or **Code** node
   - Access header: `{{ $json.headers.authorization }}`

### API Key Authentication

If using API keys:

1. Set `NEXT_PUBLIC_N8N_API_KEY` in `.env.local`
2. The API client automatically adds `X-API-Key` header
3. In n8n, validate the API key in your workflow

## Common Workflow Patterns

### 1. Simple CRUD Workflow

```
Webhook → Validate Input → Database Query → Format Response → Return
```

### 2. List with Pagination

```
Webhook → Extract Query Params → Database Query (with LIMIT/OFFSET) → 
Count Total → Format Response with Pagination → Return
```

### 3. Create with Validation

```
Webhook → Validate Input → Check Duplicates → Insert to Database → 
Return Created Resource
```

### 4. Update with Validation

```
Webhook → Validate Input → Check Resource Exists → Update Database → 
Return Updated Resource
```

## Error Handling

### HTTP Status Codes

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry
- `422 Unprocessable Entity`: Business rule violation
- `500 Internal Server Error`: Server errors

### Error Response Format

Always return errors in this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Testing Webhooks

### Using n8n's Test Mode

1. Open your workflow in n8n
2. Click "Execute Workflow" to test
3. Use the webhook URL provided by n8n
4. Test with tools like Postman or curl

### Example curl Commands

**GET Request**:
```bash
curl -X GET "http://localhost:5678/api/v1/persons?page=1&per_page=20" \
  -H "Authorization: Bearer your-token"
```

**POST Request**:
```bash
curl -X POST "http://localhost:5678/api/v1/persons" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"first_name": "John", "last_name": "Doe"}'
```

## Database Integration

### MySQL Connection in n8n

1. Use the **MySQL** node in n8n
2. Configure connection to your database
3. Use SQL queries to interact with the database
4. Map query results to response format

### Example MySQL Query

```sql
SELECT * FROM persons 
WHERE is_active = 1 
LIMIT {{ $json.query.per_page }} 
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }}
```

## Best Practices

1. **Validate Input**: Always validate request data before processing
2. **Error Handling**: Return consistent error format
3. **Logging**: Log important operations for debugging
4. **Security**: Validate authentication tokens
5. **Performance**: Use pagination for large datasets
6. **Idempotency**: Ensure PUT/DELETE operations are idempotent

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure CORS in n8n webhook settings
2. **Timeout Errors**: Increase timeout in frontend config
3. **Authentication Failures**: Verify token format and validation
4. **Response Format Errors**: Ensure response matches expected format

### Debugging Tips

1. Use n8n's execution log to see request/response data
2. Add **Code** nodes to log intermediate data
3. Test webhooks individually before integrating
4. Check browser network tab for request/response details

