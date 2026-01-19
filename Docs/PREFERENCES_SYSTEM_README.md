# User Preferences System - Complete Implementation Guide

## Overview

The User Preferences System is a comprehensive, extensible solution for managing user settings in the Office Application. It features:

- ✅ **Multi-language support** via translations table
- ✅ **Type-safe preferences** with validation rules
- ✅ **Hybrid storage** (structured + JSON for flexibility)
- ✅ **Complete audit trail** for compliance
- ✅ **Frontend & backend ready** with React UI components
- ✅ **Zustand store** with localStorage persistence
- ✅ **n8n webhook integration** documented

---

## Architecture

### Database Design

The system uses a **hybrid approach** combining:
1. **Structured tables** for common, typed preferences
2. **JSON storage** for dynamic/rare preferences
3. **Translations integration** for multi-language UI

**Key Tables:**
- `preference_categories` - Grouping (UI, API, Notifications, etc.)
- `preference_definitions` - Schema/metadata for each preference
- `user_preferences` - User-specific values
- `user_preferences_extended` - JSON blob for dynamic settings
- `preference_audits` - Complete change history

### Frontend Architecture

- **API Client**: [lib/api/preferences.ts](../frontend/src/lib/api/preferences.ts)
- **Zustand Store**: [store/preferencesStore.ts](../frontend/src/store/preferencesStore.ts)
- **UI Components**: [components/preferences/](../frontend/src/components/preferences/)
- **Settings Page**: [app/settings/page.tsx](../frontend/src/app/settings/page.tsx)
- **TypeScript Types**: [types/entities.ts](../frontend/src/types/entities.ts)

---

## Installation

### Step 1: Database Schema

Run the schema creation script:

```bash
mysql -u your_user -p your_database < Docs/preferences_schema.sql
```

Or execute in your MySQL client:
```sql
source /path/to/Docs/preferences_schema.sql;
```

**Tables Created:**
- preference_categories
- preference_definitions
- user_preferences
- user_preferences_extended
- preference_audits

### Step 2: Seed Data

Insert initial preferences and translations:

```bash
mysql -u your_user -p your_database < Docs/preferences_seed_data.sql
```

**Data Inserted:**
- 6 preference categories
- 16 preference definitions
- 96 translation entries (3 languages × 32 strings)

### Step 3: Verify Installation

Run verification queries:

```sql
-- Should return 6
SELECT COUNT(*) as category_count FROM preference_categories;

-- Should return 16
SELECT COUNT(*) as definition_count FROM preference_definitions;

-- Should return 96
SELECT COUNT(*) as translation_count FROM translations WHERE code LIKE 'pref_%';

-- View all categories with translations (English)
SELECT pc.id, pc.code, t.text as description
FROM preference_categories pc
LEFT JOIN translations t ON t.code = pc.description_code AND t.language_id = 1
ORDER BY pc.id;

-- View all definitions with translations (English)
SELECT pd.id, pd.key_name, dn.text as display_name, dd.text as description, pd.data_type, pd.default_value
FROM preference_definitions pd
LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = 1
LEFT JOIN translations dd ON dd.code = pd.description_code AND dd.language_id = 1
ORDER BY pd.category_id, pd.sort_order;
```

### Step 4: n8n Webhook Setup

1. **Create new n8n workflow** or extend existing main API workflow
2. **Add webhook endpoints** as documented in [PREFERENCES_API_ENDPOINTS.md](PREFERENCES_API_ENDPOINTS.md)
3. **Configure webhook URL** in frontend environment:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=https://n8n.wolfitlab.duckdns.org/webhook/<webhook-id>/api/v1
```

4. **Implement endpoints** following the SQL patterns in the API documentation

### Step 5: Frontend Integration

The frontend code is already implemented! Just ensure:

1. ✅ Database tables exist
2. ✅ n8n endpoints are deployed
3. ✅ Environment variables are set

Navigate to `/settings` in your application to access the preferences UI.

---

## Usage Examples

### Frontend Usage

#### Using the Zustand Store

```typescript
import { usePreferencesStore, usePreference } from '@/store/preferencesStore';

// In a component
function MyComponent() {
  // Get a specific preference with default
  const theme = usePreference('ui.theme', 'light');

  // Get the update function
  const updatePreference = useUpdatePreference();

  // Update a preference
  const handleThemeChange = async (newTheme: string) => {
    await updatePreference('ui.theme', newTheme);
  };

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => handleThemeChange('dark')}>
        Switch to Dark
      </button>
    </div>
  );
}
```

#### Direct API Calls

```typescript
import { preferencesApi } from '@/lib/api';

// Get all user preferences
const response = await preferencesApi.getUserPreferences(userId, { language_id: 1 });

// Update a single preference
await preferencesApi.updateUserPreference(userId, 'ui.theme', { value: 'dark' });

