# n8n Universal Lookup Update Node Setup Guide

This guide explains how to set up a Code node that handles UPDATE operations for all lookup tables dynamically, including translation support.

## Overview

This single Code node can handle UPDATE operations for all lookup/reference data tables. It supports:
- Updating lookup item fields (`code`, `is_active`)
- Updating/creating translations in a single operation
- Automatic handling of code changes (updates all related translations)
- Support for all lookup table types

## Node Setup

### Step 1: Add Code Node

1. In your n8n workflow, add a **Code** node
2. Set the language to **JavaScript**
3. Copy the code from `n8n_lookup_update_node_code.js`
4. Paste it into the Code node

### Step 2: Connect MySQL Node(s)

You have two options for executing the queries:

#### Option A: Single MySQL Node (for simple cases)

If you only have one query to execute:

1. Add a **MySQL** node after the Code node
2. Configure your MySQL connection
3. In the MySQL node settings:
   - **Operation**: Execute Query
   - **Query**: Use expression `{{ $json.query }}`
   - **Note**: This only works if there's exactly one query

#### Option B: Multiple MySQL Nodes (for complex updates)

For updates that involve both lookup table and translation changes:

1. Add a **Switch** node after the Code node
2. Configure it to route based on query type
3. Add separate MySQL nodes for each query type
4. Or use a **Loop** node to execute all queries sequentially

#### Option C: Execute All Queries (Recommended)

1. Add a **MySQL** node after the Code node
2. Configure your MySQL connection
3. In the MySQL node settings:
   - **Operation**: Execute Query
   - **Query**: Use expression `{{ $json.execute_all }}`
   - **Note**: This executes all queries separated by semicolons

### Step 3: Format Response

Add another Code node after MySQL to format the response:

```javascript
// Format response for API
const inputData = $('Code Node').item.json;
const mysqlResult = $input.all()[0].json;

return {
  json: {
    success: true,
    data: {
      success: true
    },
    lookup_type: inputData.lookup_type,
    item_id: inputData.item_id,
    updated_fields: inputData.update_fields
  }
};
```

## Usage Examples

### Example 1: Update Code Only

**Webhook Request**:
```
PUT /api/v1/lookups/languages/1
```

**Request Body**:
```json
{
  "code": "en_US"
}
```

**Generated Queries**:
1. `UPDATE languages SET code = 'en_US' WHERE id = 1`
2. `UPDATE translations t INNER JOIN languages lt ON t.code = lt.code SET t.code = 'en_US' WHERE lt.id = 1 AND t.code != 'en_US'`

### Example 2: Update Active Status Only

**Webhook Request**:
```
PUT /api/v1/lookups/countries/5
```

**Request Body**:
```json
{
  "is_active": false
}
```

**Generated Query**:
1. `UPDATE countries SET is_active = 0 WHERE id = 5`

### Example 3: Update Translation Only

**Webhook Request**:
```
PUT /api/v1/lookups/languages/1
```

**Request Body**:
```json
{
  "text": "English (United States)",
  "language_id": 1
}
```

**Generated Query**:
1. `INSERT INTO translations (code, language_id, text) VALUES ((SELECT code FROM languages WHERE id = 1), 1, 'English (United States)') ON DUPLICATE KEY UPDATE text = 'English (United States)'`

### Example 4: Update Code and Translation Together

**Webhook Request**:
```
PUT /api/v1/lookups/object-types/2
```

**Request Body**:
```json
{
  "code": "company_v2",
  "text": "Company (Updated)",
  "language_id": 1
}
```

**Generated Queries** (in order):
1. `UPDATE translations t INNER JOIN object_types lt ON t.code = lt.code SET t.code = 'company_v2' WHERE lt.id = 2 AND t.code != 'company_v2'`
2. `UPDATE object_types SET code = 'company_v2' WHERE id = 2`
3. `INSERT INTO translations (code, language_id, text) VALUES ('company_v2', 1, 'Company (Updated)') ON DUPLICATE KEY UPDATE text = 'Company (Updated)'`

### Example 5: Update Multiple Fields

**Webhook Request**:
```
PUT /api/v1/lookups/sexes/3
```

**Request Body**:
```json
{
  "code": "other",
  "is_active": true,
  "text": "Other",
  "language_id": 1
}
```

