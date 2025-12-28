# How-To: Update and Delete Lookup Items

This guide explains how to update and delete lookup items using the unified API endpoint pattern.

## Table of Contents

1. [API Endpoint Structure](#api-endpoint-structure)
2. [Create Lookup Item](#create-lookup-item)
3. [Update Lookup Item](#update-lookup-item)
4. [Delete Lookup Item](#delete-lookup-item)
5. [Frontend Usage (React/TypeScript)](#frontend-usage-reacttypescript)
6. [Direct API Calls (cURL/HTTP)](#direct-api-calls-curlhttp)
7. [Error Handling](#error-handling)
8. [Supported Lookup Types](#supported-lookup-types)

---

## API Endpoint Structure

All lookup tables use a unified endpoint pattern:

**Base URL**: `/api/v1/lookups/:lookup_type/:id`

Where:
- `:lookup_type` - The type of lookup table (e.g., `languages`, `countries`, `object-types`)
- `:id` - The unique identifier of the item to update/delete

### Supported Lookup Types

| Lookup Type | Endpoint Example | Description |
|------------|------------------|-------------|
| `languages` | `/api/v1/lookups/languages/1` | Language codes |
| `object-types` | `/api/v1/lookups/object-types/1` | Object type classifications |
| `object-statuses` | `/api/v1/lookups/object-statuses/1` | Object status values |
| `sexes` | `/api/v1/lookups/sexes/1` | Gender/sex options |
| `salutations` | `/api/v1/lookups/salutations/1` | Title prefixes |
| `product-categories` | `/api/v1/lookups/product-categories/1` | Product categories |
| `countries` | `/api/v1/lookups/countries/1` | Country codes |
| `address-types` | `/api/v1/lookups/address-types/1` | Address types |
| `address-area-types` | `/api/v1/lookups/address-area-types/1` | Street/area types |
| `contact-types` | `/api/v1/lookups/contact-types/1` | Contact method types |
| `transaction-types` | `/api/v1/lookups/transaction-types/1` | Transaction classifications |
| `currencies` | `/api/v1/lookups/currencies/1` | Currency codes |
| `object-relation-types` | `/api/v1/lookups/object-relation-types/1` | Relationship types |

**Note**: `translations` use a different endpoint structure (see [Special Case: Translations](#special-case-translations) below).

---

## Create Lookup Item

### Endpoint

```
POST /api/v1/lookups/:lookup_type
```

### Request Body

```json
{
  "code": "new_code",
  "is_active": true,
  "text": "Translation text in current language",
  "language_id": 1
}
```

**Fields**:
- `code` (required): Unique code for the lookup item
- `is_active` (optional, default: `true`): Active status
- `text` (optional): Translation text for the current language. If provided, creates the translation for the specified or current language.
- `language_id` (optional): Language ID for the translation. If provided with `text`, creates the translation for this language. If `text` is provided without `language_id`, uses the current request language context.

### Response

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "new_code",
    "is_active": true
  }
}
```

**Error Response** (400/500):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Code must be unique",
    "details": {}
  }
}
```

### Examples

#### cURL Example

```bash
# Create a language with translation
curl -X POST "https://your-api.com/api/v1/lookups/languages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "fr",
    "is_active": true,
    "text": "French",
    "language_id": 1
  }'

# Create without translation
curl -X POST "https://your-api.com/api/v1/lookups/countries" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "US",
    "is_active": true
  }'
```

#### JavaScript/TypeScript Example

```typescript
// Using fetch API
const createLookupItem = async (
  lookupType: string, 
  data: { 
    code: string; 
    is_active?: boolean;
    text?: string;
    language_id?: number;
  }
) => {
  const response = await fetch(`/api/v1/lookups/${lookupType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  return result;
};

// Usage
await createLookupItem('languages', { 
  code: 'fr',
  text: 'French',
  language_id: 1
});
await createLookupItem('countries', { 
  code: 'US',
  is_active: true
});
```

**Note**: If `text` and `language_id` are provided, the API will automatically create the translation entry in the `translations` table for the specified language. If `text` is provided without `language_id`, the system will use the current language context from the request headers or session.

---

## Update Lookup Item

### Endpoint

```
PUT /api/v1/lookups/:lookup_type/:id
```

### Request Body

All fields are optional. Only include the fields you want to update:

```json
{
  "code": "updated_code",
  "is_active": true,
  "text": "Updated translation text in current language",
  "language_id": 1
}
```

**Fields**:
- `code` (optional): Updated code for the lookup item
- `is_active` (optional): Updated active status
- `text` (optional): Translation text for the current language. If provided, updates the translation for the specified or current language.
- `language_id` (optional): Language ID for the translation. If provided with `text`, updates the translation for this language. If `text` is provided without `language_id`, uses the current request language context.

### Response

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "updated_code",
    "is_active": true
  }
}
```

**Error Response** (400/404/500):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid code format",
    "details": {}
  }
}
```

### Examples

#### cURL Example

```bash
# Update a language's code and translation
curl -X PUT "https://your-api.com/api/v1/lookups/languages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "en_US",
    "is_active": true,
    "text": "English (United States)",
    "language_id": 1
  }'

# Update only the active status
curl -X PUT "https://your-api.com/api/v1/lookups/countries/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "is_active": false
  }'

# Update translation only (without changing code or status)
curl -X PUT "https://your-api.com/api/v1/lookups/languages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "text": "Updated translation text",
    "language_id": 1
  }'
```

#### JavaScript/TypeScript Example

```typescript
// Using fetch API
const updateLookupItem = async (
  lookupType: string, 
  id: number, 
  data: { 
    code?: string; 
    is_active?: boolean;
    text?: string;
    language_id?: number;
  }
) => {
  const response = await fetch(`/api/v1/lookups/${lookupType}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  return result;
};

// Usage
await updateLookupItem('languages', 1, { 
  code: 'en_US',
  text: 'English (United States)',
  language_id: 1
});
await updateLookupItem('countries', 5, { is_active: false });
await updateLookupItem('languages', 1, { 
  text: 'Updated translation',
  language_id: 1
});
```

---

## Delete Lookup Item

### Endpoint

```
DELETE /api/v1/lookups/:lookup_type/:id
```

### Description

**Important**: This performs a **soft delete** by setting `is_active = false`. The record is not physically removed from the database.

### Response

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

**Error Response** (404/500):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Item not found",
    "details": {}
  }
}
```

### Examples

#### cURL Example

```bash
# Delete (deactivate) a language
curl -X DELETE "https://your-api.com/api/v1/lookups/languages/1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Delete (deactivate) a country
curl -X DELETE "https://your-api.com/api/v1/lookups/countries/5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### JavaScript/TypeScript Example

```typescript
// Using fetch API
const deleteLookupItem = async (lookupType: string, id: number) => {
  const response = await fetch(`/api/v1/lookups/${lookupType}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  const result = await response.json();
  return result;
};

// Usage
await deleteLookupItem('languages', 1);
await deleteLookupItem('countries', 5);
```

---

## Frontend Usage (React/TypeScript)

The frontend uses the `lookupApi` service which provides type-safe methods for each lookup type.

### Import the API

```typescript
import { lookupApi } from '@/lib/api';
```

### Update Examples

```typescript
// Update a language with translation
const handleUpdateLanguage = async (
  id: number, 
  data: { 
    code?: string; 
    is_active?: boolean;
    text?: string;
    language_id?: number;
  }
) => {
  try {
    const response = await lookupApi.updateLanguage(id, data);
    if (response.success) {
      console.log('Language updated:', response.data);
      // Reload data or update local state
    } else {
      console.error('Update failed:', response.error);
    }
  } catch (error) {
    console.error('Error updating language:', error);
  }
};

// Update a country
const handleUpdateCountry = async (
  id: number, 
  data: { 
    code?: string; 
    is_active?: boolean;
    text?: string;
    language_id?: number;
  }
) => {
  const response = await lookupApi.updateCountry(id, data);
  if (response.success) {
    await loadData(); // Reload the list
  }
};

// Update only the active status
await lookupApi.updateObjectType(1, { is_active: false });

// Update code and translation together
await lookupApi.updateLanguage(1, { 
  code: 'en_US',
  text: 'English (United States)',
  language_id: 1
});

// Update translation only
await lookupApi.updateLanguage(1, { 
  text: 'Updated translation text',
  language_id: 1
});
```

### Delete Examples

```typescript
// Delete a language
const handleDeleteLanguage = async (id: number) => {
  if (!confirm('Are you sure you want to delete this language?')) {
    return;
  }
  
  try {
    const response = await lookupApi.deleteLanguage(id);
    if (response.success) {
      console.log('Language deleted');
      await loadData(); // Reload the list
    } else {
      console.error('Delete failed:', response.error);
    }
  } catch (error) {
    console.error('Error deleting language:', error);
  }
};

// Delete a country
const handleDeleteCountry = async (id: number) => {
  const response = await lookupApi.deleteCountry(id);
  if (response.success) {
    await loadData();
  }
};
```

### Complete Component Example

```typescript
'use client';

import React from 'react';
import { lookupApi } from '@/lib/api';
import type { LookupItem } from '@/types/common';

export default function MyLookupPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);

  const loadData = async () => {
    const response = await lookupApi.getLanguages();
    if (response.success) {
      setData(response.data);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (
    id: number, 
    item: { 
      code?: string; 
      is_active?: boolean;
      text?: string;
      language_id?: number;
    }
  ) => {
    const response = await lookupApi.updateLanguage(id, item);
    if (response.success) {
      await loadData(); // Reload after update
    } else {
      throw new Error('Failed to update language');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const response = await lookupApi.deleteLanguage(id);
    if (response.success) {
      await loadData(); // Reload after delete
    } else {
      throw new Error('Failed to delete language');
    }
  };

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

### Available API Methods

For each lookup type, the following methods are available:

```typescript
// Languages
lookupApi.updateLanguage(id, data)
lookupApi.deleteLanguage(id)

// Countries
lookupApi.updateCountry(id, data)
lookupApi.deleteCountry(id)

// Object Types
lookupApi.updateObjectType(id, data)
lookupApi.deleteObjectType(id)

// Object Statuses
lookupApi.updateObjectStatus(id, data)
lookupApi.deleteObjectStatus(id)

// Sexes
lookupApi.updateSex(id, data)
lookupApi.deleteSex(id)

// Salutations
lookupApi.updateSalutation(id, data)
lookupApi.deleteSalutation(id)

// Product Categories
lookupApi.updateProductCategory(id, data)
lookupApi.deleteProductCategory(id)

// Address Types
lookupApi.updateAddressType(id, data)
lookupApi.deleteAddressType(id)

// Address Area Types
lookupApi.updateAddressAreaType(id, data)
lookupApi.deleteAddressAreaType(id)

// Contact Types
lookupApi.updateContactType(id, data)
lookupApi.deleteContactType(id)

// Transaction Types
lookupApi.updateTransactionType(id, data)
lookupApi.deleteTransactionType(id)

// Currencies
lookupApi.updateCurrency(id, data)
lookupApi.deleteCurrency(id)

// Object Relation Types
lookupApi.updateObjectRelationType(id, data)
lookupApi.deleteObjectRelationType(id)
```

---

## Direct API Calls (cURL/HTTP)

### Update Request

```bash
PUT /api/v1/lookups/languages/1
Content-Type: application/json
Authorization: Bearer YOUR_ACCESS_TOKEN

{
  "code": "en_US",
  "is_active": true,
  "text": "English (United States)",
  "language_id": 1
}
```

### Delete Request

```bash
DELETE /api/v1/lookups/languages/1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Using cURL

```bash
# Update with translation
curl -X PUT "https://api.example.com/api/v1/lookups/languages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "en_US",
    "is_active": true,
    "text": "English (United States)",
    "language_id": 1
  }'

# Update without translation
curl -X PUT "https://api.example.com/api/v1/lookups/languages/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code": "en_US", "is_active": true}'

# Delete
curl -X DELETE "https://api.example.com/api/v1/lookups/languages/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman/Insomnia

1. **Update Request**:
   - Method: `PUT`
   - URL: `https://api.example.com/api/v1/lookups/languages/1`
   - Headers:
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN`
   - Body (JSON):
     ```json
     {
       "code": "en_US",
       "is_active": true,
       "text": "English (United States)",
       "language_id": 1
     }
     ```

2. **Delete Request**:
   - Method: `DELETE`
   - URL: `https://api.example.com/api/v1/lookups/languages/1`
   - Headers:
     - `Authorization: Bearer YOUR_TOKEN`

---

## Error Handling

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `NOT_FOUND` | 404 | Item not found |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `INTERNAL_ERROR` | 500 | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Code must be unique",
    "details": {
      "field": "code",
      "value": "duplicate_code"
    }
  }
}
```

### Error Handling Example

```typescript
const handleUpdate = async (
  id: number, 
  data: { 
    code?: string; 
    is_active?: boolean;
    text?: string;
    language_id?: number;
  }
) => {
  try {
    const response = await lookupApi.updateLanguage(id, data);
    
    if (response.success) {
      // Success
      console.log('Updated:', response.data);
      await loadData();
    } else {
      // API returned error
      const error = response.error;
      switch (error.code) {
        case 'VALIDATION_ERROR':
          alert(`Validation error: ${error.message}`);
          break;
        case 'NOT_FOUND':
          alert('Item not found');
          break;
        default:
          alert(`Error: ${error.message}`);
      }
    }
  } catch (error: any) {
    // Network or other error
    console.error('Request failed:', error);
    alert('Failed to update. Please try again.');
  }
};
```

---

## Special Case: Translations

Translations use a different endpoint structure because they have a composite key (`code` + `language_id`).

### Update Translation

**Endpoint**: `PUT /api/v1/lookups/translations/:code/:language_id`

**Request Body**:
```json
{
  "text": "Updated translation text"
}
```

**Example**:
```typescript
await lookupApi.updateTranslation('MY_CODE', 1, { text: 'New text' });
```

### Delete Translation

**Endpoint**: `DELETE /api/v1/lookups/translations/:code/:language_id`

**Example**:
```typescript
await lookupApi.deleteTranslation('MY_CODE', 1);
```

**cURL Example**:
```bash
# Update translation
curl -X PUT "https://api.example.com/api/v1/lookups/translations/MY_CODE/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"text": "Updated text"}'

