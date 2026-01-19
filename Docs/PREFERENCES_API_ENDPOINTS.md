# User Preferences API Endpoints

This document defines all n8n webhook endpoints required for the user preferences system.

## Base URL

```
https://n8n.wolfitlab.duckdns.org/webhook/<webhook-id>/api/v1
```

**Note**: A new webhook ID will be needed for the preferences API, or the existing main API webhook can be extended.

---

## Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/preferences/categories` | List all preference categories |
| GET | `/preferences/categories/:id` | Get single category with translations |
| POST | `/preferences/categories` | Create new category |
| PUT | `/preferences/categories/:id` | Update category |
| DELETE | `/preferences/categories/:id` | Soft delete category |
| GET | `/preferences/definitions` | List all preference definitions |
| GET | `/preferences/definitions/:id` | Get single definition with translations |
| GET | `/preferences/definitions/by-key/:key_name` | Get definition by key name |
| POST | `/preferences/definitions` | Create new definition |
| PUT | `/preferences/definitions/:id` | Update definition |
| DELETE | `/preferences/definitions/:id` | Soft delete definition |
| GET | `/users/:user_id/preferences` | Get all user preferences |
| GET | `/users/me/preferences` | Get current user's preferences |
| GET | `/users/:user_id/preferences/:key_name` | Get specific preference by key |
| POST | `/users/:user_id/preferences` | Create new user preference |
| PUT | `/users/:user_id/preferences/:key_name` | Update user preference |
| POST | `/users/:user_id/preferences/bulk` | Bulk update preferences |
| DELETE | `/users/:user_id/preferences/:key_name` | Reset preference to default |
| POST | `/users/:user_id/preferences/reset-all` | Reset all preferences |
| GET | `/users/:user_id/preferences/extended/:namespace` | Get extended JSON preferences |
| PUT | `/users/:user_id/preferences/extended/:namespace` | Update extended preferences |
| DELETE | `/users/:user_id/preferences/extended/:namespace` | Delete extended preferences |
| GET | `/users/:user_id/preferences/audits` | Get preference change history |

---

## 1. Preference Categories Endpoints

### 1.1 List All Categories

**GET** `/preferences/categories`

**Query Parameters:**
- `language_id` (optional, number): Language ID for translated descriptions (default: 1)
- `is_active` (optional, boolean): Filter by active status
- `page` (optional, number): Page number for pagination
- `limit` (optional, number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "ui",
      "description_code": "pref_cat_ui_desc",
      "description": "User Interface Preferences",
      "is_active": true,
      "created_at": "2026-01-19T10:00:00Z",
      "updated_at": "2026-01-19T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6,
    "totalPages": 1
  }
}
```

**SQL Query Pattern:**
```sql
SELECT
  pc.id, pc.code, pc.description_code, pc.is_active,
  pc.created_at, pc.updated_at,
  t.text as description
FROM preference_categories pc
LEFT JOIN translations t ON t.code = pc.description_code AND t.language_id = {{ $json.query.language_id || 1 }}
WHERE pc.is_active = {{ $json.query.is_active !== undefined ? $json.query.is_active : 1 }}
ORDER BY pc.id
LIMIT {{ $json.query.limit || 20 }}
OFFSET {{ ($json.query.page - 1) * ($json.query.limit || 20) }};
```

---

### 1.2 Get Single Category

**GET** `/preferences/categories/:id`

**Query Parameters:**
- `language_id` (optional, number): Language ID for translations

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "ui",
    "description_code": "pref_cat_ui_desc",
    "description": "User Interface Preferences",
    "is_active": true,
    "created_at": "2026-01-19T10:00:00Z",
    "updated_at": "2026-01-19T10:00:00Z"
  }
}
```

---

### 1.3 Create Category

**POST** `/preferences/categories`

**Request Body:**
```json
{
  "code": "custom",
  "description_code": "pref_cat_custom_desc",
  "language_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "code": "custom",
    "description_code": "pref_cat_custom_desc",
    "is_active": true,
    "created_at": "2026-01-19T10:00:00Z",
    "updated_at": "2026-01-19T10:00:00Z"
  }
}
```

---

### 1.4 Update Category

**PUT** `/preferences/categories/:id`

**Request Body:**
```json
{
  "description_code": "pref_cat_custom_desc_updated",
  "is_active": true,
  "language_id": 1
}
```

---

### 1.5 Delete Category (Soft Delete)

**DELETE** `/preferences/categories/:id`

