# Lookup Table Update API Reference

This document describes the API calls used when saving edited items in lookup tables, including the "Translations" checkbox functionality.

## Overview

When editing a lookup item in the frontend, the save operation performs the following API calls:

1. **Update Lookup Item** - Updates the lookup table record (code, is_active, object_type_id)
2. **Update Translations** (if checkbox checked) - Updates translations for all languages (en, de, hu)

## API Endpoints

### 1. Update Lookup Item

**Endpoint**: `PUT /api/v1/lookups/:lookup_type/:id`

**Description**: Updates a lookup table item (code, is_active, and optionally object_type_id).

**Path Parameters**:
- `lookup_type`: Type of lookup (e.g., `object-statuses`, `object-relation-types`, `languages`, etc.)
- `id`: The ID of the item to update

**Request Body** (all fields optional, but some are always included):
```json
{
  "code": "updated_code",
  "is_active": true,
  "object_type_id": 1,
  "text": "Translation text for current language",
  "language_id": 1,
  "update_all_languages": 0,
  "old_text": "Previous translation",
  "new_text": "New translation"
}
```

**Fields**:
- `code` (optional): Updated code for the lookup item
- `is_active` (optional): Updated active status (true/false)
- `object_type_id` (always included): Object type ID (for object-statuses and object-relation-types). Defaults to `0` if not provided.
- `text` (optional): Translation text for the current language
- `language_id` (optional): Language ID for the translation
- `update_all_languages` (always included): `0` or `1` - Whether to update translations for all languages. Defaults to `0` if checkbox is unchecked.
- `old_text` (optional): Previous translation text (for reference)
- `new_text` (optional): New translation text (used when `update_all_languages` is `1`)

**Response**:
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

**n8n Implementation**: Uses `n8n_lookup_update_node_code.js`

---

### 2. Update Translation (Single Language)

**Endpoint**: `PUT /api/v1/lookups/translations/:code/:language_id`

**Description**: Updates a translation for a specific code and language.

**Path Parameters**:
- `code`: The translation code (same as lookup item code)
- `language_id`: The language ID (1=en, 2=de, 3=hu, etc.)

**Request Body**:
```json
{
  "text": "Updated translation text"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "code": "item_code",
    "language_id": 1,
    "text": "Updated translation text"
  }
}
```

**Error Response** (if translation doesn't exist):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Translation not found"
  }
}
```

---

### 3. Create Translation (Single Language)

**Endpoint**: `POST /api/v1/lookups/translations`

**Description**: Creates a new translation for a code and language.

**Request Body**:
```json
{
  "code": "item_code",
  "language_id": 1,
  "text": "Translation text"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "code": "item_code",
    "language_id": 1,
    "text": "Translation text"
  }
}
```

---

## Save Flow with "Translations" Checkbox

### When Checkbox is UNCHECKED (Default)

1. **Update Lookup Item**: `PUT /api/v1/lookups/:lookup_type/:id`
   - Updates: `code`, `is_active`, `object_type_id`
   - If `text` is provided: Updates translation for current language only

**Example Request** (checkbox unchecked):
```json
PUT /api/v1/lookups/object-statuses/5
{
  "code": "active",
  "is_active": true,
  "object_type_id": 1,
  "text": "Active (English)",
  "language_id": 1,
  "update_all_languages": 0
}
```

**Note**: `object_type_id` and `update_all_languages` are always included in the request body:
- `object_type_id`: `0` if not provided, otherwise the actual value
- `update_all_languages`: `0` if checkbox is unchecked, `1` if checked

### When Checkbox is CHECKED

1. **Update Translations for All Languages** (en, de, hu):
   - For each language (en, de, hu):
     - Try: `PUT /api/v1/lookups/translations/:code/:language_id`
     - If 404 (not found): `POST /api/v1/lookups/translations` (create new)
   - All translations use the same text value

2. **Update Lookup Item**: `PUT /api/v1/lookups/:lookup_type/:id`
   - Updates: `code`, `is_active`, `object_type_id`
   - `text` is NOT sent (already handled in step 1)

**Example Flow**:
```javascript
// Step 1: Update translations for all languages
PUT /api/v1/lookups/translations/active/1  // English
{ "text": "Active" }

PUT /api/v1/lookups/translations/active/2  // German
{ "text": "Active" }

PUT /api/v1/lookups/translations/active/3  // Hungarian
{ "text": "Active" }

