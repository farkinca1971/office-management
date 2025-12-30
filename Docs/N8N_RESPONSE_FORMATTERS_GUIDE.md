# n8n Response Formatters Guide

## Overview

This guide explains how to format MySQL query results into standardized API responses that match the frontend expectations.

## Standard API Response Format

All API endpoints should return responses in this format:

### Success Response
```json
{
  "success": true,
  "data": [...] or {...}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  }
}
```

## Available Formatters

### 1. Universal Response Formatter (Recommended)
**File:** [n8n_universal_response_formatter.js](./n8n_universal_response_formatter.js)

**Use for:** Any MySQL query result that needs to be formatted

**Features:**
- Handles both single row and multiple rows
- Handles empty results
- Cleans up data format
- Works with any entity type (persons, companies, employees, etc.)

**Example n8n Workflow:**
```
Webhook → Code (Query Builder) → MySQL → Code (Universal Formatter) → Respond to Webhook
```

### 2. Persons-Specific Formatter
**File:** [n8n_persons_response_formatter.js](./n8n_persons_response_formatter.js)

**Use for:** GET /api/v1/persons endpoint specifically

**Features:**
- Explicitly maps all person fields
- Ensures correct field types
- Handles null values properly
- Documents expected fields

**When to use:**
- When you want explicit field mapping
- When you need to add custom transformations for persons
- When you want self-documenting code showing the Person interface

## How to Use in n8n

### Step 1: Add MySQL Node
Configure your MySQL query to fetch the data.

For persons:
```sql
SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.mother_name,
    p.sex_id,
    p.salutation_id,
    p.birth_date,
    o.object_status_id,
    o.object_type_id
FROM persons p
JOIN objects o ON o.id = p.id
ORDER BY p.last_name, p.first_name;
```

### Step 2: Add Code Node for Formatting
1. Click the **+** button after your MySQL node
2. Select **Code** node
3. Set **Language** to **JavaScript**
4. Copy and paste one of the formatter scripts
5. Name the node appropriately (e.g., "Format Response")

### Step 3: Connect to Webhook Response
The formatted output becomes the final response to the webhook.

## Input/Output Examples

### Example 1: List of Persons

**MySQL Output (Raw):**
```json
[
  {
    "id": 10,
    "first_name": "Kisné",
    "middle_name": "",
    "last_name": "Nagy",
    "mother_name": "Margó Piroska",
    "sex_id": 2,
    "salutation_id": 2,
    "birth_date": "1987-02-10",
    "object_status_id": 1,
    "object_type_id": 1
  },
  {
    "id": 8,
    "first_name": "Farkas",
    "middle_name": null,
    "last_name": "Zoltán",
    "mother_name": null,
    "sex_id": 1,
    "salutation_id": 1,
    "birth_date": "1971-02-10",
    "object_status_id": 1,
    "object_type_id": 1
  }
]
```

**Formatted Output (After Formatter):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "first_name": "Kisné",
      "middle_name": null,
      "last_name": "Nagy",
      "mother_name": "Margó Piroska",
      "sex_id": 2,
      "salutation_id": 2,
      "birth_date": "1987-02-10",
      "object_status_id": 1,
      "object_type_id": 1,
      "created_at": null,
      "updated_at": null
    },
    {
      "id": 8,
      "first_name": "Farkas",
      "middle_name": null,
      "last_name": "Zoltán",
      "mother_name": null,
      "sex_id": 1,
      "salutation_id": 1,
      "birth_date": "1971-02-10",
      "object_status_id": 1,
      "object_type_id": 1,
      "created_at": null,
      "updated_at": null
    }
  ]
}
```

### Example 2: Single Person (GET by ID)

**MySQL Output (Raw):**
```json
{
  "id": 8,
  "first_name": "Farkas",
  "middle_name": null,
  "last_name": "Zoltán",
  "mother_name": null,
  "sex_id": 1,
  "salutation_id": 1,
  "birth_date": "1971-02-10",
  "object_status_id": 1,
  "object_type_id": 1
}
```

**Formatted Output:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "first_name": "Farkas",
    "middle_name": null,
    "last_name": "Zoltán",
    "mother_name": null,
    "sex_id": 1,
    "salutation_id": 1,
    "birth_date": "1971-02-10",
    "object_status_id": 1,
    "object_type_id": 1,
    "created_at": null,
    "updated_at": null
  }
}
```

### Example 3: Empty Result

**MySQL Output (Raw):**
```json
[]
```

**Formatted Output:**
```json
{
  "success": true,
  "data": []
}
```

## Common Issues and Solutions

### Issue 1: Empty String vs Null
**Problem:** MySQL returns empty strings `""` instead of `null`

**Solution:** The formatters handle this automatically by converting empty strings to `null` where appropriate.

### Issue 2: Date Format
**Problem:** Dates need to be in `YYYY-MM-DD` format

**Solution:** Select dates as strings in MySQL:
```sql
SELECT DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date
```
Or just use `birth_date` directly - MySQL returns dates in correct format.

### Issue 3: Missing created_at/updated_at
**Problem:** Frontend expects these fields but they're not in the query

**Solution:** Either:
1. Add them to your SQL query:
   ```sql
   SELECT p.*, o.created_at, o.updated_at
   FROM persons p
   JOIN objects o ON o.id = p.id
   ```
2. Or let the formatter set them to `null` (current behavior)

## Best Practices

1. **Always use a formatter** - Never return raw MySQL results
2. **Use Universal Formatter** for most cases - It's simpler and works for all entities
3. **Handle errors properly** - Return error responses when queries fail
4. **Test with empty results** - Ensure your workflow handles empty arrays
5. **Keep field names consistent** - Match the frontend TypeScript interfaces

## Testing Your Formatter

1. In n8n, click "Execute Node" on the formatter
2. Check the OUTPUT panel on the right
3. Verify the structure matches the expected format
4. Test with:
   - Multiple rows
   - Single row
   - Empty result
   - Rows with null values

## Related Files

- [n8n_universal_response_formatter.js](./n8n_universal_response_formatter.js) - Universal formatter for any entity
- [n8n_persons_response_formatter.js](./n8n_persons_response_formatter.js) - Persons-specific formatter
- [n8n_object_audits_node_code.js](./n8n_object_audits_node_code.js) - Audit records query builder
- [AUDIT_TABLE_BACKEND_UPDATE.md](./AUDIT_TABLE_BACKEND_UPDATE.md) - Audit table backend requirements