**Response:**
```json
{
  "success": true,
  "message": "Category soft deleted successfully"
}
```

**SQL Query:**
```sql
UPDATE preference_categories
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};
```

---

## 2. Preference Definitions Endpoints

### 2.1 List All Definitions

**GET** `/preferences/definitions`

**Query Parameters:**
- `language_id` (optional, number): Language ID for translations
- `category_id` (optional, number): Filter by category
- `scope` (optional, string): Filter by scope ('user', 'system', 'both')
- `group_name` (optional, string): Filter by group
- `is_user_editable` (optional, boolean): Filter by editability
- `is_active` (optional, boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "key_name": "ui.theme",
      "display_name_code": "pref_ui_theme_name",
      "description_code": "pref_ui_theme_desc",
      "display_name": "Theme",
      "description": "Color theme preference (light or dark mode)",
      "data_type": "string",
      "default_value": "light",
      "validation_rules": { "enum": ["light", "dark"] },
      "is_user_editable": true,
      "scope": "user",
      "group_name": "appearance",
      "sort_order": 10,
      "is_active": true,
      "created_at": "2026-01-19T10:00:00Z",
      "updated_at": "2026-01-19T10:00:00Z",
      "category": {
        "id": 1,
        "code": "ui",
        "description": "User Interface Preferences"
      }
    }
  ]
}
```

**SQL Query Pattern:**
```sql
SELECT
  pd.*,
  dn.text as display_name,
  dd.text as description,
  pc.id as category_id,
  pc.code as category_code,
  td.text as category_description
FROM preference_definitions pd
LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = {{ $json.query.language_id || 1 }}
LEFT JOIN translations dd ON dd.code = pd.description_code AND dd.language_id = {{ $json.query.language_id || 1 }}
LEFT JOIN preference_categories pc ON pc.id = pd.category_id
LEFT JOIN translations td ON td.code = pc.description_code AND td.language_id = {{ $json.query.language_id || 1 }}
WHERE pd.is_active = {{ $json.query.is_active !== undefined ? $json.query.is_active : 1 }}
  {{ $json.query.category_id ? 'AND pd.category_id = ' + $json.query.category_id : '' }}
  {{ $json.query.scope ? "AND pd.scope = '" + $json.query.scope + "'" : '' }}
  {{ $json.query.group_name ? "AND pd.group_name = '" + $json.query.group_name + "'" : '' }}
ORDER BY pd.category_id, pd.sort_order;
```

---

### 2.2 Get Definition by Key Name

**GET** `/preferences/definitions/by-key/:key_name`

**Example:** `GET /preferences/definitions/by-key/ui.theme?language_id=1`

**Response:** Same structure as single definition GET

---

### 2.3 Create Definition

**POST** `/preferences/definitions`

**Request Body:**
```json
{
  "category_id": 1,
  "key_name": "ui.custom_setting",
  "display_name_code": "pref_ui_custom_name",
  "description_code": "pref_ui_custom_desc",
  "data_type": "string",
  "default_value": "value",
  "validation_rules": null,
  "is_user_editable": true,
  "scope": "user",
  "group_name": "appearance",
  "sort_order": 100,
  "language_id": 1
}
```

---

## 3. User Preferences Endpoints

### 3.1 Get All User Preferences

**GET** `/users/:user_id/preferences`

**Query Parameters:**
- `language_id` (optional, number): Language ID for translations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "preference_definition_id": 1,
      "value": "dark",
      "value_json": null,
      "is_default": false,
      "created_at": "2026-01-19T10:00:00Z",
      "updated_at": "2026-01-19T10:00:00Z",
      "created_by": 123,
      "definition": {
        "id": 1,
        "key_name": "ui.theme",
        "display_name": "Theme",
        "description": "Color theme preference",
        "data_type": "string",
        "default_value": "light"
      }
    }
  ]
}
```

**SQL Query Pattern:**
```sql
SELECT
  up.*,
  pd.id as def_id,
  pd.key_name,
  pd.data_type,
  pd.default_value,
  dn.text as display_name,
  dd.text as description
FROM user_preferences up
INNER JOIN preference_definitions pd ON pd.id = up.preference_definition_id
LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = {{ $json.query.language_id || 1 }}
LEFT JOIN translations dd ON dd.code = pd.description_code AND dd.language_id = {{ $json.query.language_id || 1 }}
WHERE up.user_id = {{ $json.params.user_id }}
ORDER BY pd.category_id, pd.sort_order;
```

---

### 3.2 Get Current User's Preferences