// Bulk update
await preferencesApi.bulkUpdateUserPreferences(userId, {
  preferences: [
    { key_name: 'ui.theme', value: 'dark' },
    { key_name: 'ui.language', value: '2' },
  ],
});

// Reset to default
await preferencesApi.resetUserPreference(userId, 'ui.theme');
```

### Backend (n8n) Usage

See complete SQL patterns in [PREFERENCES_API_ENDPOINTS.md](PREFERENCES_API_ENDPOINTS.md).

**Example: Get user preferences with translations**

```sql
SELECT
  up.*,
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

## Available Preferences (Seed Data)

### UI Category

| Key Name | Display Name | Data Type | Default | Group |
|----------|--------------|-----------|---------|-------|
| `ui.theme` | Theme | string | light | appearance |
| `ui.language` | Interface Language | number | 1 | localization |
| `ui.date_format` | Date Format | string | YYYY-MM-DD | appearance |
| `ui.time_format` | Time Format | string | 24h | appearance |
| `ui.items_per_page` | Items Per Page | number | 20 | behavior |
| `ui.sidebar_collapsed` | Sidebar Collapsed | boolean | false | layout |

### Data Display Category

| Key Name | Display Name | Data Type | Default | Group |
|----------|--------------|-----------|---------|-------|
| `data.default_currency` | Default Currency | number | 1 | defaults |
| `data.default_country` | Default Country | number | 1 | defaults |
| `data.default_address_type` | Default Address Type | number | 1 | defaults |
| `data.default_contact_type` | Default Contact Type | number | 1 | defaults |

### API Category

| Key Name | Display Name | Data Type | Default | Group |
|----------|--------------|-----------|---------|-------|
| `api.timeout` | API Timeout | number | 30000 | performance |
| `api.retry_attempts` | Retry Attempts | number | 3 | performance |
| `api.cache_enabled` | Enable API Cache | boolean | true | performance |

### Notifications Category

| Key Name | Display Name | Data Type | Default | Group |
|----------|--------------|-----------|---------|-------|
| `notifications.email_enabled` | Email Notifications | boolean | true | channels |
| `notifications.push_enabled` | Push Notifications | boolean | false | channels |
| `notifications.sound_enabled` | Notification Sounds | boolean | true | behavior |

---

## Adding New Preferences

### 1. Add Translation Entries

```sql
-- Add translations for display name
INSERT INTO translations (code, language_id, text) VALUES
('pref_custom_name', 1, 'Custom Setting'),
('pref_custom_name', 2, 'Benutzerdefinierte Einstellung'),
('pref_custom_name', 3, 'Egyéni beállítás');

-- Add translations for description
INSERT INTO translations (code, language_id, text) VALUES
('pref_custom_desc', 1, 'This is a custom user preference'),
('pref_custom_desc', 2, 'Dies ist eine benutzerdefinierte Einstellung'),
('pref_custom_desc', 3, 'Ez egy egyéni felhasználói beállítás');
```

### 2. Add Preference Definition

```sql
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, group_name, is_user_editable, scope, sort_order)
VALUES
(1, 'ui.custom_setting', 'pref_custom_name', 'pref_custom_desc', 'string', 'default', 'appearance', TRUE, 'user', 70);
```

### 3. Use in Frontend

```typescript
// Automatically available via store
const customValue = usePreference('ui.custom_setting', 'default');
```

---

## Extensibility Features

### 1. Validation Rules (JSON)

Define validation in `validation_rules` column:

```json
{
  "enum": ["light", "dark", "auto"],
  "min": 10,
  "max": 100,
  "pattern": "^[a-z0-9]+$"
}
```

Frontend can use this to:
- Render select dropdowns for enums
- Validate number ranges
- Validate string patterns

### 2. Extended JSON Preferences

For dynamic, rarely-used settings:

```typescript
// Store arbitrary JSON data
await preferencesApi.updateUserPreferencesExtended(userId, 'ui', {
  custom_color: '#FF5733',
  sidebar_width: 250,
  show_tooltips: true,
  widget_positions: { widget1: { x: 10, y: 20 } },
});
```

### 3. System-Wide Preferences

Set `scope = 'system'` for admin-only preferences:

```sql
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, is_user_editable, scope)
VALUES
(2, 'api.max_request_size', 'pref_api_max_size', 'pref_api_max_size_desc', 'number', '10485760', FALSE, 'system');
```

---

## Migration from Existing Stores

### Migrate languageStore

**Old (languageStore.ts):**
```typescript
const { language, setLanguage } = useLanguageStore();
```

**New (preferencesStore.ts):**
```typescript
const language = usePreference('ui.language', 1);
const updatePreference = useUpdatePreference();

// Update
await updatePreference('ui.language', newLanguageId);
```

### Migrate themeStore

**Old:**
```typescript
const { theme, setTheme } = useThemeStore();
```

**New:**
```typescript
const theme = usePreference('ui.theme', 'light');
await updatePreference('ui.theme', 'dark');
```

