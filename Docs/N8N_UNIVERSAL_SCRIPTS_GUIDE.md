# n8n Universal SQL Scripts - Complete Guide

This guide explains how to use the universal SQL query builder and response generator scripts in n8n workflows. These scripts eliminate the need to write custom SQL queries for each endpoint.

## Overview

The universal scripts system consists of two main components:

1. **Universal SQL Query Builder** ([n8n_universal_sql_query_builder.js](./n8n_universal_sql_query_builder.js))
   - Generates SQL queries dynamically based on webhook parameters
   - Supports all CRUD operations (GET, POST, PUT, PATCH, DELETE)
   - Handles JOINs, WHERE clauses, ORDER BY, etc.

2. **Universal Response Body Generator** ([n8n_universal_response_body_generator.js](./n8n_universal_response_body_generator.js))
   - Formats MySQL results into standardized API responses
   - Handles different result types (SELECT, INSERT, UPDATE, DELETE)
   - Returns consistent JSON structure

## Quick Start

### Basic n8n Workflow Structure

```
Webhook Trigger
    ↓
Code Node (Query Builder)
    ↓
MySQL Node
    ↓
Code Node (Response Generator)
    ↓
Response to Webhook
```

### Step-by-Step Setup

#### 1. Create Webhook Trigger

Create a webhook node with path:
```
https://n8n.wolfitlab.duckdns.org/webhook/YOUR-UUID-HERE/api/v1/objects/:object_id/contacts
```

HTTP Methods: GET, POST, PUT, PATCH, DELETE

#### 2. Add Query Builder Code Node

- Add a **Code** node after the webhook
- Set language to **JavaScript**
- Copy the entire contents of `n8n_universal_sql_query_builder.js`
- Paste into the code editor

#### 3. Configure Query Builder Input

The query builder needs to know which table to query. Add a **Set** node before the Code node:

```javascript
{
  "method": "{{ $json.method }}",
  "table": "object_contacts",
  "params": "{{ $json.params }}",
  "query": "{{ $json.query }}",
  "body": "{{ $json.body }}",
  "select": ["oc.id", "oc.object_id", "oc.contact_type_id", "oc.contact_value", "oc.is_active", "oc.created_at", "oc.updated_at", "oc.created_by"],
  "joins": [
    {
      "type": "LEFT",
      "table": "contact_types",
      "alias": "ct",
      "on": "ct.id = oc.contact_type_id"
    }
  ],
  "orderBy": "oc.created_at DESC"
}
```

#### 4. Add MySQL Node

- Add a **MySQL** node after the Query Builder
- Configure your database connection
- In the **Query** field, use: `{{ $json.query }}`
- This pulls the generated SQL from the Query Builder

#### 5. Add Response Generator Code Node

- Add another **Code** node after MySQL
- Set language to **JavaScript**
- Copy the entire contents of `n8n_universal_response_body_generator.js`
- Paste into the code editor

#### 6. Configure Webhook Response

- In the webhook node settings
- Enable "Respond to Webhook"
- The response will automatically use the output from the Response Generator

## Usage Examples

### Example 1: GET Object Contacts

**Webhook URL:**
```
GET https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/123/contacts?is_active=true
```

**Set Node Configuration:**
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "query": {
    "is_active": "{{ $json.query.is_active }}",
    "contact_type_id": "{{ $json.query.contact_type_id }}"
  },
  "select": ["*"],
  "orderBy": "created_at DESC"
}
```

**Generated SQL:**
```sql
SELECT oc.*
FROM `object_contacts` oc
WHERE oc.`object_id` = 123 AND oc.`is_active` = 1
ORDER BY oc.`created_at` DESC;
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 123,
      "contact_type_id": 1,
      "contact_value": "john@example.com",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_by": 1
    }
  ]
}
```

### Example 2: POST Create Contact

**Webhook URL:**
```
POST https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/123/contacts
```

**Request Body:**
```json
{
  "contact_type_id": 1,
  "contact_value": "john@example.com",
  "is_active": true,
  "created_by": 5
}
```

**Set Node Configuration:**
```json
{
  "method": "POST",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "body": {
    "object_id": "{{ $json.params.object_id }}",
    "contact_type_id": "{{ $json.body.contact_type_id }}",
    "contact_value": "{{ $json.body.contact_value }}",
    "is_active": "{{ $json.body.is_active }}",
    "created_by": "{{ $json.body.created_by }}"
  }
}
```

**Generated SQL:**
```sql
INSERT INTO `object_contacts` (`object_id`, `contact_type_id`, `contact_value`, `is_active`, `created_by`)
VALUES (123, 1, 'john@example.com', 1, 5);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "affectedRows": 1
  }
}
```

### Example 3: PUT Update Contact

**Webhook URL:**
```
PUT https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/contacts/456
```

**Request Body:**
```json
{
  "contact_value": "newemail@example.com",
  "is_active": true
}
```

**Set Node Configuration:**
```json
{
  "method": "PUT",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "body": {
    "contact_value": "{{ $json.body.contact_value }}",
    "is_active": "{{ $json.body.is_active }}",
    "updated_at": "{{ $now }}"
  }
}
```

**Generated SQL:**
```sql
UPDATE `object_contacts`
SET `contact_value` = 'newemail@example.com', `is_active` = 1, `updated_at` = '2025-12-30 12:00:00'
WHERE `id` = 456;
```

**Response:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1,
    "changedRows": 1
  }
}
```

### Example 4: DELETE Contact (Soft Delete)