**Generated Queries** (in order):
1. `UPDATE translations t INNER JOIN sexes lt ON t.code = lt.code SET t.code = 'other' WHERE lt.id = 3 AND t.code != 'other'`
2. `UPDATE sexes SET code = 'other', is_active = 1 WHERE id = 3`
3. `INSERT INTO translations (code, language_id, text) VALUES ('other', 1, 'Other') ON DUPLICATE KEY UPDATE text = 'Other'`

## Query Execution Order

The node ensures queries are executed in the correct order:

1. **Translation Code Updates** (if code is being changed)
   - Updates all existing translations to use the new code
   - Must happen before the lookup table update

2. **Lookup Table Update**
   - Updates the main lookup table record

3. **Translation Insert/Update**
   - Creates or updates the specific translation

## Response Format

The Code node returns:

```json
{
  "queries": [
    {
      "query": "UPDATE languages SET code = 'en_US' WHERE id = 1",
      "type": "lookup_update",
      "description": "Update languages record with id 1"
    },
    {
      "query": "INSERT INTO translations...",
      "type": "translation_update",
      "description": "Update/create translation for languages"
    }
  ],
  "lookup_type": "languages",
  "table_name": "languages",
  "item_id": 1,
  "update_fields": {
    "code": "en_US",
    "is_active": null,
    "text": "English (United States)",
    "language_id": 1
  },
  "has_lookup_update": true,
  "has_translation_update": true,
  "language_code": "en",
  "query": null,
  "execute_all": "UPDATE languages SET code = 'en_US' WHERE id = 1;\nINSERT INTO translations...",
  "metadata": {
    "total_queries": 2,
    "lookup_queries": 1,
    "translation_queries": 1
  }
}
```

## Error Handling

The node validates input and returns structured errors:

### Invalid Lookup Type
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LOOKUP_TYPE",
    "message": "Invalid lookup_type. Must be one of: languages, object_types, ...",
    "details": {
      "provided": "invalid_type",
      "valid_types": [...]
    }
  }
}
```

### Missing ID
```json
{
  "success": false,
  "error": {
    "code": "MISSING_ID",
    "message": "Item ID is required for update operation"
  }
}
```

### No Update Fields
```json
{
  "success": false,
  "error": {
    "code": "NO_UPDATE_FIELDS",
    "message": "No fields provided for update. At least one of: code, is_active, text must be provided."
  }
}
```

## Supported Lookup Types

All standard lookup types are supported:
- `languages`
- `object-types` (or `object_types`)
- `object-statuses` (or `object_statuses`)
- `sexes`
- `salutations`
- `product-categories` (or `product_categories`)
- `countries`
- `address-types` (or `address_types`)
- `address-area-types` (or `address_area_types`)
- `contact-types` (or `contact_types`)
- `transaction-types` (or `transaction_types`)
- `currencies`
- `object-relation-types` (or `object_relation_types`)

**Note**: Hyphens in lookup types are automatically converted to underscores for database table names.

## Translation Handling

### With language_id
If `language_id` is provided with `text`, the translation is created/updated for that specific language.

### Without language_id
If only `text` is provided, the system uses the `language_code` from:
1. Query parameter `language_code`
2. Request body `language_code`
3. Header `accept-language`
4. Default: `'en'`

The language code is then resolved to a `language_id` in the SQL query.

## Security Notes

- All user input is escaped to prevent SQL injection
- Single quotes in strings are properly escaped
- Integer IDs are validated and parsed
- Boolean values are normalized to 0/1

## Best Practices

1. **Always validate input** before calling this node
2. **Use transactions** when executing multiple queries
3. **Handle errors** from the MySQL node appropriately
4. **Test with different lookup types** to ensure compatibility
5. **Monitor query execution** for performance

## Troubleshooting

### Query not executing
- Check that the MySQL node is using the correct query field (`$json.query` or `$json.execute_all`)
- Verify the query count matches your expectations (`$json.metadata.total_queries`)

### Translation not updating
- Ensure `text` and either `language_id` or `language_code` are provided
- Check that the translation code matches the lookup item code

### Code update not working
- Verify the lookup table update happens before translation code updates
- Check that foreign key constraints allow the code change

## Related Documentation

- [n8n Lookup Node Setup](./n8n_lookup_node_setup.md) - For GET operations
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - Full API documentation
- [How-To: Update and Delete Lookups](./HOW_TO_UPDATE_DELETE_LOOKUPS.md) - API usage guide

