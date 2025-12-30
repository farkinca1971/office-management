# Contacts Endpoint Activation Guide

This guide provides step-by-step instructions to activate the contacts endpoint in your n8n workflow system.

## Overview

The contacts endpoint manages contact information (email, phone, social media, etc.) for any object in the system (persons, companies, employees, etc.).

**Base Path:** `/api/v1`

**Endpoints:**
- `GET /objects/:object_id/contacts` - List all contacts for an object
- `GET /contacts/:id` - Get single contact by ID
- `POST /objects/:object_id/contacts` - Create new contact
- `PUT /contacts/:id` - Update existing contact
- `DELETE /contacts/:id` - Soft delete contact

---

## Prerequisites

✅ **Database Table:** Ensure `object_contacts` table exists with proper schema
✅ **Lookup Data:** `contact_types` table populated with contact type definitions
✅ **Universal Scripts:** Have access to the universal query builder and response generator scripts
✅ **n8n Access:** Admin access to your n8n instance at https://n8n.wolfitlab.duckdns.org

---

## Database Setup

### 1. Verify Table Structure

```sql
-- Check if table exists
SHOW TABLES LIKE 'object_contacts';

-- Verify structure
DESCRIBE object_contacts;
```

Expected columns:
- `id` (BIGINT, AUTO_INCREMENT, PRIMARY KEY)
- `object_id` (BIGINT, NOT NULL) - References objects.id
- `contact_type_id` (INT, NOT NULL) - References contact_types.id
- `contact_value` (VARCHAR(255), NOT NULL) - The actual contact info
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- `created_by` (BIGINT) - References objects.id

### 2. Verify Contact Types

```sql
-- Check available contact types
SELECT id, code, is_active
FROM contact_types
WHERE is_active = TRUE;
```

Common contact types:
- Email
- Phone
- Mobile
- Fax
- Website
- LinkedIn
- Facebook
- Twitter

---

## n8n Workflow Setup

### Option A: Single Workflow for All Contact Endpoints (Recommended)

This approach uses one workflow with routing logic to handle all contact operations.

#### Step 1: Create Webhook Node

1. Add a **Webhook** node
2. Configure:
   - **HTTP Method:** `GET, POST, PUT, DELETE`
   - **Path:** `/api/v1/contacts/*` (catch-all for all contact paths)
   - **Response Mode:** Using Respond to Webhook Node
   - **Options:**
     - Response Code: 200
     - Response Headers: `Content-Type: application/json`

#### Step 2: Add Router (IF Nodes)

Create **5 IF nodes** to route based on method and path:

**IF Node 1: GET List Contacts**
```javascript
Condition: {{ $json.method === 'GET' && $json.path.match(/\/objects\/\d+\/contacts$/) }}
```

**IF Node 2: GET Single Contact**
```javascript
Condition: {{ $json.method === 'GET' && $json.path.match(/\/contacts\/\d+$/) }}
```

**IF Node 3: POST Create Contact**
```javascript
Condition: {{ $json.method === 'POST' && $json.path.match(/\/objects\/\d+\/contacts$/) }}
```

**IF Node 4: PUT Update Contact**
```javascript
Condition: {{ $json.method === 'PUT' && $json.path.match(/\/contacts\/\d+$/) }}
```

**IF Node 5: DELETE Contact**
```javascript
Condition: {{ $json.method === 'DELETE' && $json.path.match(/\/contacts\/\d+$/) }}
```

#### Step 3: Add Set Nodes (One per Route)

