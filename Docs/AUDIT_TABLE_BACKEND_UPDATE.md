# Backend Update Required for Audit Table

## Issues Fixed

### 1. Missing Usernames in "LÉTREHOZTA" Column ✅ (Backend Update Required)
The frontend audit table is displaying "-" in the "LÉTREHOZTA" (Created By) column instead of showing usernames from the users table.

### 2. Missing Audit Action Names in "MŰVELET" Column ✅ (Fixed in Frontend)
The audit actions are now being loaded from the API and displayed correctly.

## Root Cause
The backend n8n workflow that fetches audit records is not joining with the `users` table to retrieve the `username` field.

## Current Behavior
- The `object_audits` table has a `created_by` field that stores the user's object ID
- The frontend receives only the numeric `created_by` value (e.g., `created_by: 123`)
- The frontend TypeScript interface expects `created_by_username?: string` field

## Required Backend Changes

### 1. Update n8n Workflow Query
The n8n workflow that handles the `GET /api/v1/object-audits/object/:object_id` endpoint needs to be updated.

**Current Query (incorrect):**
```sql
SELECT
    id,
    object_id,
    audit_action_id,
    created_by,
    created_at,
    old_values,
    new_values,
    ip_address,
    user_agent,
    notes
FROM object_audits
WHERE object_id = ?
ORDER BY created_at DESC;
```

**Updated Query (correct):**
```sql
SELECT
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    u.username AS created_by_username,  -- ← ADD THIS FIELD
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
LEFT JOIN users u ON u.id = oa.created_by  -- ← ADD THIS JOIN
WHERE oa.object_id = ?
ORDER BY oa.created_at DESC;
```

### 2. Database Relationships
The join works because:
- `object_audits.created_by` → references `objects.id`
- `users.id` → also references `objects.id`
- Therefore: `object_audits.created_by = users.id`

### 3. Implementation Files
The following files have been created to help with the backend update:

1. **[n8n_object_audits_query.sql](./n8n_object_audits_query.sql)**
   - Contains the corrected SQL query with examples
   - Shows filtering and pagination options

2. **[n8n_object_audits_node_code.js](./n8n_object_audits_node_code.js)**
   - Complete n8n Code node implementation
   - Handles parameters from webhook/query
   - Builds the SQL query dynamically
   - Includes validation and error handling

## Frontend Changes (Already Completed)

The frontend has been updated to:
1. ✅ Added `created_by_username?: string` field to `ObjectAudit` TypeScript type
2. ✅ Updated `AuditsTable` component to display `created_by_username` in the "LÉTREHOZTA" column
3. ✅ Added visible columns for `old_values`, `new_values`, and `notes`
4. ✅ All translations are in place (en, de, hu)

## Testing

After updating the backend, verify:
1. Navigate to `/employees` page (or any page with audits tab)
2. Click on a person record to view details
3. Switch to the "Auditok" tab
4. Verify the "LÉTREHOZTA" column shows usernames instead of "-"
5. Verify "RÉGI ÉRTÉKEK", "ÚJ ÉRTÉKEK", and "MEGJEGYZÉSEK" columns are visible and populated

## Example API Response

**Before (incorrect):**
```json
{
  "success": true,
  "data": [
    {
      "id": 79,
      "object_id": 8,
      "audit_action_id": 1,
      "created_by": 123,
      "created_at": "2025-12-29 21:04:29",
      "old_values": null,
      "new_values": {"status": "active"},
      "notes": null
    }
  ]
}
```

**After (correct):**
```json
{
  "success": true,
  "data": [
    {
      "id": 79,
      "object_id": 8,
      "audit_action_id": 1,
      "created_by": 123,
      "created_by_username": "admin",  ← NEW FIELD
      "created_at": "2025-12-29 21:04:29",
      "old_values": null,
      "new_values": {"status": "active"},
      "notes": null
    }
  ]
}
```

## Priority
**HIGH** - This blocks the audit trail functionality from being fully usable.