// Step 2: Update lookup item
PUT /api/v1/lookups/object-statuses/5
{
  "code": "active",
  "is_active": true,
  "object_type_id": 1,
  "update_all_languages": 1
}
```

**Note**: `object_type_id` and `update_all_languages` are always included:
- `object_type_id`: Always present (defaults to `0` if not provided)
- `update_all_languages`: Always present (`0` or `1`)

---

## Frontend Implementation

### LookupTable Component (`handleSave` function)

```typescript
const handleSave = async () => {
  // 1. If checkbox is checked, update all language translations
  if (updateAllLanguages && hasTranslationChanged) {
    const languages = await lookupApi.getLanguages();
    const targetLanguages = languages.data.filter(
      l => ['en', 'de', 'hu'].includes(l.code.toLowerCase())
    );
    
    // Update/create translations for all languages
    await Promise.all(
      targetLanguages.map(lang => {
        try {
          return lookupApi.updateTranslation(code, lang.id, { text });
        } catch {
          // If update fails, create new translation
          return lookupApi.createTranslation({ code, language_id: lang.id, text });
        }
      })
    );
  }
  
  // 2. Update the lookup item
  await onUpdate(id, {
    code,
    is_active,
    object_type_id,
    text: !updateAllLanguages ? text : undefined,
    language_id: !updateAllLanguages ? languageId : undefined
  });
};
```

---

## n8n Workflow Structure

### Update Lookup Item Node

**File**: `n8n_lookup_update_node_code.js`

**Input**:
- `params.lookup_type`: Lookup type from URL
- `params.id`: Item ID from URL
- `body.code`: Updated code (optional)
- `body.is_active`: Updated active status (optional)
- `body.object_type_id`: Updated object type ID (optional)
- `body.text`: Translation text (optional)
- `body.language_id`: Language ID for translation (optional)

**Output**:
- SQL queries to execute:
  1. Update lookup table (if code or is_active changed)
  2. Update/create translation (if text provided)

**Query Order**:
1. Update translation codes (if code changed)
2. Update lookup table
3. Insert/update translation

---

## Error Handling

### Translation Update Errors

If updating a translation fails with 404 (not found), the frontend automatically creates a new translation:

```typescript
try {
  await lookupApi.updateTranslation(code, langId, { text });
} catch (err) {
  if (err?.error?.code === 'NOT_FOUND' || err?.status === 404) {
    await lookupApi.createTranslation({ code, language_id: langId, text });
  } else {
    throw err;
  }
}
```

### Partial Failures

- If translation updates fail but lookup update succeeds: The lookup item is updated, but translations may be incomplete
- If lookup update fails: All changes are rolled back (no partial updates)

---

## Language IDs Reference

Common language IDs (may vary based on database):
- `1`: English (en)
- `2`: German (de)
- `3`: Hungarian (hu)

To get language IDs dynamically:
```typescript
const languages = await lookupApi.getLanguages();
const enLang = languages.data.find(l => l.code === 'en');
const enLangId = enLang?.id; // Use this ID
```

---

## Example: Complete Save Operation

### Scenario: Edit object status with "Translations" checkbox checked

**User Action**:
- Edit item ID 5
- Change code: "active" → "active_status"
- Change translation: "Active" → "Active Status"
- Check "Translations" checkbox
- Click Save

**API Calls Made**:

1. **Update English translation**:
   ```
   PUT /api/v1/lookups/translations/active_status/1
   { "text": "Active Status" }
   ```

2. **Update German translation**:
   ```
   PUT /api/v1/lookups/translations/active_status/2
   { "text": "Active Status" }
   ```

3. **Update Hungarian translation**:
   ```
   PUT /api/v1/lookups/translations/active_status/3
   { "text": "Active Status" }
   ```

4. **Update lookup item**:
   ```
   PUT /api/v1/lookups/object-statuses/5
   {
     "code": "active_status",
     "is_active": true,
     "object_type_id": 1,
     "update_all_languages": 1
   }
   ```

**Result**: All three language translations are updated with "Active Status", and the lookup item code is updated.

---

## Required Fields in Request Body

The following fields are **always included** in the request body, even if not explicitly set:

### `object_type_id`
- **Always present**: Yes
- **Default value**: `0` if not provided
- **Description**: Object type ID for object-statuses and object-relation-types
- **Example**: `"object_type_id": 1` or `"object_type_id": 0`

### `update_all_languages`
- **Always present**: Yes
- **Default value**: `0` if checkbox is unchecked, `1` if checked
- **Description**: Whether to update translations for all languages (en, de, hu)
- **Values**: `0` (unchecked) or `1` (checked)
- **Example**: `"update_all_languages": 1`

### Example Request Body (Always Includes These Fields)

```json
{
  "code": "active",
  "is_active": true,
  "object_type_id": 1,           // Always included (0 if not set)
  "update_all_languages": 0,      // Always included (0 or 1)
  "text": "Active",              // Optional
  "language_id": 1,              // Optional
  "old_text": "Previous",        // Optional
  "new_text": "Active"           // Optional
}
```

---

## Notes

- The "Translations" checkbox only affects translations, not the lookup item itself
- When checkbox is checked, the same text is applied to all three languages (en, de, hu)
- Translation updates happen BEFORE the lookup item update
- If a translation doesn't exist, it will be created automatically
- All API calls are made in parallel where possible for better performance
- **`object_type_id` and `update_all_languages` are always included in the request body** (defaults to `0` if not provided)