**Set Node for GET List Contacts:**
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "={{ $json.params.object_id }}"
  },
  "query": {
    "is_active": "={{ $json.query.is_active }}",
    "contact_type_id": "={{ $json.query.contact_type_id }}"
  },
  "select": [
    "oc.id",
    "oc.object_id",
    "oc.contact_type_id",
    "oc.contact_value",
    "oc.is_active",
    "oc.created_at",
    "oc.updated_at",
    "oc.created_by"
  ],
  "joins": [
    {
      "type": "LEFT",
      "table": "contact_types",
      "alias": "ct",
      "on": "ct.id = oc.contact_type_id"
    }
  ],
  "orderBy": {
    "column": "created_at",
    "direction": "DESC"
  }
}
```

**Set Node for GET Single Contact:**
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "id": "={{ $json.params.id }}"
  },
  "select": [
    "oc.id",
    "oc.object_id",
    "oc.contact_type_id",
    "oc.contact_value",
    "oc.is_active",
    "oc.created_at",
    "oc.updated_at",
    "oc.created_by"
  ],
  "joins": [
    {
      "type": "LEFT",
      "table": "contact_types",
      "alias": "ct",
      "on": "ct.id = oc.contact_type_id"
    }
  ]
}
```

**Set Node for POST Create Contact:**
```json
{
  "method": "POST",
  "table": "object_contacts",
  "params": {
    "object_id": "={{ $json.params.object_id }}"
  },
  "body": {
    "object_id": "={{ $json.params.object_id }}",
    "contact_type_id": "={{ $json.body.contact_type_id }}",
    "contact_value": "={{ $json.body.contact_value }}",
    "is_active": true,
    "created_by": "={{ $json.body.created_by || 1 }}"
  }
}
```

**Set Node for PUT Update Contact:**
```json
{
  "method": "PUT",
  "table": "object_contacts",
  "params": {
    "id": "={{ $json.params.id }}"
  },
  "body": {
    "contact_type_id": "={{ $json.body.contact_type_id }}",
    "contact_value": "={{ $json.body.contact_value }}",
    "is_active": "={{ $json.body.is_active }}"
  }
}
```

**Set Node for DELETE Contact:**
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "params": {
    "id": "={{ $json.params.id }}"
  },
  "softDelete": true
}
```

#### Step 4: Add Query Builder Code Node

1. Add **Code** node after each Set node
2. Set **Language:** JavaScript
3. **Code:** Copy entire contents of `Docs/n8n_universal_sql_query_builder.js`
4. This node generates the SQL query dynamically

#### Step 5: Add MySQL Node

1. Add **MySQL** node after each Query Builder
2. **Operation:** Execute Query
3. **Query:** `={{ $json.query }}`
4. This executes the generated SQL

#### Step 6: Add Response Generator Code Node

1. Add **Code** node after each MySQL node
2. Set **Language:** JavaScript
3. **Code:** Copy entire contents of `Docs/n8n_universal_response_body_generator.js`
4. This formats the API response

#### Step 7: Add Merge Node

1. Add **Merge** node to combine all response paths
2. **Mode:** Multiplex
3. Connect all Response Generator outputs to this node

#### Step 8: Add Respond to Webhook Node

1. Add **Respond to Webhook** node
2. **Respond With:** Using 'Respond to Webhook' Node
3. **Response Body:** `={{ $json }}`
4. Connect from Merge node

---

### Option B: Separate Workflows per Endpoint

Create 5 separate workflows, one for each endpoint. Each workflow follows the simple pattern:

```
Webhook → Set → Query Builder → MySQL → Response Generator → Webhook Response
```

Use the same Set node configurations as above, but without the IF routing logic.

---

## Frontend Configuration

### 1. Update API Base URL

Ensure your `.env.local` has the correct n8n webhook URL:

```env
NEXT_PUBLIC_API_BASE_URL=https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID
```

### 2. Test Frontend Integration

The frontend is already configured at `frontend/src/lib/api/contacts.ts`. No code changes needed!

```typescript
import { contactApi } from '@/lib/api';

// Get all contacts for an object
const contacts = await contactApi.getByObjectId(5);

// Get single contact
const contact = await contactApi.getById(123);

// Create contact
await contactApi.create(5, {
  contact_type_id: 1,
  contact_value: 'test@example.com'
});

// Update contact
await contactApi.update(123, {
  contact_value: 'updated@example.com'
});

// Delete contact (soft delete)
await contactApi.delete(123);
```

---

## Testing

### Using cURL

**1. List contacts for object 5:**
```bash
curl -X GET 'https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID/api/v1/objects/5/contacts?is_active=true' \
  -H 'Content-Type: application/json'
