# Language Parameter Usage Guide

## Problem Fixed

The previous code was hardcoded to always use English (`'en'`) for translations. Now it supports dynamic language selection via `language_id` or `language_code` parameters.

## How to Use Language Parameters

### Option 1: Using `language_id` (Recommended)

Pass the language ID directly:

**Webhook URL with Query Parameter**:
```
GET /api/v1/sexes?language_id=2
```

**Or in Webhook Body**:
```json
{
  "lookup_type": "sexes",
  "language_id": 2
}
```

### Option 2: Using `language_code`

Pass the language code (e.g., 'de', 'hu', 'en'):

**Webhook URL with Query Parameter**:
```
GET /api/v1/sexes?language_code=de
```

**Or in Webhook Body**:
```json
{
  "lookup_type": "sexes",
  "language_code": "de"
}
```

## Priority Order

The code uses this priority:
1. `language_id` (if provided) - uses the ID directly
2. `language_code` (if provided) - looks up the language by code
3. Default: `'en'` (English) - if neither is provided

## Example: Getting Sexes in German

**Request**:
```
GET /api/v1/sexes?language_code=de
```

**Response** (will return German translations):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "male",
      "is_active": true,
      "name": "Männlich"  // German translation
    },
    {
      "id": 2,
      "code": "female",
      "is_active": true,
      "name": "Weiblich"  // German translation
    }
  ]
}
```

## Finding Language IDs

To find language IDs, first query languages:

```
GET /api/v1/languages
```

Response:
```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "en", "is_active": true },
    { "id": 2, "code": "de", "is_active": true },
    { "id": 3, "code": "hu", "is_active": true }
  ]
}
```

Then use the ID:
```
GET /api/v1/sexes?language_id=2  // German
GET /api/v1/sexes?language_id=3  // Hungarian
```

## Updating Your Workflow

### Step 1: Extract Parameters from Webhook

Add a Code node after your Webhook node to extract parameters:

```javascript
// Extract lookup_type from path and query parameters
const path = $input.all()[0].json.path || '';
const query = $input.all()[0].json.query || {};

// Extract lookup_type from path (e.g., /api/v1/sexes -> sexes)
const pathParts = path.split('/').filter(p => p);
const lookupType = pathParts[pathParts.length - 1] || query.lookup_type;

return {
  json: {
    lookup_type: lookupType,
    language_id: query.language_id || null,
    language_code: query.language_code || null,
    object_type_id: query.object_type_id || null,
    code: query.code || null
  }
};
```

### Step 2: Use the Updated Code Node

The updated code in `n8n_lookup_node_code.js` now supports:
- `language_id`: Direct language ID
- `language_code`: Language code (e.g., 'en', 'de', 'hu')

### Step 3: Test

Test with different languages:

```bash
# English (default)
curl "http://localhost:5678/api/v1/sexes"

# German
curl "http://localhost:5678/api/v1/sexes?language_code=de"

# Hungarian
curl "http://localhost:5678/api/v1/sexes?language_code=hu"

# Using language_id
curl "http://localhost:5678/api/v1/sexes?language_id=2"
```

## Supported Lookup Types with Translations

These lookup types support language parameters:
- `object_types`
- `object_statuses`
- `sexes`
- `salutations`
- `product_categories`
- `address_types`
- `address_area_types`
- `contact_types`
- `transaction_types`
- `currencies`
- `object_relation_types`

Note: `languages` and `countries` don't use translations (they have their own name fields).

## Troubleshooting

### Issue: Still getting English translations

1. **Check parameter name**: Use `language_id` or `language_code` (not `language`)
2. **Check parameter extraction**: Verify the Code node extracts query parameters correctly
3. **Check language exists**: Ensure the language exists in the `languages` table
4. **Check translations exist**: Verify translations exist for that language

### Issue: Getting NULL for name field

This means no translation exists for that language. The query uses `LEFT JOIN`, so it will return NULL if:
- The translation doesn't exist for that language
- The language_id is invalid

### Debug: Check what language is being used

Add a debug node after the Code node to see what parameters are being passed:

```javascript
return {
  json: {
    debug: {
      lookup_type: $json.lookup_type,
      language_id: $json.parameters.language_id,
      language_code: $json.parameters.language_code
    },
    ...$json
  }
};
```

## Complete Workflow Example

```
Webhook (GET /api/v1/sexes?language_code=de)
  ↓
Code Node (Extract Parameters)
  ↓
Code Node (Dynamic Lookup Handler) - Updated code
  ↓
MySQL Node (Execute Query)
  ↓
Aggregate Node
  ↓
Code Node (Format Response)
  ↓
Respond to Webhook
```

The key is ensuring the `language_id` or `language_code` parameter flows through all nodes correctly.