**Webhook URL:**
```
DELETE https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/contacts/456
```

**Set Node Configuration:**
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "softDelete": true
}
```

**Generated SQL (Soft Delete):**
```sql
UPDATE `object_contacts`
SET `is_active` = 0
WHERE `id` = 456;
```

**Response:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1
  }
}
```

### Example 5: GET with JOINs

**Set Node Configuration:**
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "select": [
    "oc.id",
    "oc.object_id",
    "oc.contact_type_id",
    "oc.contact_value",
    "oc.is_active",
    "ct.code AS contact_type_code",
    "t.text AS contact_type_name"
  ],
  "joins": [
    {
      "type": "LEFT",
      "table": "contact_types",
      "alias": "ct",
      "on": "ct.id = oc.contact_type_id"
    },
    {
      "type": "LEFT",
      "table": "translations",
      "alias": "t",
      "on": "t.code = ct.code AND t.language_id = 1"
    }
  ],
  "orderBy": "oc.created_at DESC"
}
```

**Generated SQL:**
```sql
SELECT oc.`id`, oc.`object_id`, oc.`contact_type_id`, oc.`contact_value`, oc.`is_active`, ct.`code` AS contact_type_code, t.`text` AS contact_type_name
FROM `object_contacts` oc
LEFT JOIN `contact_types` ct ON ct.id = oc.contact_type_id
LEFT JOIN `translations` t ON t.code = ct.code AND t.language_id = 1
WHERE oc.`object_id` = 123
ORDER BY oc.`created_at` DESC;
```

## Advanced Configuration

### Custom ORDER BY

**Single Column:**
```json
{
  "orderBy": "created_at DESC"
}
```

**Multiple Columns:**
```json
{
  "orderBy": ["created_at DESC", "id ASC"]
}
```

**Object Format:**
```json
{
  "orderBy": {
    "column": "created_at",
    "direction": "DESC"
  }
}
```

### Soft Delete vs Hard Delete

**Soft Delete (Default):**
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "softDelete": true  // or omit (defaults to true)
}
```

**Hard Delete:**
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "softDelete": false
}
```

### Complex WHERE Conditions

The query builder automatically handles:
- NULL values: `column IS NULL`
- Boolean values: `column = 1` or `column = 0`
- Numbers: `column = 123`
- Strings: `column = 'value'` (with SQL injection protection)

### Return Single Object vs Array

For endpoints that should return a single object (GET by ID):

```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "expectSingle": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "object_id": 123,
    "contact_value": "john@example.com"
  }
}
```

## Error Handling

The scripts include built-in error handling:

### Missing Table Name
```json
{
  "success": false,
  "error": {
    "code": "MISSING_TABLE",
    "message": "Table name is required"
  }
}
```

### Unsupported HTTP Method
```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_METHOD",
    "message": "Unsupported HTTP method: OPTIONS"
  }
}
```

### No Records Updated/Deleted
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No records were deleted. The record may not exist."
  }
}
```

## Best Practices

1. **Always Use Set Node**: Configure the query builder input using a Set node for clarity and maintainability

2. **Table Aliases**: Use short, meaningful aliases (e.g., `oc` for `object_contacts`)

3. **Select Specific Columns**: Instead of `SELECT *`, specify columns for better performance

4. **Use Soft Deletes**: Default to soft deletes (`is_active = 0`) to preserve data

5. **Add Timestamps**: Include `created_at` and `updated_at` in INSERT/UPDATE operations

6. **Validate Input**: Add validation nodes before the query builder to check required fields

7. **Error Logging**: Add error-handling branches to log failed queries

## Troubleshooting

### Query Not Executing

**Check:**
- MySQL node has correct connection settings
- Query field in MySQL node is set to `{{ $json.query }}`
- Query builder output has a `query` property

### Empty Response

**Check:**
- WHERE clause parameters match database values
- `is_active` filter is not excluding all records
- JOINs are using correct column names

### SQL Syntax Error

**Check:**
- Table and column names are valid
- JOIN conditions use correct syntax
- Special characters in values are properly escaped

## Migration Guide

### Converting Existing Endpoints

**Before (Manual SQL):**
```sql
SELECT oc.*
FROM object_contacts oc
WHERE oc.object_id = {{ $json.params.object_id }}
  AND oc.is_active = 1
ORDER BY oc.created_at DESC;
```

**After (Universal Scripts):**
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "query": {
    "is_active": true
  },
  "orderBy": "created_at DESC"
}
```

## Performance Considerations

1. **Index Usage**: Ensure WHERE clause columns are indexed
2. **Join Optimization**: Use LEFT JOIN only when needed, prefer INNER JOIN when possible
3. **Select Specific Columns**: Avoid `SELECT *` for large tables
4. **Limit Results**: Add LIMIT clause for paginated results (future enhancement)

## Future Enhancements

Planned features:
- [ ] Pagination support (LIMIT, OFFSET)
- [ ] GROUP BY and HAVING clauses
- [ ] Aggregate functions (COUNT, SUM, AVG)
- [ ] Subqueries support
- [ ] Transaction support (BEGIN, COMMIT, ROLLBACK)
- [ ] Batch operations (INSERT multiple rows)

## Related Documentation

- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md)
- [Quick Start Guide](./QUICK_START_N8N_FORMATTERS.md)
- [n8n Response Formatters Guide](./N8N_RESPONSE_FORMATTERS_GUIDE.md)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Examples](#usage-examples)
3. Refer to existing n8n workflows for similar endpoints
