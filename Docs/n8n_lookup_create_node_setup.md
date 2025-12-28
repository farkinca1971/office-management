# n8n Universal Lookup Create Node Setup Guide

This guide explains how to set up a Code node that handles CREATE operations for all lookup tables dynamically, including translation support.

## Overview

This single Code node can handle CREATE operations for all lookup/reference data tables. It supports:
- **Validation**: Checks if code already exists in lookup table or translations table before inserting
- Creating lookup items with required `code` field
- Creating translations in the same operation
- Support for all lookup table types
- Special handling for `object_statuses` (requires `object_type_id`)

## Node Setup

### Step 1: Add Code Node

1. In your n8n workflow, add a **Code** node
2. Set the language to **JavaScript**
3. Copy the code from `n8n_lookup_create_node_code.js`
4. Paste it into the Code node

### Step 2: Validation Workflow (Required)

The CREATE node now includes validation to prevent duplicate codes. You need to set up a validation workflow:

1. **Add MySQL Node for Validation**:
   - Add a **MySQL** node after the CREATE Code node
   - Configure your MySQL connection
   - **Operation**: Execute Query
   - **Query**: Use expression `{{ $json.execute_validation }}`
   - This executes the validation queries to check if code exists

2. **Add Validation Checker Code Node**:
   - Add a **Code** node after the validation MySQL node
   - Set language to **JavaScript**
   - Copy the code from `n8n_lookup_create_validation_node_code.js`
   - Paste it into the Code node
   - This node checks the validation results and returns an error if duplicates are found

3. **Add MySQL Node for Inserts** (only if validation passes):
   - Add a **MySQL** node after the validation checker Code node
   - Configure your MySQL connection
   - **Operation**: Execute Query
   - **Query**: Use expression `{{ $('Code Node (CREATE)').item.json.execute_inserts }}`
   - This executes the insert queries only if validation passed

**Workflow Structure**:
```
Webhook → Code Node (CREATE) → MySQL Node (Validation) → Code Node (Validation Check) → MySQL Node (Insert) → Response Formatter
```

**Alternative: Single MySQL Node (Not Recommended - No Validation)**

If you want to skip validation (not recommended):

1. Add a **MySQL** node after the Code node
2. Configure your MySQL connection
3. In the MySQL node settings:
   - **Operation**: Execute Query
   - **Query**: Use expression `{{ $json.execute_all }}`
   - **Note**: This executes all queries including validation, but doesn't check results

### Step 3: Format Response

Add another Code node after the "Inserts" MySQL node to format the response:

**Option 1: Use the provided format response code** (Recommended)

1. Add a **Code** node after the "Inserts" MySQL node
2. Set language to **JavaScript**
3. Copy the code from `n8n_lookup_create_format_response_node_code.js`
4. Paste it into the Code node

**Option 2: Manual format response code**

```javascript
// Format response for API
// Get MySQL result from previous node (Inserts)
const mysqlResult = $input.all()[0].json;

// Get original data from "create queries" node
const originalData = $('create queries').item.json;

// Extract the lookup table insert ID
// When executing multiple queries, MySQL returns results for each query
// The lookup table insert is the last INSERT query (after translation inserts)
let insertedId = null;

if (mysqlResult.insertId) {
  insertedId = mysqlResult.insertId;
} else if (mysqlResult[0]?.insertId) {
  insertedId = mysqlResult[0].insertId;
} else if (Array.isArray(mysqlResult) && mysqlResult.length > 0) {
  // If multiple results, get the last one (which should be the lookup table insert)
  const lastResult = mysqlResult[mysqlResult.length - 1];
  insertedId = lastResult.insertId || lastResult[0]?.insertId;
}

// Build response data
const responseData = {
  id: insertedId,
  code: originalData.code,
  is_active: originalData.create_fields.is_active
};

// Add translation info if translation was created
if (originalData.has_translation && originalData.create_fields.text) {
  responseData.translation = {
    text: originalData.create_fields.text,
    language_id: originalData.create_fields.language_id || null,
    language_code: originalData.language_code
  };
}

// Add object_type_id if this is an object_status
if (originalData.create_fields.object_type_id) {
  responseData.object_type_id = originalData.create_fields.object_type_id;
}

// Return formatted response
return {
  json: {
    success: true,
    data: responseData,
    lookup_type: originalData.lookup_type,
    table_name: originalData.table_name
  }
};
```

