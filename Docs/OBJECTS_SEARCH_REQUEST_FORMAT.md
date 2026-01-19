# POST /api/v1/objects/search - Request Body Format

## Overview
The frontend now sends comprehensive context information to the objects search endpoint to enable smart filtering and relation-aware searches.

## Request Body Fields

### Always Sent (Required)
```json
{
  "page": 1,
  "per_page": 20
}
```
- **page**: Current page number (default: 1)
- **per_page**: Results per page (default: 20)

### Language Support (Auto-Added by Interceptor)
```json
{
  "language_id": 1
}
```
- **language_id**: Automatically added by the request interceptor
- Value: 1 (English), 2 (German), 3 (Hungarian)
- Read from languageStore in localStorage

### Optional Filter Fields
```json
{
  "query": "search text",
  "object_type_ids": [6, 7],
  "object_status_ids": [1]
}
```
- **query**: Search text to filter results (only sent if not empty)
- **object_type_ids**: Array of object type IDs to filter by (only sent if not empty)
- **object_status_ids**: Array of object status IDs to filter by (only sent if not empty)

### Relation Context Fields (NEW)
```json
{
  "current_object_id": 123,
  "relation_type_id": 5
}
```
- **current_object_id**: ID of the object selected in the datagrid above
  - Example: If viewing Person #123, this will be 123
  - Used to exclude already-related objects

- **relation_type_id**: ID of the selected relation type from the dropdown
  - Example: If "Document-File" relation is selected, this is the relation type ID
  - Used for relation-specific filtering

## Complete Example Request

### Scenario: User on Documents page wants to add a File relation

```json
POST /api/v1/objects/search
Content-Type: application/json

{
  "page": 1,
  "per_page": 50,
  "language_id": 1,
  "current_object_id": 42,
  "relation_type_id": 8,
  "object_type_ids": [7],
  "query": "contract"
}
```

**Context:**
- User is viewing Document #42
- Selected relation type: "Document-File" (ID: 8)
- Searching for files matching "contract"
- Frontend automatically filtered to object_type_id=7 (files only)

## Backend Processing

The backend can use these fields to:

1. **Exclude already-related objects**
   ```sql
   WHERE o.id NOT IN (
     SELECT object_to_id
     FROM object_relations
     WHERE object_from_id = {{ $json.body.current_object_id }}
       AND object_relation_type_id = {{ $json.body.relation_type_id }}
       AND is_active = 1
   )
   ```

2. **Validate relation type constraints**
   - Check if the relation type allows the specified object types
   - Prevent invalid relations from being created

3. **Apply language-specific translations**
   ```sql
   LEFT JOIN translations ot
     ON ot.code = ot_lookup.code
     AND ot.language_id = {{ $json.body.language_id }}
   ```

## Field Cleanup Logic

The frontend API client automatically:
- Removes fields with `undefined` values (not sent at all)
- Removes empty strings from `query` field
- Removes empty arrays from `object_type_ids` and `object_status_ids`
- Trims whitespace from `query` field

**Example:**
```typescript
// User input
{
  query: undefined,
  object_type_ids: [7],
  current_object_id: 42
}

// Actually sent to backend
{
  page: 1,
  per_page: 20,
  language_id: 1,
  object_type_ids: [7],
  current_object_id: 42
}
// Note: query is NOT sent (not "undefined" or null)
```

## Headers

In addition to the request body, the following headers are sent:

```
X-Language-ID: 1
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Code References

### Type Definition
[frontend/src/types/entities.ts:321-331](../frontend/src/types/entities.ts)

```typescript
export interface ObjectSearchRequest {
  query?: string;
  object_type_ids?: number[];
  object_status_ids?: number[];
  page?: number;
  per_page?: number;
  current_object_id?: number;        // ID of the object in the datagrid
  relation_type_id?: number;          // Selected relation type ID
  language_id?: number;               // Language ID (auto-added)
}
```

### API Client
[frontend/src/lib/api/objectRelations.ts:404-440](../frontend/src/lib/api/objectRelations.ts)

### Component Usage
[frontend/src/components/relations/AddRelationModal.tsx:104-137](../frontend/src/components/relations/AddRelationModal.tsx)

```typescript
const response = await objectRelationApi.searchObjects({
  query: query.trim() || undefined,
  object_type_ids: allowedTargetObjectTypeIds,
  page: 1,
  per_page: 50,
  current_object_id: currentObjectId,      // From modal props
  relation_type_id: selectedRelationTypeId, // From dropdown selection
});
```

## Testing

### Test 1: Search without filters
```bash
curl -X POST 'http://localhost:5678/webhook/.../api/v1/objects/search' \
  -H 'Content-Type: application/json' \
  -H 'X-Language-ID: 1' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "page": 1,
    "per_page": 20,
    "language_id": 1
  }'
```

### Test 2: Search with relation context
```bash
curl -X POST 'http://localhost:5678/webhook/.../api/v1/objects/search' \
  -H 'Content-Type: application/json' \
  -H 'X-Language-ID: 1' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "page": 1,
    "per_page": 50,
    "language_id": 1,
    "current_object_id": 42,
    "relation_type_id": 8,
    "object_type_ids": [7],
    "query": "contract"
  }'
```

### Test 3: Verify field cleanup
```javascript
// In browser console on AddRelationModal
objectRelationApi.searchObjects({
  query: '',  // Should NOT be sent
  object_type_ids: [],  // Should NOT be sent
  current_object_id: 123,  // WILL be sent
  relation_type_id: undefined  // Should NOT be sent
});

// Check Network tab - body should only contain:
// { page: 1, per_page: 20, language_id: 1, current_object_id: 123 }
```

---

**Last Updated**: 2026-01-11
**Status**: Implemented and ready for backend integration