# Delete translation
curl -X DELETE "https://api.example.com/api/v1/lookups/translations/MY_CODE/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Best Practices

1. **Always check response.success** before assuming the operation succeeded
2. **Handle errors gracefully** - show user-friendly error messages
3. **Reload data after updates/deletes** to keep UI in sync
4. **Use confirmation dialogs** for delete operations
5. **Validate input** on the client side before making API calls
6. **Use TypeScript types** for type safety (available in `@/lib/api`)
7. **Include authentication tokens** in all requests
8. **Remember that DELETE is a soft delete** - items are deactivated, not removed

---

## Quick Reference

### Create
```typescript
POST /api/v1/lookups/:lookup_type
Body: { 
  code: string, 
  is_active?: boolean,
  text?: string,
  language_id?: number
}
```

### Update
```typescript
PUT /api/v1/lookups/:lookup_type/:id
Body: { 
  code?: string, 
  is_active?: boolean,
  text?: string,
  language_id?: number
}
```

### Delete
```typescript
DELETE /api/v1/lookups/:lookup_type/:id
(Soft delete - sets is_active = false)
```

### Frontend Helper
```typescript
import { lookupApi } from '@/lib/api';

// Create
await lookupApi.createLanguage({ 
  code: 'fr',
  text: 'French',
  language_id: 1
});

// Update
await lookupApi.updateLanguage(id, { 
  code: 'new_code',
  text: 'Updated translation',
  language_id: 1
});

// Delete
await lookupApi.deleteLanguage(id);
```

---

For more information, see:
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md)
- [Frontend API Documentation](../frontend/src/lib/api/README.md)

