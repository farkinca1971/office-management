# Contacts GET Endpoint - n8n Implementation Guide

## Overview

This guide explains how to implement the GET endpoint for contacts that supports filtering by active status and contact type, with proper support for fetching ALL contacts (including inactive ones).

## Endpoint

```
GET /api/v1/objects/:object_id/contacts
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `object_id` | number | Yes (URL param) | The ID of the object (person, company, etc.) |
| `is_active` | boolean | No | Filter by active status. If omitted, returns ALL contacts |
| `contact_type_id` | number | No | Filter by contact type ID |
| `language_id` | number | No | Language for translations (default: 1 = English) |

## Filter Behavior

**CRITICAL**: The `is_active` parameter behavior:

- **`is_active` NOT provided** (empty/null/undefined) → Returns ALL contacts (both active AND inactive)
- **`is_active=true`** → Returns only active contacts
- **`is_active=false`** → Returns only inactive contacts

This allows the frontend to:
1. Fetch all contacts initially
2. Apply client-side filtering based on user selection
3. Support "All", "Active", and "Inactive" filter options

## n8n Workflow Setup

### Node 1: Webhook Trigger

**Type**: `Webhook`
**Settings**:
- HTTP Method: `GET`
- Path: `/api/v1/objects/:object_id/contacts`
- Response Mode: `Response Node`

### Node 2: Build Query (Set Node)

**Type**: `Set`
**Mode**: `Run Once for All Items`
**Language**: `JavaScript`

**Code**:
```javascript
// Get parameters from the HTTP request
const objectId = $json.params.object_id;
const isActiveParam = $json.query.is_active;
const contactTypeId = $json.query.contact_type_id;
const languageId = $json.query.language_id || 1;

// Base SQL query with JOIN to get contact type name
let sql = `
  SELECT
    oc.id,
    oc.object_id,
    oc.contact_type_id,
    oc.contact_value,
    oc.is_active,
    oc.created_at,
    oc.updated_at,
    oc.created_by,
    ct.code as contact_type_code,
    COALESCE(
      (SELECT text FROM translations
       WHERE code = ct.code
       AND language_id = ${languageId}
       LIMIT 1),
      ct.code
    ) as contact_type_name
  FROM object_contacts oc
  LEFT JOIN contact_types ct ON oc.contact_type_id = ct.id
  WHERE oc.object_id = ${objectId}
`;

// Build additional WHERE conditions
const conditions = [];

// IMPORTANT: Only filter by is_active if explicitly provided
if (isActiveParam !== undefined && isActiveParam !== null && isActiveParam !== '') {
  const isActive = isActiveParam === true || isActiveParam === 'true' || isActiveParam === '1';
  conditions.push(`oc.is_active = ${isActive ? 'TRUE' : 'FALSE'}`);
}

// Filter by contact type if provided
if (contactTypeId !== undefined && contactTypeId !== null && contactTypeId !== '') {
  conditions.push(`oc.contact_type_id = ${contactTypeId}`);
}

// Add conditions to query
if (conditions.length > 0) {
  sql += ' AND ' + conditions.join(' AND ');
}

// Add ordering
sql += ' ORDER BY oc.created_at DESC';

// Return query configuration
return {
  query: sql,
  object_id: objectId
};
```

### Node 3: Execute Query (PostgreSQL Node)

**Type**: `PostgreSQL`
**Operation**: `Execute Query`
**Query**: `={{ $json.query }}`

### Node 4: Format Response (Set Node)

**Type**: `Set`
**Mode**: `Run Once for All Items`
**Language**: `JavaScript`

**Code**:
```javascript
// Get all contacts from the query result
const contacts = $input.all().map(item => item.json);

// Return standardized API response
return {
  success: true,
  data: contacts,
  meta: {
    total: contacts.length,
    object_id: parseInt($('Build Query').item.json.object_id)
  }
};
```

### Node 5: Response - Success (Respond to Webhook)

**Type**: `Respond to Webhook`
**Settings**:
- Response Body: `={{ $json }}`
- Response Code: `200`
- Headers:
  - `Content-Type: application/json`

### Error Handling Branch

**Node 6: Error Handler (Set Node)**

Connect from `Execute Query` error output.

**Code**:
```javascript
return {
  success: false,
  error: {
    code: 'DATABASE_ERROR',
    message: $json.message || 'Failed to fetch contacts',
    details: $json
  }
};
```

**Node 7: Response - Error (Respond to Webhook)**

**Settings**:
- Response Body: `={{ $json }}`
- Response Code: `500`
- Headers:
  - `Content-Type: application/json`

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 8,
      "contact_type_id": 1,
      "contact_value": "farkaszoltan971@gmail.com",
      "is_active": true,
      "created_at": "2025-12-30T13:09:09.000Z",
      "updated_at": null,
      "created_by": null,
      "contact_type_code": "email",
      "contact_type_name": "E-mail"
    },
    {
      "id": 2,
      "object_id": 8,
      "contact_type_id": 2,
      "contact_value": "06302597874",
      "is_active": true,
      "created_at": "2025-12-30T15:15:37.000Z",
      "updated_at": null,
      "created_by": null,
      "contact_type_code": "mobile",
      "contact_type_name": "Mobiltelefon"
    },
    {
      "id": 3,
      "object_id": 8,
      "contact_type_id": 5,
      "contact_value": "@sssssss",
      "is_active": false,
      "created_at": "2025-12-30T15:17:21.000Z",
      "updated_at": "2025-12-30T15:20:00.000Z",
      "created_by": null,
      "contact_type_code": "twitter",
      "contact_type_name": "Twitter"
    }
  ],
  "meta": {
    "total": 3,
    "object_id": 8
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to fetch contacts",
    "details": {}
  }
}
```

## Example Requests

### Get ALL contacts (active AND inactive)

```bash
GET /api/v1/objects/8/contacts
```

or explicitly with empty parameter:

```bash
GET /api/v1/objects/8/contacts?is_active=
```

### Get only ACTIVE contacts

```bash
GET /api/v1/objects/8/contacts?is_active=true
```

### Get only INACTIVE contacts

```bash
GET /api/v1/objects/8/contacts?is_active=false
```

### Get contacts filtered by type

```bash
GET /api/v1/objects/8/contacts?contact_type_id=1
```

### Combined filters

```bash
GET /api/v1/objects/8/contacts?is_active=true&contact_type_id=1
```

## Frontend Integration

The frontend now calls:

```typescript
contactApi.getByObjectId(objectId, {})
```

This passes an empty params object, which means `is_active` is NOT sent to the backend, so the backend returns ALL contacts. The frontend then filters them client-side based on the user's filter selection.

## Testing

1. Create some contacts and mark some as inactive (soft delete)
2. Test the endpoint without `is_active` parameter → Should return ALL contacts
3. Test with `is_active=true` → Should return only active contacts
4. Test with `is_active=false` → Should return only inactive contacts
5. Verify the frontend filter works correctly with all three options

## Implementation Checklist

- [ ] Create new workflow in n8n or modify existing contacts GET endpoint
- [ ] Add all 7 nodes as described above
- [ ] Configure PostgreSQL credentials
- [ ] Test endpoint with Postman/curl
- [ ] Verify query returns inactive contacts when is_active is not provided
- [ ] Deploy workflow and test with frontend
- [ ] Confirm frontend filters work: "All", "Active", "Inactive"
