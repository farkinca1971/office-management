# Audit Actions for Lookup Table Creation

This document describes the audit actions created for tracking when users create items in lookup/reference data tables.

## Overview

Audit actions have been created for all lookup table types following the pattern:
```
USER_CREATE_{LOOKUP_TYPE}
```

Where `{LOOKUP_TYPE}` is the uppercase table name with underscores.

## Created Audit Actions

All audit actions are scoped to the `user` object type, as these are user-initiated actions.

### Complete List

| Audit Action Code | Lookup Table | Description |
|------------------|--------------|-------------|
| `USER_CREATE_LANGUAGES` | `languages` | User creates a language |
| `USER_CREATE_OBJECT_TYPES` | `object_types` | User creates an object type |
| `USER_CREATE_OBJECT_STATUSES` | `object_statuses` | User creates an object status |
| `USER_CREATE_SEXES` | `sexes` | User creates a sex/gender option |
| `USER_CREATE_SALUTATIONS` | `salutations` | User creates a salutation |
| `USER_CREATE_PRODUCT_CATEGORIES` | `product_categories` | User creates a product category |
| `USER_CREATE_COUNTRIES` | `countries` | User creates a country |
| `USER_CREATE_ADDRESS_TYPES` | `address_types` | User creates an address type |
| `USER_CREATE_ADDRESS_AREA_TYPES` | `address_area_types` | User creates an address area type |
| `USER_CREATE_CONTACT_TYPES` | `contact_types` | User creates a contact type |
| `USER_CREATE_TRANSACTION_TYPES` | `transaction_types` | User creates a transaction type |
| `USER_CREATE_CURRENCIES` | `currencies` | User creates a currency |
| `USER_CREATE_OBJECT_RELATION_TYPES` | `object_relation_types` | User creates an object relation type |

## Translations

Each audit action has translations in three languages:

### English (en)
- `USER_CREATE_LANGUAGES`: "User Create Language"
- `USER_CREATE_OBJECT_TYPES`: "User Create Object Type"
- `USER_CREATE_OBJECT_STATUSES`: "User Create Object Status"
- `USER_CREATE_SEXES`: "User Create Sex"
- `USER_CREATE_SALUTATIONS`: "User Create Salutation"
- `USER_CREATE_PRODUCT_CATEGORIES`: "User Create Product Category"
- `USER_CREATE_COUNTRIES`: "User Create Country"
- `USER_CREATE_ADDRESS_TYPES`: "User Create Address Type"
- `USER_CREATE_ADDRESS_AREA_TYPES`: "User Create Address Area Type"
- `USER_CREATE_CONTACT_TYPES`: "User Create Contact Type"
- `USER_CREATE_TRANSACTION_TYPES`: "User Create Transaction Type"
- `USER_CREATE_CURRENCIES`: "User Create Currency"
- `USER_CREATE_OBJECT_RELATION_TYPES`: "User Create Object Relation Type"

### German (de)
- `USER_CREATE_LANGUAGES`: "Benutzer erstellt Sprache"
- `USER_CREATE_OBJECT_TYPES`: "Benutzer erstellt Objekttyp"
- `USER_CREATE_OBJECT_STATUSES`: "Benutzer erstellt Objektstatus"
- `USER_CREATE_SEXES`: "Benutzer erstellt Geschlecht"
- `USER_CREATE_SALUTATIONS`: "Benutzer erstellt Anrede"
- `USER_CREATE_PRODUCT_CATEGORIES`: "Benutzer erstellt Produktkategorie"
- `USER_CREATE_COUNTRIES`: "Benutzer erstellt Land"
- `USER_CREATE_ADDRESS_TYPES`: "Benutzer erstellt Adresstyp"
- `USER_CREATE_ADDRESS_AREA_TYPES`: "Benutzer erstellt Adressbereichstyp"
- `USER_CREATE_CONTACT_TYPES`: "Benutzer erstellt Kontakttyp"
- `USER_CREATE_TRANSACTION_TYPES`: "Benutzer erstellt Transaktionstyp"
- `USER_CREATE_CURRENCIES`: "Benutzer erstellt Währung"
- `USER_CREATE_OBJECT_RELATION_TYPES`: "Benutzer erstellt Objektbeziehungstyp"