## Usage Examples

### Example 1: Create Language Without Translation

**Webhook Request**:
```
POST /api/v1/lookups/languages
```

**Request Body**:
```json
{
  "code": "fr",
  "is_active": true
}
```

**Generated Queries** (in order):
1. `SELECT COUNT(*) as count FROM languages WHERE code = 'fr'` (validation - lookup table)
2. `SELECT COUNT(*) as count FROM translations WHERE code = 'fr'` (validation - translations table)
3. `INSERT INTO languages (code, is_active) VALUES ('fr', 1)` (insert - only if validation passes)

### Example 2: Create Language With Translation

**Webhook Request**:
```
POST /api/v1/lookups/languages
```

**Request Body**:
```json
{
  "code": "fr",
  "is_active": true,
  "text": "French",
  "language_id": 1
}
```

**Generated Queries** (in order):
1. `SELECT COUNT(*) as count FROM languages WHERE code = 'fr'` (validation - lookup table)
2. `SELECT COUNT(*) as count FROM translations WHERE code = 'fr'` (validation - translations table)
3. `INSERT INTO translations (code, language_id, text) VALUES ('fr', 1, 'French') ON DUPLICATE KEY UPDATE text = 'French'` (insert translation FIRST)
4. `INSERT INTO languages (code, is_active) VALUES ('fr', 1)` (insert lookup table AFTER translation)
   - Note: Languages table doesn't have foreign key to translations, but order is consistent

### Example 3: Create Object Status With Translation

**Webhook Request**:
```
POST /api/v1/lookups/object-statuses
```

**Request Body**:
```json
{
  "code": "ACTIVE",
  "is_active": true,
  "object_type_id": 1,
  "text": "Active",
  "language_id": 1
}
```

**Generated Queries** (in order):
1. `SELECT COUNT(*) as count FROM object_statuses WHERE code = 'ACTIVE'` (validation - lookup table)
2. `SELECT COUNT(*) as count FROM translations WHERE code = 'ACTIVE'` (validation - translations table)
3. `INSERT INTO translations (code, language_id, text) VALUES ('ACTIVE', 1, 'Active') ON DUPLICATE KEY UPDATE text = 'Active'` (insert translation FIRST - required due to foreign key)
4. `INSERT INTO object_statuses (code, is_active, object_type_id) VALUES ('ACTIVE', 1, 1)` (insert lookup table AFTER translation - foreign key constraint requires translation to exist first)

### Example 4: Create With Language Code (No language_id)

**Webhook Request**:
```
POST /api/v1/lookups/countries
```

**Request Body**:
```json
{
  "code": "US",
  "is_active": true,
  "text": "United States"
}
```

**Query Parameters**:
```
?language_code=en
```

**Generated Queries** (in order):
1. `INSERT INTO countries (code, is_active) VALUES ('US', 1)`
2. `INSERT INTO translations (code, language_id, text) SELECT 'US', l.id, 'United States' FROM languages l WHERE l.code = 'en' ON DUPLICATE KEY UPDATE text = 'United States'`

### Example 5: Create Currency With Translation

**Webhook Request**:
```
POST /api/v1/lookups/currencies
```

**Request Body**:
```json
{
  "code": "EUR",
  "is_active": true,
  "text": "Euro",
  "language_id": 1
}
```