```

**2. Get single contact:**
```bash
curl -X GET 'https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID/api/v1/contacts/123' \
  -H 'Content-Type: application/json'
```

**3. Create new contact:**
```bash
curl -X POST 'https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID/api/v1/objects/5/contacts' \
  -H 'Content-Type: application/json' \
  -d '{
    "contact_type_id": 1,
    "contact_value": "test@example.com"
  }'
```

**4. Update contact:**
```bash
curl -X PUT 'https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID/api/v1/contacts/123' \
  -H 'Content-Type: application/json' \
  -d '{
    "contact_value": "updated@example.com"
  }'
```

**5. Delete contact:**
```bash
curl -X DELETE 'https://n8n.wolfitlab.duckdns.org/webhook/YOUR-WEBHOOK-ID/api/v1/contacts/123' \
  -H 'Content-Type: application/json'
```

### Using Frontend

Navigate to `/employees` page and:
1. Click "Contacts" tab
2. View existing contacts (if any)
3. Click "Add New Contact" button
4. Fill form and submit
5. Test inline editing
6. Test filtering and sorting

---

## Expected Response Formats

### Success Response (GET List)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 5,
      "contact_type_id": 1,
      "contact_value": "john@example.com",
      "is_active": true,
      "created_at": "2024-01-15 10:00:00",
      "updated_at": "2024-01-15 10:00:00",
      "created_by": 1
    }
  ]
}
```

### Success Response (POST/PUT)
```json
{
  "success": true,
  "data": {
    "affectedRows": 1,
    "insertId": 456
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Failed to execute query",
    "details": {
      "sqlMessage": "Duplicate entry..."
    }
  }
}
```

---

## Troubleshooting

### Issue: 404 Not Found
**Solution:** Check webhook path configuration. Ensure it matches `/api/v1/objects/:object_id/contacts` or `/api/v1/contacts/:id`

### Issue: SQL Error - Table doesn't exist
**Solution:** Run database setup SQL to create `object_contacts` table

### Issue: Foreign key constraint failure
**Solution:**
- Ensure `object_id` exists in `objects` table
- Ensure `contact_type_id` exists in `contact_types` table

### Issue: No data returned
**Solution:**
- Check if `is_active = TRUE` in your query filters
- Verify data exists in database: `SELECT * FROM object_contacts WHERE object_id = 5;`

### Issue: Response format incorrect
**Solution:** Verify Response Generator code node is using the latest `n8n_universal_response_body_generator.js`

---

## Security Considerations

1. **Authentication:** Add JWT validation in webhook before processing
2. **Authorization:** Verify user has permission to access the object's contacts
3. **Input Validation:** Sanitize `contact_value` to prevent XSS/SQL injection
4. **Rate Limiting:** Implement rate limiting on webhook to prevent abuse
5. **Audit Logging:** Log all create/update/delete operations with user ID

---

## Next Steps

After activating the contacts endpoint:

1. ✅ Test all CRUD operations with cURL
2. ✅ Test frontend integration in `/employees` page
3. ✅ Add similar contacts tabs to `/persons` and `/companies` pages
4. ✅ Configure proper authentication/authorization
5. ✅ Set up monitoring and error alerting
6. ✅ Document API in Swagger/OpenAPI format

---

## Reference Documentation

- **Universal Scripts Guide:** `Docs/N8N_UNIVERSAL_SCRIPTS_GUIDE.md`
- **Quick Reference:** `Docs/N8N_UNIVERSAL_SCRIPTS_QUICK_REFERENCE.md`
- **API Endpoints:** `Docs/API_ENDPOINTS_REFERENCE.md` (lines 1525-1655)
- **Query Builder Code:** `Docs/n8n_universal_sql_query_builder.js`
- **Response Generator Code:** `Docs/n8n_universal_response_body_generator.js`
- **Workflow Structure:** `Docs/n8n_workflow_structure.md`
- **Configuration JSON:** `Docs/n8n_contacts_endpoint_config.json`

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review n8n execution logs in the n8n UI
3. Check MySQL query logs for database errors
4. Review browser console for frontend errors

**Happy Coding!** 🚀
