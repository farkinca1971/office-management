# How to Select One Language with Translation

This guide explains how to retrieve lookup data with translations for a specific language.

## Overview

The lookup GET endpoint supports language selection through query parameters. You can specify which language's translation to retrieve using either:
- `language_code` (e.g., `en`, `hu`, `de`)
- `language_id` (e.g., `1`, `2`, `3`)

## Language Selection Priority

The system uses the following priority order:
1. **`language_id`** (if provided) - Direct language ID
2. **`language_code`** (if provided) - Language code (e.g., 'hu', 'en')
3. **Default: `'en'`** - English if no language specified

## Usage Examples

### Example 1: Using Language Code (Recommended)

**Request**:
```
GET /api/v1/lookups/object-types?language_code=hu
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "person",
      "is_active": true,
      "name": "Személy"
    },
    {
      "id": 2,
      "code": "company",
      "is_active": true,
      "name": "Cég"
    }
  ]
}
```

**cURL**:
```bash
curl -X GET "https://your-n8n-instance.com/api/v1/lookups/object-types?language_code=hu" \
  -H "Authorization: Bearer your-token"
```

### Example 2: Using Language ID

**Request**:
```
GET /api/v1/lookups/object-types?language_id=3
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "person",
      "is_active": true,
      "name": "Személy"
    }
  ]
}
```

**cURL**:
```bash
curl -X GET "https://your-n8n-instance.com/api/v1/lookups/object-types?language_id=3" \
  -H "Authorization: Bearer your-token"
```

### Example 3: Multiple Parameters

You can combine language selection with other filters:

**Request**:
```
GET /api/v1/lookups/object-statuses?object_type_id=1&language_code=de
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ACTIVE",
      "is_active": true,
      "object_type_id": 1,
      "name": "Aktiv"
    }
  ]
}
```

## Frontend Usage

### JavaScript/TypeScript

```typescript
import { lookupApi } from '@/lib/api';

// Get object types with Hungarian translations
const response = await lookupApi.getObjectTypes('hu');

if (response.success) {
  console.log(response.data); // Array of items with Hungarian translations
}
```

### React Example

```typescript
import React from 'react';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';

export default function MyComponent() {
  const language = useLanguageStore((state) => state.language); // e.g., 'hu'
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const loadData = async () => {
      const response = await lookupApi.getObjectTypes(language);
      if (response.success) {
        setData(response.data);
      }
    };
    loadData();
  }, [language]);

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>
          {item.name} {/* Shows translation in selected language */}
        </div>
      ))}
    </div>
  );
}
```

## n8n Workflow Usage

### In Webhook Node

The language parameters are automatically extracted from query parameters:

**Webhook Configuration**:
- Path: `/api/v1/lookups/:lookup_type`
- Method: `GET`

**Query Parameters** (automatically available):
- `language_code`: Language code (e.g., `hu`, `en`, `de`)
- `language_id`: Language ID (e.g., `1`, `2`, `3`)

### In Code Node

The lookup GET node automatically handles language selection:

```javascript
// The node extracts language parameters from:
// - inputData.query?.language_code
// - inputData.query?.language_id
// - inputData.headers?.['accept-language'] (fallback)
// - Default: 'en'

// The generated SQL query will join with translations table
// filtered by the selected language
```

## Available Language Codes

Common language codes in the system:
- `en` - English
- `hu` - Hungarian
- `de` - German
- `fr` - French
- `es` - Spanish
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese
- `ar` - Arabic
- `tr` - Turkish
- `pl` - Polish
- `nl` - Dutch
- `sv` - Swedish
- `da` - Danish
- `no` - Norwegian
- `fi` - Finnish
- `el` - Greek

## How It Works Internally

### SQL Query Generation

When you request with `language_code=hu`:

```sql
SELECT 
    ot.id,
    ot.code,
    ot.is_active,
    t.text as name
FROM object_types ot
LEFT JOIN translations t ON t.code = ot.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'hu')
WHERE ot.is_active = 1
ORDER BY ot.code;
```

When you request with `language_id=3`:

```sql
SELECT 
    ot.id,
    ot.code,
    ot.is_active,
    t.text as name
FROM object_types ot
LEFT JOIN translations t ON t.code = ot.code 
    AND t.language_id = 3
WHERE ot.is_active = 1
ORDER BY ot.code;
```

### Fallback Behavior

If a translation doesn't exist for the requested language:
- The `name` field will be `NULL`
- Some lookup types use `COALESCE(t.text, code)` to fallback to the code itself
- Languages and Countries use this fallback behavior

## Special Cases

### 1. Languages Table

The languages table uses a special join because language codes themselves are translation codes:

```sql
SELECT 
    l.id,
    l.code,
    l.is_active,
    COALESCE(t.text, UPPER(l.code)) as name
FROM languages l
LEFT JOIN translations t ON t.code = l.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'hu')
WHERE l.is_active = 1
ORDER BY COALESCE(t.text, l.code);
```

### 2. Countries Table

Similar to languages, countries use the code as fallback:

```sql
SELECT 
    c.id,
    c.code,
    c.is_active,
    COALESCE(t.text, c.code) as name
FROM countries c
LEFT JOIN translations t ON t.code = c.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'hu')
WHERE c.is_active = 1
ORDER BY COALESCE(t.text, c.code);
```

## Error Handling

### Invalid Language Code

If an invalid language code is provided, the query will still execute but may return `NULL` for translations:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "person",
      "is_active": true,
      "name": null  // No translation found for invalid language
    }
  ]
}
```

### Invalid Language ID

If an invalid language ID is provided, the query will execute but may return `NULL` for translations.

## Best Practices

1. **Use Language Code**: Prefer `language_code` over `language_id` for better readability
2. **Store User Preference**: Store the user's language preference in your frontend state
3. **Fallback Handling**: Always handle cases where translation might be `NULL`
4. **Default Language**: Always provide a default language (usually `'en'`)

## Related Documentation

- [n8n Lookup Node Setup](./n8n_lookup_node_setup.md) - GET node implementation
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - Complete API documentation
- [How-To: Update and Delete Lookups](./HOW_TO_UPDATE_DELETE_LOOKUPS.md) - CRUD operations guide

