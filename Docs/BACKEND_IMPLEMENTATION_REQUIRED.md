# Backend Implementation Required - Unified Object Relations System

**Date:** 2026-01-10
**Status:** Frontend Complete - Backend Implementation Needed

## Overview

The frontend for the unified object relations system is complete and ready, but it cannot function until the following n8n webhook endpoints are implemented. All SQL queries and request/response formats are documented in [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md).

## Critical: Relations Tab Not Working

**Issue:** The Relations tab on Persons and Companies pages shows UI but makes API calls that return errors because the endpoints don't exist yet.

**Impact:** Users see loading states or errors when clicking the Relations tab.

**Solution:** Implement the endpoints listed below in n8n.

---

## Required n8n Webhook Endpoints

### Priority 1: Core CRUD Operations (Required for basic functionality)

These endpoints are **critical** for the Relations tab to work at all:

#### 1. Get Relations by Object ID
- **Endpoint:** `GET /api/v1/objects/{object_id}/relations`
- **Used by:** Persons page, Companies page (loads relations when entity is selected)
- **Status:** ❌ Not implemented
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #55 (MODIFIED - see below)
- **n8n Webhook:** Main API webhook (`d35779a0-d5b1-438f-be5e-52f7b29be868`)

**CRITICAL REQUIREMENT: Enhanced SQL Query**

The frontend requires `object_from_name`, `object_to_name`, `object_from_type_id`, and `object_to_type_id` fields. Use this enhanced query:

```sql
SELECT
    or_rel.id,
    or_rel.object_from_id,
    or_rel.object_to_id,
    or_rel.object_relation_type_id,
    or_rel.note,
    or_rel.is_active,
    or_rel.created_at,
    or_rel.updated_at,
    or_rel.created_by,
    -- Object FROM details
    obj_from.object_type_id as object_from_type_id,
    CASE obj_from.object_type_id
        WHEN 1 THEN (SELECT CONCAT(p.first_name, ' ', p.last_name) FROM persons p WHERE p.id = obj_from.id)
        WHEN 2 THEN (SELECT c.company_name FROM companies c WHERE c.id = obj_from.id)
        WHEN 3 THEN (SELECT u.username FROM users u WHERE u.id = obj_from.id)
        ELSE CONCAT('Object #', obj_from.id)
    END as object_from_name,
    -- Object TO details
    obj_to.object_type_id as object_to_type_id,
    CASE obj_to.object_type_id
        WHEN 1 THEN (SELECT CONCAT(p.first_name, ' ', p.last_name) FROM persons p WHERE p.id = obj_to.id)
        WHEN 2 THEN (SELECT c.company_name FROM companies c WHERE c.id = obj_to.id)
        WHEN 3 THEN (SELECT u.username FROM users u WHERE u.id = obj_to.id)
        ELSE CONCAT('Object #', obj_to.id)
    END as object_to_name
FROM object_relations or_rel
INNER JOIN objects obj_from ON obj_from.id = or_rel.object_from_id
INNER JOIN objects obj_to ON obj_to.id = or_rel.object_to_id
WHERE or_rel.is_active = 1
    AND (or_rel.object_from_id = {{ $json.params.object_id }} OR or_rel.object_to_id = {{ $json.params.object_id }})
ORDER BY or_rel.created_at DESC;
```

**Request Example:**
```bash
GET /api/v1/objects/123/relations
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_from_id": 123,
      "object_to_id": 456,
      "object_relation_type_id": 5,
      "note": "Employee relationship",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "created_by": 1,
      "object_from_type_id": 1,
      "object_from_name": "John Doe",
      "object_to_type_id": 4,
      "object_to_name": "Contract Agreement 2024"
    }
  ]
}
```

**Important Notes:**
- The `object_from_name` and `object_to_name` fields are **computed based on object type**
- Person: `CONCAT(first_name, ' ', last_name)`
- Company: `company_name`
- User: `username`
- Document: Falls back to `'Object #' + id` (needs document table if available)
- These fields are **required** for the UI to display meaningful names instead of "Object #123"

---

#### 2. Create Object Relation
- **Endpoint:** `POST /api/v1/object-relations`
- **Used by:** AddRelationModal (when user clicks "Create Relation")
- **Status:** ✅ May already exist (verify it works)
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #57
- **n8n Webhook:** Main API webhook

**Request Body:**
```json
{
  "object_from_id": 123,
  "object_to_id": 456,
  "object_relation_type_id": 5,
  "note": "Employee relationship"
}
```

---

#### 3. Update Object Relation Note (POST Method)
- **Endpoint:** `POST /api/v1/object-relations/{id}`
- **Used by:** ObjectRelationsTable (inline note editing)
- **Status:** ❌ Not implemented
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #60
- **n8n Webhook:** Main API webhook
- **Important:** Uses POST method (not PUT), follows old/new value pattern