---

## Audit Trail & Compliance

All preference changes are logged to `preference_audits` table:

```sql
-- View audit trail for a user
SELECT
  pa.*,
  pd.key_name,
  dn.text as preference_name,
  u.username as changed_by_username
FROM preference_audits pa
LEFT JOIN preference_definitions pd ON pd.id = pa.preference_definition_id
LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = 1
LEFT JOIN users u ON u.id = pa.changed_by
WHERE pa.user_id = 123
ORDER BY pa.changed_at DESC;
```

**Captured Data:**
- User ID
- Preference definition
- Old and new values
- Who made the change
- When it was changed
- IP address
- User agent

---

## Performance Considerations

### Indexing

All critical indexes are already defined in the schema:

- `preference_categories`: code, is_active, description_code
- `preference_definitions`: key_name, category_id, group_name, scope
- `user_preferences`: (user_id, preference_definition_id) UNIQUE, user_id, preference_definition_id
- `user_preferences_extended`: (user_id, namespace) UNIQUE

### Caching Strategy

The frontend Zustand store provides:
- **localStorage persistence** - Survives page reloads
- **Optimistic updates** - Instant UI response
- **Timestamp tracking** - Know when to refetch
- **Error rollback** - Revert on API failure

### Query Optimization

```sql
-- Use covering index for common queries
SELECT pd.key_name, up.value
FROM user_preferences up
INNER JOIN preference_definitions pd ON pd.id = up.preference_definition_id
WHERE up.user_id = ? AND pd.key_name IN ('ui.theme', 'ui.language');
```

---

## Troubleshooting

### Problem: Preferences not loading

**Check:**
1. Are the database tables created? `SHOW TABLES LIKE 'preference_%';`
2. Is seed data inserted? `SELECT COUNT(*) FROM preference_definitions;`
3. Are n8n endpoints deployed and accessible?
4. Check browser console for API errors

### Problem: Translations not showing

**Check:**
1. Translation entries exist: `SELECT * FROM translations WHERE code LIKE 'pref_%' AND language_id = 1;`
2. Language ID is correct: `language_id = 1` (English), `2` (German), `3` (Hungarian)
3. JOIN clauses include language_id in SQL queries

### Problem: Updates not persisting

**Check:**
1. JWT token is valid
2. User ID matches authenticated user
3. n8n workflow returns success response
4. Check `preference_audits` table for failed attempts

---

## Security Considerations

### Authorization

- ✅ Users can only access/modify their own preferences
- ✅ Admin users can manage system-wide preferences
- ✅ JWT token validation on all endpoints
- ✅ Audit trail for compliance

### Input Validation

- ✅ Data type validation (string, number, boolean, json, date)
- ✅ Validation rules (enum, min/max, pattern)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React escapes by default)

### Data Privacy

- ✅ User preferences are user-specific (no cross-user visibility)
- ✅ Audit trail includes IP and user agent for investigation
- ✅ Soft deletes preserve data integrity

---

## Future Enhancements

### Planned Features

- [ ] Preference groups/presets (save and load preference combinations)
- [ ] Import/export preferences (JSON download/upload)
- [ ] Role-based defaults (different defaults per user role)
- [ ] Preference templates (admin-defined starting points)
- [ ] Real-time sync (WebSocket updates across devices)
- [ ] Preference search/filter in UI
- [ ] Bulk admin operations (set preferences for multiple users)

### API Versioning

If breaking changes are needed:
- Create new endpoints: `/api/v2/preferences/*`
- Maintain v1 for backward compatibility
- Deprecation timeline: 6 months minimum

---

## Support & Documentation

### Related Files

- **Schema**: [Docs/preferences_schema.sql](preferences_schema.sql)
- **Seed Data**: [Docs/preferences_seed_data.sql](preferences_seed_data.sql)
- **API Docs**: [Docs/PREFERENCES_API_ENDPOINTS.md](PREFERENCES_API_ENDPOINTS.md)
- **Frontend API**: [frontend/src/lib/api/preferences.ts](../frontend/src/lib/api/preferences.ts)
- **Store**: [frontend/src/store/preferencesStore.ts](../frontend/src/store/preferencesStore.ts)
- **UI**: [frontend/src/app/settings/page.tsx](../frontend/src/app/settings/page.tsx)
- **Types**: [frontend/src/types/entities.ts](../frontend/src/types/entities.ts)

### Additional Resources

- [MySQL JSON Data Type](https://dev.mysql.com/doc/refman/8.0/en/json.html)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [n8n Workflow Documentation](https://docs.n8n.io/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-19 | Initial release with full implementation |

---

## License

This preferences system is part of the Office Application and follows the same license.

---

**Questions or Issues?** Check the [troubleshooting section](#troubleshooting) or refer to [PREFERENCES_API_ENDPOINTS.md](PREFERENCES_API_ENDPOINTS.md) for detailed API documentation.