**GET** `/users/me/preferences`

**Authentication Required:** Extract user_id from JWT token

**Response:** Same as 3.1

---

### 3.3 Get Specific Preference by Key

**GET** `/users/:user_id/preferences/:key_name`

**Example:** `GET /users/123/preferences/ui.theme?language_id=1`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "preference_definition_id": 1,
    "value": "dark",
    "value_json": null,
    "is_default": false,
    "definition": {
      "key_name": "ui.theme",
      "display_name": "Theme",
      "data_type": "string"
    }
  }
}
```

**SQL Query:**
```sql
SELECT
  up.*,
  pd.key_name,
  pd.data_type,
  dn.text as display_name
FROM user_preferences up
INNER JOIN preference_definitions pd ON pd.id = up.preference_definition_id
LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = {{ $json.query.language_id || 1 }}
WHERE up.user_id = {{ $json.params.user_id }}
  AND pd.key_name = '{{ $json.params.key_name }}';
```

---

### 3.4 Create User Preference

**POST** `/users/:user_id/preferences`

**Request Body:**
```json
{
  "preference_definition_id": 1,
  "value": "dark",
  "language_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "preference_definition_id": 1,
    "value": "dark",
    "is_default": false,
    "created_at": "2026-01-19T10:00:00Z"
  }
}
```

---

### 3.5 Update User Preference

**PUT** `/users/:user_id/preferences/:key_name`

**Request Body:**
```json
{
  "value": "dark",
  "language_id": 1
}
```

**n8n Workflow Steps:**
1. Look up preference_definition_id from key_name
2. Check if user preference exists
3. If exists: UPDATE, if not: INSERT
4. Return updated preference

**SQL Query:**
```sql
-- First, get definition ID
SELECT id FROM preference_definitions WHERE key_name = '{{ $json.params.key_name }}';

-- Then, upsert preference
INSERT INTO user_preferences (user_id, preference_definition_id, value, is_default, created_by)
VALUES (
  {{ $json.params.user_id }},
  {{ $json.definition_id }},
  '{{ $json.body.value }}',
  0,
  {{ $json.params.user_id }}
)
ON DUPLICATE KEY UPDATE
  value = '{{ $json.body.value }}',
  is_default = 0,
  updated_at = NOW();
```

---

### 3.6 Bulk Update Preferences

**POST** `/users/:user_id/preferences/bulk`

**Request Body:**
```json
{
  "preferences": [
    { "key_name": "ui.theme", "value": "dark" },
    { "key_name": "ui.language", "value": "2" }
  ],
  "language_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "key_name": "ui.theme", "value": "dark", "updated": true },
    { "key_name": "ui.language", "value": "2", "updated": true }
  ]
}
```

**n8n Workflow:** Use Loop node to iterate over preferences array

---

### 3.7 Reset Preference to Default

**DELETE** `/users/:user_id/preferences/:key_name`

**Response:**
```json
{
  "success": true,
  "message": "Preference reset to default"
}
```

**SQL Query:**
```sql
-- Get definition ID and default value
SELECT id, default_value FROM preference_definitions WHERE key_name = '{{ $json.params.key_name }}';

-- Update or insert with default value
INSERT INTO user_preferences (user_id, preference_definition_id, value, is_default, created_by)
VALUES (
  {{ $json.params.user_id }},
  {{ $json.definition_id }},
  '{{ $json.default_value }}',
  1,
  {{ $json.params.user_id }}
)
ON DUPLICATE KEY UPDATE
  value = '{{ $json.default_value }}',
  is_default = 1,
  updated_at = NOW();