**Request Body:**
```json
{
  "note_old": "Previous note",
  "note_new": "Updated note"
}
```

---

#### 4. Delete Object Relation (POST Method)
- **Endpoint:** `POST /api/v1/object-relations/{id}/delete`
- **Used by:** ObjectRelationsTable (when user clicks delete)
- **Status:** ❌ Not implemented
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #61
- **n8n Webhook:** Main API webhook
- **Important:** Soft delete (sets is_active = 0), uses POST method

**Request Body:**
```json
{
  "id": 123
}
```

---

### Priority 2: Universal Object Search (Required for creating relations)

#### 5. Universal Object Search
- **Endpoint:** `POST /api/v1/objects/search`
- **Used by:** AdvancedObjectSearchModal (search for objects to relate)
- **Status:** ❌ Not implemented
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #62
- **n8n Webhook:** Main API webhook
- **Important:** Must return `display_name` computed field

**Request Body:**
```json
{
  "query": "john",
  "object_type_ids": [1, 2],
  "page": 1,
  "per_page": 20
}
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "object_type_id": 1,
      "object_status_id": 1,
      "object_type_name": "Person",
      "display_name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Important Notes:**
- `display_name` must be computed based on object type:
  - Person: `CONCAT(first_name, ' ', last_name)`
  - Company: `company_name`
  - User: `username`
- `object_type_name` comes from the translations table

---

### Priority 3: Bulk Operations (Future enhancement - not critical)

These are implemented in the frontend but not currently used in the UI. Can be implemented later:

#### 6. Bulk Delete Relations
- **Endpoint:** `POST /api/v1/relations/bulk/delete`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #63
- **Status:** ❌ Not implemented

#### 7. Bulk Reassign Relations
- **Endpoint:** `POST /api/v1/relations/bulk/reassign`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #64
- **Status:** ❌ Not implemented

#### 8. Bulk Update Relation Type
- **Endpoint:** `POST /api/v1/relations/bulk/update-type`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #65
- **Status:** ❌ Not implemented

---

### Priority 4: Data Quality (Future enhancement - not critical)

These are for the Relations Manager page (not yet built):

#### 9. Get Orphaned Relations
- **Endpoint:** `POST /api/v1/relations/data-quality/orphaned`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #66
- **Status:** ❌ Not implemented

#### 10. Get Duplicate Relations
- **Endpoint:** `POST /api/v1/relations/data-quality/duplicates`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #67
- **Status:** ❌ Not implemented

#### 11. Get Invalid Relations
- **Endpoint:** `POST /api/v1/relations/data-quality/invalid`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #68
- **Status:** ❌ Not implemented

#### 12. Get Missing Mirror Relations
- **Endpoint:** `POST /api/v1/relations/data-quality/missing-mirrors`
- **SQL Query:** See API_ENDPOINTS_REFERENCE.md #69
- **Status:** ❌ Not implemented

---

## Implementation Checklist

To make the Relations tab functional, implement these endpoints **in order**:

### Phase 1: Minimum Viable Product (MVP)
- [ ] **Endpoint #55**: `GET /api/v1/objects/{object_id}/relations` - Load relations
- [ ] **Endpoint #57**: `POST /api/v1/object-relations` - Create relation (verify existing)
- [ ] **Endpoint #62**: `POST /api/v1/objects/search` - Search objects
- [ ] **Endpoint #60**: `POST /api/v1/object-relations/{id}` - Update note
- [ ] **Endpoint #61**: `POST /api/v1/object-relations/{id}/delete` - Delete relation

**After Phase 1:** Relations tab will be fully functional on Persons and Companies pages.

### Phase 2: Bulk Operations (Optional)
- [ ] **Endpoint #63**: Bulk delete
- [ ] **Endpoint #64**: Bulk reassign
- [ ] **Endpoint #65**: Bulk update type

### Phase 3: Data Quality (Optional)
- [ ] **Endpoint #66**: Orphaned relations
- [ ] **Endpoint #67**: Duplicate relations
- [ ] **Endpoint #68**: Invalid relations
- [ ] **Endpoint #69**: Missing mirror relations

---

## n8n Implementation Details

### Which Webhook to Use

**Main API Webhook:**
```
https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1
```

All new object relations endpoints should be added to this webhook.

### n8n Workflow Pattern

For each endpoint, the n8n workflow should:

1. **Webhook Node**: Capture HTTP request
2. **Function Node**: Parse request parameters/body
3. **MySQL Node**: Execute SQL query from API_ENDPOINTS_REFERENCE.md
4. **Function Node**: Format response
5. **Respond to Webhook**: Return JSON response

### Response Format Standard

All endpoints must return this format:

**Success:**
```json
{
  "success": true,
  "data": [...] // or single object
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Language Support

**CRITICAL:** The frontend sends `language_id` in ALL requests:

- **GET/DELETE requests**: `language_id` is sent in the `X-Language-ID` HTTP header
- **POST/PUT/PATCH requests**: `language_id` is sent in the request body

**How to read language_id in n8n:**

For GET requests:
```javascript
// In n8n Function node, read from headers
const languageId = $input.first().json.headers['x-language-id'] || 1;
```

For POST requests:
```javascript
// In n8n Function node, read from body
const languageId = $input.first().json.body.language_id || 1;
```

**Use language_id to:**
- Join with translations table for relation type names
- Return translated lookup values
- Get translated object type names

**Example SQL using language_id for translated relation type names:**
```sql
SELECT
    or_rel.*,
    t.text as relation_type_name
FROM object_relations or_rel
LEFT JOIN object_relation_types ort ON ort.id = or_rel.object_relation_type_id
LEFT JOIN translations t ON t.code = ort.code AND t.language_id = {{ $headers['x-language-id'] }}
WHERE ...
```

---

## Testing the Implementation

### 1. Test Get Relations by Object ID

```bash
curl -X GET \
  'http://localhost:5678/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/objects/1/relations' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Expected: List of relations for object ID 1

### 2. Test Create Relation

```bash
curl -X POST \
  'http://localhost:5678/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-relations' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "object_from_id": 1,
    "object_to_id": 2,
    "object_relation_type_id": 1,
    "note": "Test relation"
  }'