**Generated Queries** (in order):
1. `SELECT COUNT(*) as count FROM currencies WHERE code = 'EUR'` (validation - lookup table)
2. `SELECT COUNT(*) as count FROM translations WHERE code = 'EUR'` (validation - translations table)
3. `INSERT INTO translations (code, language_id, text) VALUES ('EUR', 1, 'Euro') ON DUPLICATE KEY UPDATE text = 'Euro'` (insert translation FIRST)
4. `INSERT INTO currencies (code, is_active) VALUES ('EUR', 1)` (insert lookup table AFTER translation)

## Query Execution Order

The node ensures queries are executed in the correct order:

1. **Validation Queries** (execute first)
   - Checks if code exists in lookup table
   - Checks if code exists in translations table
   - Must be validated before proceeding

2. **Translation Insert/Update** (only if validation passes) - **EXECUTED FIRST**
   - Creates or updates the translation entry
   - **MUST be inserted before lookup table** due to foreign key constraint
   - Foreign key: `lookup_tables.code` → `translations.code`

3. **Lookup Table Insert** (only if validation passes) - **EXECUTED AFTER TRANSLATION**
   - Inserts the main lookup table record
   - Returns the auto-generated ID
   - Requires translation to exist first (foreign key constraint)

**Important**: The translation must be inserted BEFORE the lookup table record because lookup tables have a foreign key constraint that references `translations.code`. If you try to insert the lookup record first, you'll get a foreign key constraint error.

## Validation and Error Handling

### Duplicate Code Detection

The CREATE node now includes validation to prevent duplicate codes:

- **Lookup Table Check**: Verifies code doesn't exist in the target lookup table
- **Translations Table Check**: Verifies code doesn't exist in the translations table
- **Error Response**: Returns `DUPLICATE_CODE` error if code already exists

### Validation Workflow

1. **Execute Validation Queries**:
   ```sql
   SELECT COUNT(*) as count FROM {table_name} WHERE code = '{code}'
   SELECT COUNT(*) as count FROM translations WHERE code = '{code}'
   ```

2. **Check Results** (use `n8n_lookup_create_validation_node_code.js`):
   - If count > 0 in lookup table → Return error: "Code already exists in the lookup table"
   - If count > 0 in translations table → Return error: "Code already exists in the translations table"
   - If both counts = 0 → Proceed with insert

3. **Error Response Format**:
   ```json
   {
     "success": false,
     "error": {
       "code": "DUPLICATE_CODE",
       "message": "Code already exists in the lookup table",
       "details": {
         "code": "existing_code",
         "lookup_table_count": 1,
         "translations_table_count": 0
       }
     }
   }
   ```

## Response Format

The Code node returns:

```json
{
  "queries": [
    {
      "query": "INSERT INTO languages (code, is_active) VALUES ('fr', 1)",
      "type": "lookup_insert",
      "description": "Insert languages record with code 'fr'"
    },
    {
      "query": "INSERT INTO translations...",
      "type": "translation_insert",
      "description": "Create/update translation for languages with language_id 1"
    }
  ],
  "lookup_type": "languages",
  "table_name": "languages",
  "code": "fr",
  "create_fields": {
    "code": "fr",
    "is_active": true,
    "text": "French",
    "language_id": 1,
    "object_type_id": null
  },
  "has_translation": true,
  "language_code": "en",
  "query": null,
  "execute_all": "INSERT INTO languages (code, is_active) VALUES ('fr', 1);\nINSERT INTO translations...",
  "validation_queries": [
    {
      "query": "SELECT COUNT(*) as count FROM languages WHERE code = 'fr'",
      "type": "validation_lookup_check",
      "description": "Check if code 'fr' already exists in languages table"
    },
    {
      "query": "SELECT COUNT(*) as count FROM translations WHERE code = 'fr'",
      "type": "validation_translation_check",
      "description": "Check if code 'fr' already exists in translations table"
    }
  ],
  "insert_queries": [...],
  "execute_validation": "SELECT COUNT(*) as count FROM languages WHERE code = 'fr';\nSELECT COUNT(*) as count FROM translations WHERE code = 'fr'",
  "execute_inserts": "INSERT INTO languages (code, is_active) VALUES ('fr', 1);\nINSERT INTO translations...",
  "metadata": {
    "total_queries": 4,
    "validation_queries": 2,
    "lookup_queries": 1,
    "translation_queries": 1,
    "validation_note": "Execute validation queries first and check results before executing insert queries"
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

### Missing Code
```json
{
  "success": false,
  "error": {
    "code": "MISSING_CODE",
    "message": "Code is required and must be a non-empty string",
    "details": {
      "provided": null
    }
  }
}
```

### Missing object_type_id for object_statuses
```json
{
  "success": false,
  "error": {
    "code": "MISSING_OBJECT_TYPE_ID",
    "message": "object_type_id is required for object_statuses",
    "details": {
      "provided": null
    }
  }
}
```

### Invalid language_id
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LANGUAGE_ID",
    "message": "language_id must be a valid integer",
    "details": {
      "provided": "invalid"
    }
  }
}
```

