# n8n Universal Scripts - Quick Reference Card

## 🚀 Quick Setup

### Workflow Structure
```
Webhook → Set Node → Query Builder → MySQL → Response Generator → Response
```

### Essential Files
- **Query Builder**: `n8n_universal_sql_query_builder.js`
- **Response Generator**: `n8n_universal_response_body_generator.js`
- **Full Guide**: `N8N_UNIVERSAL_SCRIPTS_GUIDE.md`

---

## 📝 Set Node Configuration Template

```json
{
  "method": "{{ $json.method }}",
  "table": "TABLE_NAME",
  "params": "{{ $json.params }}",
  "query": "{{ $json.query }}",
  "body": "{{ $json.body }}",
  "select": ["*"],
  "joins": [],
  "orderBy": "created_at DESC"
}
```

---

## 🔍 GET Request

### Simple GET
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "query": {
    "is_active": true
  },
  "orderBy": "created_at DESC"
}
```

### GET with JOINs
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "select": ["oc.*", "ct.code AS type_code"],
  "joins": [
    {
      "type": "LEFT",
      "table": "contact_types",
      "alias": "ct",
      "on": "ct.id = oc.contact_type_id"
    }
  ],
  "orderBy": "oc.created_at DESC"
}
```

### GET Single Record
```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "expectSingle": true
}
```

---

## ➕ POST Request (Create)

```json
{
  "method": "POST",
  "table": "object_contacts",
  "body": {
    "object_id": "{{ $json.params.object_id }}",
    "contact_type_id": "{{ $json.body.contact_type_id }}",
    "contact_value": "{{ $json.body.contact_value }}",
    "is_active": true,
    "created_by": "{{ $json.body.created_by }}",
    "created_at": "{{ $now }}"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "affectedRows": 1
  }
}
```

---

## ✏️ PUT/PATCH Request (Update)

```json
{
  "method": "PUT",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "body": {
    "contact_value": "{{ $json.body.contact_value }}",
    "is_active": "{{ $json.body.is_active }}",
    "updated_at": "{{ $now }}"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1,
    "changedRows": 1
  }
}
```

---

## 🗑️ DELETE Request

### Soft Delete (Default)
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  }
}
```

### Hard Delete
```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "softDelete": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1
  }
}
```

---

## 🔧 Common Configurations

### ORDER BY Options

**Single Column:**
```json
"orderBy": "created_at DESC"
```

**Multiple Columns:**
```json
"orderBy": ["created_at DESC", "id ASC"]
```

**Object Format:**
```json
"orderBy": {
  "column": "created_at",
  "direction": "DESC"
}
```

### JOIN Types

```json
"joins": [
  {
    "type": "LEFT",      // or "INNER", "RIGHT"
    "table": "contact_types",
    "alias": "ct",
    "on": "ct.id = oc.contact_type_id"
  }
]
```

### SELECT Columns

**All Columns:**
```json
"select": ["*"]
```

**Specific Columns:**
```json
"select": ["oc.id", "oc.contact_value", "oc.is_active"]
```

**With Aliases:**
```json
"select": ["oc.id", "ct.code AS type_code", "t.text AS type_name"]
```

---

## 🎯 Real-World Examples

### Example 1: Get Object Contacts
**URL:** `GET /api/v1/objects/123/contacts?is_active=true`

```json
{
  "method": "GET",
  "table": "object_contacts",
  "params": {
    "object_id": "{{ $json.params.object_id }}"
  },
  "query": {
    "is_active": "{{ $json.query.is_active }}"
  },
  "orderBy": "created_at DESC"
}
```

### Example 2: Create Contact
**URL:** `POST /api/v1/objects/123/contacts`

```json
{
  "method": "POST",
  "table": "object_contacts",
  "body": {
    "object_id": "{{ $json.params.object_id }}",
    "contact_type_id": "{{ $json.body.contact_type_id }}",
    "contact_value": "{{ $json.body.contact_value }}",
    "is_active": 1,
    "created_by": "{{ $json.body.created_by }}"
  }
}
```

### Example 3: Update Contact
**URL:** `PUT /api/v1/contacts/456`

```json
{
  "method": "PUT",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  },
  "body": {
    "contact_value": "{{ $json.body.contact_value }}",
    "updated_at": "{{ $now }}"
  }
}
```

### Example 4: Delete Contact
**URL:** `DELETE /api/v1/contacts/456`

```json
{
  "method": "DELETE",
  "table": "object_contacts",
  "params": {
    "id": "{{ $json.params.id }}"
  }
}
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Do This
```json
{
  "table": "object_contacts",
  // Missing method!
}
```

### ✅ Do This
```json
{
  "method": "GET",
  "table": "object_contacts"
}
```

---

### ❌ Don't Do This (UPDATE without WHERE)
```json
{
  "method": "PUT",
  "table": "object_contacts",
  "body": { "is_active": false }
  // Missing params - will fail!
}
```

### ✅ Do This
```json
{
  "method": "PUT",
  "table": "object_contacts",
  "params": { "id": "{{ $json.params.id }}" },
  "body": { "is_active": false }
}
```

---

### ❌ Don't Do This (POST without data)
```json
{
  "method": "POST",
  "table": "object_contacts"
  // Missing body!
}
```

### ✅ Do This
```json
{
  "method": "POST",
  "table": "object_contacts",
  "body": {
    "object_id": 123,
    "contact_value": "test@example.com"
  }
}
```

---

## 📊 Response Formats

### Success Responses

**GET (Array):**
```json
{
  "success": true,
  "data": [...]
}
```

**GET (Single):**
```json
{
  "success": true,
  "data": {...}
}
```

**POST:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "affectedRows": 1
  }
}
```

**PUT/PATCH:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1,
    "changedRows": 1
  }
}
```

**DELETE:**
```json
{
  "success": true,
  "data": {
    "affectedRows": 1
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {...}
  }
}
```

---

## 🔗 Webhook URL Format

```
https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:object_id/contacts
```

**Set in Environment:**
```env
NEXT_PUBLIC_API_BASE_URL=https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f
```

---

## 🛠️ MySQL Node Configuration

**Query Field:**
```
{{ $json.query }}
```

**Important:** Make sure to reference the output from the Query Builder node!

---

## 💡 Tips

1. ✅ Use meaningful table aliases (`oc` for `object_contacts`)
2. ✅ Always specify columns in SELECT for better performance
3. ✅ Use soft deletes by default
4. ✅ Add `created_at` and `updated_at` timestamps
5. ✅ Validate input before query builder
6. ✅ Test with GET before implementing POST/PUT/DELETE

---

## 📚 See Also

- [Complete Guide](./N8N_UNIVERSAL_SCRIPTS_GUIDE.md) - Full documentation with examples
- [API Reference](./API_ENDPOINTS_REFERENCE.md) - All available endpoints
- [Quick Start](./QUICK_START_N8N_FORMATTERS.md) - Getting started guide