```

Expected: Created relation object

### 3. Test Universal Search

```bash
curl -X POST \
  'http://localhost:5678/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/objects/search' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "test",
    "object_type_ids": [1, 2],
    "page": 1,
    "per_page": 20
  }'
```

Expected: List of objects with `display_name` field

---

## Common Implementation Issues

### Issue 1: Missing display_name in Search Results

**Problem:** Frontend expects `display_name` field but backend returns null

**Solution:** Use CASE statement in SQL to compute display name:
```sql
CASE o.object_type_id
  WHEN 1 THEN (SELECT CONCAT(p.first_name, ' ', p.last_name) FROM persons p WHERE p.id = o.id)
  WHEN 2 THEN (SELECT c.company_name FROM companies c WHERE c.id = o.id)
  ELSE CONCAT('Object #', o.id)
END as display_name
```

### Issue 2: Old/New Value Pattern Not Working

**Problem:** Update endpoint expects direct field updates, not old/new pattern

**Solution:** In n8n workflow, verify old value matches before updating:
```sql
UPDATE object_relations
SET note = {{ $json.body.note_new }}
WHERE id = {{ $json.params.id }}
  AND note = {{ $json.body.note_old }}
```

### Issue 3: POST Method for Updates/Deletes

**Problem:** Using PUT/DELETE methods instead of POST

**Solution:** This project uses POST for ALL operations. Update endpoints are POST, delete endpoints are POST with `/delete` suffix.

---

## Frontend Integration Points

### How Frontend Calls These Endpoints

**Load Relations:**
```typescript
const response = await objectRelationApi.getByObjectId(personId);
// Calls: GET /api/v1/objects/{personId}/relations
```

**Create Relation:**
```typescript
await objectRelationApi.create({
  object_from_id: personId,
  object_to_id: companyId,
  object_relation_type_id: 1,
  note: "Employee"
});
// Calls: POST /api/v1/object-relations
```

**Update Note:**
```typescript
await objectRelationApi.updateNote(relationId, "old note", "new note");
// Calls: POST /api/v1/object-relations/{relationId}
// Body: { note_old: "old note", note_new: "new note" }
```

**Delete Relation:**
```typescript
await objectRelationApi.deleteRelation(relationId);
// Calls: POST /api/v1/object-relations/{relationId}/delete
// Body: { id: relationId }
```

**Search Objects:**
```typescript
const response = await objectRelationApi.searchObjects({
  query: "john",
  object_type_ids: [1, 2],
  page: 1,
  per_page: 20
});
// Calls: POST /api/v1/objects/search
```

---

## Questions?

If you have questions about any endpoint implementation:
1. Check the detailed SQL queries in [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md)
2. Review the request/response examples in this document
3. Check the frontend implementation in:
   - `frontend/src/lib/api/objectRelations.ts` - API client methods
   - `frontend/src/app/persons/page.tsx` - Usage example
   - `frontend/src/app/companies/page.tsx` - Usage example

---

## Success Criteria

The implementation is complete when:
- [ ] Relations tab on Persons page loads relations without errors
- [ ] Relations tab on Companies page loads relations without errors
- [ ] Users can create new relations via AddRelationModal
- [ ] Users can search for objects to relate
- [ ] Users can edit relation notes inline
- [ ] Users can delete relations
- [ ] All operations show proper success/error messages

**Estimated Backend Implementation Time:** 4-6 hours for Phase 1 (MVP)