## Supported Lookup Types

All standard lookup types are supported:
- `languages`
- `object-types` (or `object_types`)
- `object-statuses` (or `object_statuses`) - **requires `object_type_id`**
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

## Special Cases

### object_statuses

The `object_statuses` table requires an `object_type_id` field. This must be provided in the request body:

```json
{
  "code": "ACTIVE",
  "is_active": true,
  "object_type_id": 1,
  "text": "Active",
  "language_id": 1
}
```

## Translation Handling

### With language_id
If `language_id` is provided with `text`, the translation is created/updated for that specific language.

### Without language_id
If only `text` is provided, the system uses the `language_code` from:
1. Query parameter `language_code`
2. Request body `language_code`
3. Header `accept-language`
4. Default: `'en'`

The language code is then resolved to a `language_id` in the SQL query using a subquery.

## Security Notes

- All user input is escaped to prevent SQL injection
- Single quotes in strings are properly escaped
- Integer IDs are validated and parsed
- Boolean values are normalized to 0/1
- Code field is required and validated

## Best Practices

1. **Always provide code** - It's required for all lookup items
2. **Use transactions** when executing multiple queries
3. **Handle errors** from the MySQL node appropriately
4. **Get the insert ID** from MySQL result to return in API response
5. **Test with different lookup types** to ensure compatibility
6. **For object_statuses**, always provide `object_type_id`

## Getting the Inserted ID

After executing the INSERT query, MySQL returns the auto-generated ID. Access it in your response formatter:

```javascript
// In response formatter node
const mysqlResult = $input.all()[0].json;
const insertedId = mysqlResult.insertId || mysqlResult[0]?.insertId;

return {
  json: {
    success: true,
    data: {
      id: insertedId,
      // ... other fields
    }
  }
};
```

## Troubleshooting

### Code already exists error
- Check for duplicate codes in the database
- Ensure code uniqueness constraint is enforced
- Handle duplicate key errors gracefully

### Translation not creating
- Ensure `text` is provided and not empty
- Verify `language_id` is valid or `language_code` exists
- Check that the lookup item was created successfully first

### object_statuses creation failing
- Verify `object_type_id` is provided
- Ensure the `object_type_id` exists in the `object_types` table
- Check foreign key constraints

### Query not executing
- Check that the MySQL node is using the correct query field (`$json.query` or `$json.execute_all`)
- Verify the query count matches your expectations (`$json.metadata.total_queries`)
- Ensure MySQL connection is properly configured

## Related Documentation

- [n8n Lookup Node Setup](./n8n_lookup_node_setup.md) - For GET operations
- [n8n Lookup Update Node Setup](./n8n_lookup_update_node_setup.md) - For UPDATE operations
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - Full API documentation
- [How-To: Update and Delete Lookups](./HOW_TO_UPDATE_DELETE_LOOKUPS.md) - API usage guide