```

---

### 3.8 Reset All Preferences

**POST** `/users/:user_id/preferences/reset-all`

**Response:**
```json
{
  "success": true,
  "message": "All preferences reset to defaults"
}
```

**SQL Query:**
```sql
-- Delete all user preferences (they'll use defaults)
DELETE FROM user_preferences WHERE user_id = {{ $json.params.user_id }};

-- Or update all to default values:
UPDATE user_preferences up
INNER JOIN preference_definitions pd ON pd.id = up.preference_definition_id
SET
  up.value = pd.default_value,
  up.is_default = 1,
  up.updated_at = NOW()
WHERE up.user_id = {{ $json.params.user_id }};
```

---

## 4. Extended JSON Preferences

### 4.1 Get Extended Preferences

**GET** `/users/:user_id/preferences/extended/:namespace`

**Example:** `GET /users/123/preferences/extended/ui`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 123,
    "namespace": "ui",
    "preferences": {
      "custom_color": "#FF5733",
      "sidebar_width": 250,
      "show_tooltips": true
    },
    "created_at": "2026-01-19T10:00:00Z",
    "updated_at": "2026-01-19T10:00:00Z"
  }
}
```

---

### 4.2 Update Extended Preferences

**PUT** `/users/:user_id/preferences/extended/:namespace`

**Request Body:**
```json
{
  "preferences": {
    "custom_color": "#FF5733",
    "sidebar_width": 250
  },
  "language_id": 1
}
```

**SQL Query:**
```sql
INSERT INTO user_preferences_extended (user_id, namespace, preferences)
VALUES (
  {{ $json.params.user_id }},
  '{{ $json.params.namespace }}',
  '{{ JSON.stringify($json.body.preferences) }}'
)
ON DUPLICATE KEY UPDATE
  preferences = '{{ JSON.stringify($json.body.preferences) }}',
  updated_at = NOW();
```

---

## 5. Preference Audits

### 5.1 Get Preference Audit Trail

**GET** `/users/:user_id/preferences/audits`

**Query Parameters:**
- `preference_definition_id` (optional, number): Filter by preference
- `date_from` (optional, string): Start date (ISO format)
- `date_to` (optional, string): End date (ISO format)
- `language_id` (optional, number): Language for translations

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "preference_definition_id": 1,
      "old_value": "light",
      "new_value": "dark",
      "changed_by": 123,
      "changed_at": "2026-01-19T10:00:00Z",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "definition": {
        "key_name": "ui.theme",
        "display_name": "Theme"
      }
    }
  ]
}
```

---

## Authentication & Authorization

All endpoints require:
- **Authorization Header:** `Bearer <JWT_TOKEN>`
- **User Identification:** Extract user_id from JWT token
- **Permission Check:** Verify user can only access/modify their own preferences (except admins)

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "PREFERENCE_NOT_FOUND",
    "message": "Preference with key 'ui.invalid' not found",
    "details": null
  }
}
```

### Common Error Codes

- `PREFERENCE_NOT_FOUND` - Preference key doesn't exist
- `INVALID_VALUE` - Value doesn't match data type or validation rules
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User cannot access another user's preferences
- `VALIDATION_ERROR` - Request body validation failed
- `DATABASE_ERROR` - Database operation failed

---

## n8n Workflow Implementation Notes

### Required n8n Nodes

1. **Webhook Trigger** - Entry point for all requests
2. **Switch Node** - Route based on HTTP method and path
3. **Function Node** - Extract user_id from JWT, parse request
4. **MySQL Node** - Database operations
5. **Set Node** - Format response
6. **Error Handling** - Catch and format errors

### JWT Token Extraction

```javascript
// In Function node
const token = $('Webhook').first().json.headers.authorization;
const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
return { user_id: decoded.user_id, ...items };
```

### Language ID Handling

```javascript
// Extract from request body or default to 1 (English)
const language_id = $json.body.language_id || $json.query.language_id || 1;
```

---

## Testing Checklist

- [ ] Create preference category
- [ ] Create preference definition with translations
- [ ] Get all definitions with language filtering
- [ ] Create user preference
- [ ] Update user preference
- [ ] Get user preferences
- [ ] Reset preference to default
- [ ] Bulk update preferences
- [ ] Extended JSON preferences CRUD
- [ ] Preference audit trail
- [ ] Authentication/authorization checks
- [ ] Error handling for invalid inputs
- [ ] Pagination for list endpoints

---

## Database Installation

1. Run `Docs/preferences_schema.sql` to create tables
2. Run `Docs/preferences_seed_data.sql` to insert initial data
3. Verify with:
   ```sql
   SELECT COUNT(*) FROM preference_categories; -- Should return 6
   SELECT COUNT(*) FROM preference_definitions; -- Should return 16
   SELECT COUNT(*) FROM translations WHERE code LIKE 'pref_%'; -- Should return 96
   ```

---

## Frontend Integration

The frontend API client ([lib/api/preferences.ts](../frontend/src/lib/api/preferences.ts)) is already implemented and ready to use once the n8n endpoints are deployed.

Example usage:
```typescript
import { preferencesApi } from '@/lib/api';

// Get user preferences
const prefs = await preferencesApi.getUserPreferences(userId, { language_id: 1 });

// Update preference
await preferencesApi.updateUserPreference(userId, 'ui.theme', { value: 'dark' });
```