### Hungarian (hu)
- `USER_CREATE_LANGUAGES`: "Felhasználó nyelv létrehozása"
- `USER_CREATE_OBJECT_TYPES`: "Felhasználó objektumtípus létrehozása"
- `USER_CREATE_OBJECT_STATUSES`: "Felhasználó objektumstátusz létrehozása"
- `USER_CREATE_SEXES`: "Felhasználó nem létrehozása"
- `USER_CREATE_SALUTATIONS`: "Felhasználó megszólítás létrehozása"
- `USER_CREATE_PRODUCT_CATEGORIES`: "Felhasználó termékkategória létrehozása"
- `USER_CREATE_COUNTRIES`: "Felhasználó ország létrehozása"
- `USER_CREATE_ADDRESS_TYPES`: "Felhasználó címtípus létrehozása"
- `USER_CREATE_ADDRESS_AREA_TYPES`: "Felhasználó címterülettípus létrehozása"
- `USER_CREATE_CONTACT_TYPES`: "Felhasználó kapcsolattípus létrehozása"
- `USER_CREATE_TRANSACTION_TYPES`: "Felhasználó tranzakciótípus létrehozása"
- `USER_CREATE_CURRENCIES`: "Felhasználó pénznem létrehozása"
- `USER_CREATE_OBJECT_RELATION_TYPES`: "Felhasználó objektumkapcsolat-típus létrehozása"

## Usage in n8n Workflows

### Getting Audit Action ID

To get the audit action ID for a specific lookup table type:

```sql
SELECT id FROM audit_actions 
WHERE code = 'USER_CREATE_OBJECT_TYPES' 
AND is_active = 1;
```

### Creating Audit Log Entry

When a user creates a lookup item, you should create an audit log entry:

```sql
INSERT INTO object_audits (
    object_id,
    audit_action_id,
    created_by,
    new_values,
    ip_address,
    user_agent,
    created_at
) VALUES (
    NULL, -- Lookup items don't have object_id
    (SELECT id FROM audit_actions WHERE code = 'USER_CREATE_OBJECT_TYPES'),
    {{ $json.user_id }}, -- Current user ID
    JSON_OBJECT('code', '{{ $json.body.code }}', 'is_active', {{ $json.body.is_active }}),
    '{{ $json.headers.x-forwarded-for }}',
    '{{ $json.headers.user-agent }}',
    NOW()
);
```

### Dynamic Audit Action Selection

In n8n, you can dynamically select the audit action based on lookup type:

```javascript
// In a Code node
const lookupType = $json.params.lookup_type; // e.g., 'object-types'
const normalizedType = lookupType.replace(/-/g, '_').toUpperCase();
const auditActionCode = `USER_CREATE_${normalizedType}`;

// Then use in SQL query
return {
  json: {
    audit_action_code: auditActionCode,
    // ... other data
  }
};
```

## SQL Queries

### Get All Lookup Creation Audit Actions

```sql
SELECT 
    aa.id,
    aa.code,
    aa.is_active,
    ot.code as object_type,
    t_en.text as name_en,
    t_de.text as name_de,
    t_hu.text as name_hu
FROM audit_actions aa
JOIN object_types ot ON ot.id = aa.object_type_id
LEFT JOIN translations t_en ON t_en.code = aa.code AND t_en.language_id = (SELECT id FROM languages WHERE code = 'en')
LEFT JOIN translations t_de ON t_de.code = aa.code AND t_de.language_id = (SELECT id FROM languages WHERE code = 'de')
LEFT JOIN translations t_hu ON t_hu.code = aa.code AND t_hu.language_id = (SELECT id FROM languages WHERE code = 'hu')
WHERE aa.code LIKE 'USER_CREATE_%'
ORDER BY aa.code;
```

### Get Audit Action for Specific Lookup Type

```sql
SELECT id, code 
FROM audit_actions 
WHERE code = 'USER_CREATE_OBJECT_TYPES' 
AND is_active = 1;
```

## Integration with n8n CREATE Workflow

To integrate audit logging into your n8n CREATE workflow:

1. **After successful insert**, add a Code node to determine the audit action:

```javascript
const lookupType = $('create queries').item.json.lookup_type;
const normalizedType = lookupType.replace(/_/g, '_').toUpperCase();
const auditActionCode = `USER_CREATE_${normalizedType}`;

return {
  json: {
    audit_action_code: auditActionCode,
    lookup_type: lookupType,
    created_code: $('create queries').item.json.code,
    user_id: $('Create Lookup').item.json.headers?.authorization ? extractUserId($('Create Lookup').item.json.headers.authorization) : null
  }
};
```

2. **Add MySQL node** to insert audit log:

```sql
INSERT INTO object_audits (
    object_id,
    audit_action_id,
    created_by,
    new_values,
    ip_address,
    user_agent,
    created_at
) VALUES (
    NULL,
    (SELECT id FROM audit_actions WHERE code = '{{ $json.audit_action_code }}'),
    {{ $json.user_id }},
    JSON_OBJECT('code', '{{ $json.created_code }}'),
    '{{ $('Create Lookup').item.json.headers.x-forwarded-for }}',
    '{{ $('Create Lookup').item.json.headers.user-agent }}',
    NOW()
);
```

## Related Documentation

- [Audit Actions Structure](./01_schema.sql) - Database schema
- [Seed Data](./02_seed_data.sql) - Audit actions seed data
- [n8n Lookup Create Node](./n8n_lookup_create_node_setup.md) - CREATE workflow setup
- [API Endpoints Reference](./API_ENDPOINTS_REFERENCE.md) - Complete API documentation

