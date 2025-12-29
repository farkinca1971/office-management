# n8n Universal Lookup Update Node - Setup Guide

This guide explains how to set up and use the universal dynamic SQL code node for updating all lookup tables.

## Overview

The universal lookup update node handles UPDATE operations for all lookup/reference data tables using a dynamic SQL approach. It works with the new request body format that includes old/new value pairs.

## Request Body Format

The node expects the following request body format:

```json
{
  "update_all_languages": 0,
  "old_code": "original_code",
  "new_code": "new_code",
  "old_is_active": true,
  "new_is_active": true,
  "old_object_type_id": 0,
  "new_object_type_id": 0,
  "old_text": "Original translation",
  "new_text": "New translation",
  "language_id": 1
}
```

## Features

- **Dynamic Field Detection**: Compares old vs new values to determine what actually changed
- **Universal Support**: Works with all lookup table types
- **Code Change Handling**: Automatically updates translation references when code changes
- **Multi-language Support**: Updates translations for all languages (en, de, hu) when `update_all_languages=1`
- **Object Type ID Support**: Handles `object_type_id` for tables that support it (`object_statuses`, `object_relation_types`)

## Setup Instructions

### 1. Create n8n Workflow

1. Create a new workflow in n8n
2. Add a **Webhook** node
3. Configure the webhook:
   - **HTTP Method**: `PUT`
   - **Path**: `/api/v1/lookups/:lookup_type/:id`
   - **Response Mode**: "Using 'Respond to Webhook' Node"

### 2. Add Code Node

1. Add a **Code** node after the Webhook node
2. Set **Language** to `JavaScript`
3. Copy the entire contents of `n8n_lookup_update_universal_node_code.js`
4. Paste into the Code node

### 3. Add MySQL Node(s)

1. Add a **MySQL** node after the Code node
2. Configure your MySQL connection
3. Set **Operation** to "Execute Query"
4. In the **Query** field, use: `{{ $json.execute_all }}`

   **OR** for step-by-step execution:
   - Use **Split in Batches** node to process queries one by one
   - Use `{{ $json.query_list[0].query }}` for each query

### 4. Add Response Node

1. Add a **Respond to Webhook** node
2. Configure response:
   ```json
   {
     "success": true,
     "data": {
       "id": {{ $json.item_id }},
       "lookup_type": "{{ $json.lookup_type }}",
       "queries_executed": {{ $json.metadata.total_queries }}
     }
   }
   ```

## Query Execution Order

The node returns queries in the correct execution order:

1. **Translation Code Updates** (if code changed)
   - Updates all translation references to use the new code

2. **Lookup Table Update**
   - Updates `code`, `is_active`, and/or `object_type_id` in the lookup table

3. **Translation Updates**
   - If `update_all_languages=1`: Updates translations for all languages (en, de, hu)
   - If `update_all_languages=0`: Updates translation for current language only

## Output Format

The node returns a JSON object with the following structure:

```json
{
  "queries": [
    {
      "query": "UPDATE translations...",
      "type": "translation_code_update",
      "description": "Update all translation references..."
    },
    {
      "query": "UPDATE object_statuses SET...",
      "type": "lookup_update",
      "description": "Update object_statuses record..."
    }
  ],
  "lookup_type": "object_statuses",
  "table_name": "object_statuses",
  "item_id": 5,
  "changes": {
    "code_changed": true,
    "is_active_changed": false,
    "object_type_id_changed": true,
    "text_changed": true,
    "update_all_languages": false
  },
  "old_values": {
    "code": "active",
    "is_active": true,
    "object_type_id": 1,
    "text": "Active"
  },
  "new_values": {
    "code": "active_status",
    "is_active": true,
    "object_type_id": 2,
    "text": "Active Status"
  },
  "query": null,
  "execute_all": "UPDATE translations...;\nUPDATE object_statuses...;\nINSERT INTO translations...",
  "query_list": [
    {
      "step": 1,
      "query": "UPDATE translations...",
      "type": "translation_code_update",
      "description": "..."
    }
  ],
  "metadata": {
    "total_queries": 3,
    "lookup_queries": 1,
    "translation_queries": 2,
    "supports_object_type_id": true
  }
}
```

## Supported Lookup Types

The node supports all lookup table types:

- `languages`
- `object-types` → `object_types`
- `object-statuses` → `object_statuses` (supports `object_type_id`)
- `sexes`
- `salutations`
- `product-categories` → `product_categories`
- `countries`
- `address-types` → `address_types`
- `address-area-types` → `address_area_types`
- `contact-types` → `contact_types`
- `transaction-types` → `transaction_types`
- `currencies`
- `object-relation-types` → `object_relation_types` (supports `object_type_id`)

## Error Handling

The node returns error objects for:

- **INVALID_LOOKUP_TYPE**: Lookup type not in the supported list
- **MISSING_ID**: Item ID not provided
- **INVALID_ID**: Item ID is not a valid integer
- **NO_CHANGES**: All old and new values are the same
- **INVALID_OBJECT_TYPE_ID**: `new_object_type_id` is not a valid integer
- **INVALID_LANGUAGE_ID**: `language_id` is not a valid integer

## Example Workflow

```
Webhook (PUT /api/v1/lookups/:lookup_type/:id)
  ↓
Code Node (Universal Update Logic)
  ↓
MySQL Node (Execute Query: {{ $json.execute_all }})
  ↓
Respond to Webhook (Success Response)
```

## Example Request

```http
PUT /api/v1/lookups/object-statuses/5
Content-Type: application/json

{
  "update_all_languages": 0,
  "old_code": "active",
  "new_code": "active_status",
  "old_is_active": true,
  "new_is_active": true,
  "old_object_type_id": 1,
  "new_object_type_id": 2,
  "old_text": "Active",
  "new_text": "Active Status",
  "language_id": 1
}
```

## Example Generated Queries

For the above request, the node generates:

1. **Update translation codes**:
   ```sql
   UPDATE translations t
   INNER JOIN object_statuses lt ON t.code = lt.code
   SET t.code = 'active_status'
   WHERE lt.id = 5 AND t.code = 'active'
   ```

2. **Update lookup table**:
   ```sql
   UPDATE object_statuses 
   SET code = 'active_status', object_type_id = 2 
   WHERE id = 5
   ```

3. **Update translation**:
   ```sql
   INSERT INTO translations (code, language_id, text)
   VALUES ('active_status', 1, 'Active Status')
   ON DUPLICATE KEY UPDATE text = 'Active Status'
   ```

## Notes

- The node automatically handles SQL injection prevention by escaping single quotes
- Boolean values are converted to integers (0 or 1) for MySQL
- If `update_all_languages=1`, translations are updated for en, de, and hu languages
- If code changes, all existing translation references are updated first
- Only fields that actually changed are included in the UPDATE query

## Testing

Test the node with different scenarios:

1. **Code change only**: Change code, keep everything else the same
2. **Translation change only**: Change text, keep code and other fields the same
3. **Multiple field changes**: Change code, is_active, and text simultaneously
4. **Update all languages**: Set `update_all_languages=1` to update all language translations
5. **Object type change**: Change `object_type_id` for `object_statuses` or `object_relation_types`

