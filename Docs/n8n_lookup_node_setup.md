# n8n Dynamic Lookup Node Setup Guide

This guide explains how to set up a single Code node that handles all lookup table queries dynamically.

## Overview

Instead of creating separate nodes for each lookup table, you can use one Code node that dynamically generates the appropriate SQL query based on the `lookup_type` parameter.

## Node Setup

### Step 1: Add Code Node

1. In your n8n workflow, add a **Code** node
2. Set the language to **JavaScript**
3. Copy the code from `n8n_lookup_node_code.js`

### Step 2: Connect MySQL Node

1. Add a **MySQL** node after the Code node
2. Configure your MySQL connection
3. In the MySQL node settings:
   - **Operation**: Execute Query

   - **Query**: Use expression `{{ $json.query }}`
### Step 3: Format Response

Add another Code node after MySQL to format the response:

```javascript
// Format response for API
const data = $input.all()[0].json;
const lookupType = $('Code Node').item.json.lookup_type;

return {
  json: {
    success: true,
    data: Array.isArray(data) ? data : [data],
    lookup_type: lookupType
  }
};
```

## Usage Examples

### Example 1: Get All Languages

**Webhook Request**:
```
GET /api/v1/languages
```

**Webhook Body/Query**:
```json
{
  "lookup_type": "languages"
}
```

### Example 2: Get Object Statuses for Specific Type

**Webhook Request**:
```
GET /api/v1/object-statuses?object_type_id=1
```

**Webhook Body/Query**:
```json
{
  "lookup_type": "object_statuses",
  "object_type_id": 1
}
```

### Example 3: Get Translations by Code

**Webhook Request**:
```
GET /api/v1/translations?code=person
```

**Webhook Body/Query**:
```json
{
  "lookup_type": "translations",
  "code": "person"
}
```

### Example 4: Get Translations by Language

**Webhook Request**:
```
GET /api/v1/translations?language_id=1
```

**Webhook Body/Query**:
```json
{
  "lookup_type": "translations",
  "language_id": 1
}
```

## Supported Lookup Types

| lookup_type | Description | Optional Filters |
|------------|-------------|------------------|
| `languages` | Get all languages | None |
| `object_types` | Get all object types | None |
| `object_statuses` | Get object statuses | `object_type_id` |
| `sexes` | Get gender options | None |
| `salutations` | Get salutation options | None |
| `product_categories` | Get product categories | None |
| `countries` | Get all countries | None |
| `address_types` | Get address types | None |
| `address_area_types` | Get address area types | None |
| `contact_types` | Get contact types | None |
| `transaction_types` | Get transaction types | None |
| `currencies` | Get currencies | None |
| `object_relation_types` | Get relation types | None |
| `translations` | Get translations | `code`, `language_id` |

## Complete Workflow Example

```
Webhook (GET /api/v1/languages)
  ↓
Code Node (Dynamic Lookup Handler)
  ↓
MySQL Node (Execute Query)
  ↓
Code Node (Format Response)
  ↓
Respond to Webhook
```

### Webhook Node Configuration

- **HTTP Method**: GET
- **Path**: `/api/v1/languages`
- **Response Mode**: Respond to Webhook

### Code Node 1 (Dynamic Lookup)

- **Language**: JavaScript
- **Code**: From `n8n_lookup_node_code.js`

### MySQL Node

- **Operation**: Execute Query
- **Query**: `{{ $json.query }}`
- **Options**: 
  - Return Field Names: true

### Code Node 2 (Format Response)

```javascript
const queryResult = $input.all();
const lookupType = $('Code Node').item.json.lookup_type;

// Handle empty results
if (!queryResult || queryResult.length === 0) {
  return {
    json: {
      success: true,
      data: [],
      lookup_type: lookupType
    }
  };
}

// Format results
const data = queryResult.map(item => item.json);

return {
  json: {
    success: true,
    data: data,
    lookup_type: lookupType
  }
};
```

### Respond to Webhook Node

- **Response Code**: 200
- **Response Body**: `{{ $json }}`

## Error Handling

The Code node returns errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOOKUP_TYPE",
    "message": "Invalid lookup_type. Must be one of: ...",
    "details": {
      "provided": "invalid_type",
      "valid_types": ["languages", "object_types", ...]
    }
  }
}
```

Add error handling in your workflow:

```javascript
// After Code Node 1
const result = $input.all()[0].json;

if (!result.success) {
  return {
    json: {
      success: false,
      error: result.error
    }
  };
}

// Continue with MySQL query
return result;
```

## Advanced: Single Endpoint for All Lookups

You can create a single webhook endpoint that handles all lookup types:

**Webhook Path**: `/api/v1/lookups/{lookup_type}`

**Code Node (Extract lookup_type from path)**:
```javascript
const path = $input.all()[0].json.path || '';
const pathParts = path.split('/').filter(p => p);
const lookupType = pathParts[pathParts.length - 1];

return {
  json: {
    lookup_type: lookupType,
    ...$input.all()[0].json.query
  }
};
```

Then use the dynamic lookup code node as before.

## Benefits

1. **Single Node**: One Code node handles all lookup tables
2. **Maintainable**: Update queries in one place
3. **Consistent**: All lookups use the same response format
4. **Flexible**: Easy to add new lookup types
5. **Efficient**: Less node duplication in workflows

## Adding New Lookup Types

To add a new lookup type:

1. Add the type to `validLookupTypes` array
2. Add a new `case` in the switch statement
3. Write the SQL query following the same pattern

Example:
```javascript
case 'new_lookup_type':
  sqlQuery = `
SELECT 
    id,
    code,
    is_active
FROM new_lookup_table
WHERE is_active = 1
ORDER BY code;
  `;
  break;
```

## Testing

Test each lookup type:

```bash
# Test languages
curl "http://localhost:5678/api/v1/languages"

# Test object_statuses with filter
curl "http://localhost:5678/api/v1/object-statuses?object_type_id=1"

# Test translations with code filter
curl "http://localhost:5678/api/v1/translations?code=person"
```

## Troubleshooting

### Issue: Query returns empty

- Check if `is_active = 1` filter is too restrictive
- Verify data exists in the database
- Check MySQL connection

### Issue: Invalid lookup_type error

- Verify `lookup_type` parameter is spelled correctly
- Check it's one of the valid types
- Ensure parameter is passed correctly from webhook

### Issue: Translation join returns null

- Verify translations exist for the codes
- Check language_id in translations table
- Ensure English language (code='en') exists

## Performance Tips

1. **Indexes**: Ensure lookup tables have indexes on `code` and `is_active`
2. **Caching**: Consider caching lookup data if it doesn't change often
3. **Connection Pooling**: Use MySQL connection pooling in n8n
4. **Query Optimization**: The queries are already optimized with proper joins

