# n8n Universal Lookup Delete Node Setup Guide

This guide explains how to set up a Code node that handles DELETE operations for all lookup tables dynamically.

## Overview

This single Code node can handle DELETE operations for all lookup/reference data tables. It performs **soft delete** by setting `is_active = false` (the record is not physically removed from the database).

## Node Setup

### Step 1: Add Code Node

1. In your n8n workflow, add a **Code** node
2. Set the language to **JavaScript**
3. Copy the code from `n8n_lookup_delete_node_code.js`
4. Paste it into the Code node

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
const inputData = $('Code Node').item.json;
const mysqlResult = $input.all()[0].json;

// Check if the update was successful (affectedRows > 0)
const affectedRows = mysqlResult.affectedRows || mysqlResult[0]?.affectedRows || 0;

if (affectedRows === 0) {
  return {
    json: {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Item not found or already deleted',
        details: {
          lookup_type: inputData.lookup_type,
          item_id: inputData.item_id
        }
      }
    }
  };
}

return {
  json: {
    success: true,
    data: {
      success: true
    },
    lookup_type: inputData.lookup_type,
    item_id: inputData.item_id
  }
};
```

## Usage Examples

### Example 1: Delete a Language

**Webhook Request**:
```
DELETE /api/v1/lookups/languages/1
```

**Generated Query**:
1. `UPDATE languages SET is_active = 0 WHERE id = 1`

### Example 2: Delete a Country

**Webhook Request**:
```
DELETE /api/v1/lookups/countries/5
```

**Generated Query**:
1. `UPDATE countries SET is_active = 0 WHERE id = 5`

### Example 3: Delete an Object Type

**Webhook Request**:
```
DELETE /api/v1/lookups/object-types/3
```

**Generated Query**:
1. `UPDATE object_types SET is_active = 0 WHERE id = 3`

## Response Format

The Code node returns:

```json
{
  "query": "UPDATE languages SET is_active = 0 WHERE id = 1",
  "lookup_type": "languages",
  "table_name": "languages",
  "item_id": 1,
  "operation": "soft_delete",
  "description": "Soft delete languages record with id 1 (set is_active = false)",
  "metadata": {
    "note": "This is a soft delete. The record is not physically removed from the database.",
    "translations_note": "Related translations remain in the database and are not deleted."
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
    "message": "Item ID is required for delete operation"
  }
}
```

### Invalid ID
```json
{
  "success": false,
  "error": {
    "code": "INVALID_ID",
    "message": "Item ID must be a valid integer"
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

## Soft Delete Behavior

**Important**: This operation performs a **soft delete**, not a physical delete:

- The record remains in the database
- Only `is_active` is set to `false`
- Related translations are **not deleted** and remain in the database
- The item will no longer appear in active queries (which filter by `is_active = 1`)
- The item can be restored by updating `is_active` back to `true`

## Security Notes

- All user input is validated
- Integer IDs are validated and parsed
- SQL injection protection through parameter validation

## Best Practices

1. **Check affected rows** - Verify the delete was successful
2. **Handle not found cases** - Return appropriate error if item doesn't exist
3. **Consider cascading** - Be aware that soft-deleted items may still be referenced
4. **Audit trail** - Consider logging delete operations for audit purposes

## Troubleshooting

### Delete not working
- Check that the ID is valid and exists in the database
- Verify the MySQL node is using `{{ $json.query }}`
- Check that the item is not already soft-deleted

### Item still appearing
- Verify the query filters by `is_active = 1` when retrieving items
- Check that the UPDATE query executed successfully
- Confirm `affectedRows > 0` in the MySQL result

## Related Documentation

- [n8n Lookup Node Setup](./n8n_lookup_node_setup.md) - For GET operations
- [n8n Lookup Create Node Setup](./n8n_lookup_create_node_setup.md) - For CREATE operations
- [n8n Lookup Update Node Setup](./n8n_lookup_update_node_setup.md) - For UPDATE operations
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - Full API documentation
- [How-To: Update and Delete Lookups](./HOW_TO_UPDATE_DELETE_LOOKUPS.md) - API usage guide

