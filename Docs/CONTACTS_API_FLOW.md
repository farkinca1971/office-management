# Contacts API Flow Diagram

## Complete Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION                        │
│                     (Next.js 14 + TypeScript)                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ User clicks "Contacts" tab
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ContactsTab Component                            │
│                 (ContactsTab.tsx:48)                                │
│                                                                     │
│  useEffect(() => {                                                  │
│    loadData();  // Called on mount and language change              │
│  }, [objectId, language]);                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Calls API
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Client Layer                               │
│                  (lib/api/contacts.ts:22)                           │
│                                                                     │
│  contactApi.getByObjectId(objectId, params)                         │
│                                                                     │
│  → Returns: Promise<ContactListResponse>                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ axios.get()
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Axios Request Interceptor                        │
│                     (lib/api/client.ts:37)                          │
│                                                                     │
│  Adds:                                                              │
│  • Authorization: Bearer <token>  (from localStorage)               │
│  • language_id: 1  (for POST/PUT/PATCH only)                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP GET Request
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          HTTP REQUEST                               │
│                                                                     │
│  GET https://n8n.wolfitlab.duckdns.org/webhook/                    │
│      244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/                  │
│      objects/1/contacts?is_active=true                              │
│                                                                     │
│  Headers:                                                           │
│    Content-Type: application/json                                   │
│    Authorization: Bearer <jwt_token>                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Travels over internet
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        N8N WORKFLOW                                 │
│         Webhook ID: 244d0b91-6c2c-482b-8119-59ac282fba4f           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  Webhook Node     │       │  Webhook Node     │
        │  (List Contacts)  │       │  (Single Contact) │
        │                   │       │                   │
        │  Path:            │       │  Path:            │
        │  /objects/        │       │  /contacts/:id    │
        │  :object_id/      │       │                   │
        │  contacts         │       │  Methods:         │
        │                   │       │  GET, PUT, DELETE │
        │  Methods:         │       │                   │
        │  GET, POST        │       └───────────────────┘
        └───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │           Set Node (Configure Query)          │
        │                                               │
        │  Sets:                                        │
        │  {                                            │
        │    "method": "GET",                           │
        │    "table": "object_contacts",                │
        │    "params": { "object_id": 1 },              │
        │    "query": { "is_active": true },            │
        │    "select": ["oc.*"],                        │
        │    "joins": [{                                │
        │      "type": "LEFT",                          │
        │      "table": "contact_types",                │
        │      "alias": "ct",                           │
        │      "on": "ct.id = oc.contact_type_id"       │
        │    }],                                        │
        │    "orderBy": "created_at DESC"               │
        │  }                                            │
        └───────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │      Code Node (Query Builder)                │
        │                                               │
        │  Code: n8n_universal_sql_query_builder.js    │
        │                                               │
        │  Generates:                                   │
        │  SELECT oc.id, oc.object_id,                  │
        │         oc.contact_type_id,                   │
        │         oc.contact_value,                     │
        │         oc.is_active,                         │
        │         oc.created_at,                        │
        │         oc.updated_at,                        │
        │         oc.created_by                         │
        │  FROM object_contacts oc                      │
        │  LEFT JOIN contact_types ct                   │
        │    ON ct.id = oc.contact_type_id              │
        │  WHERE oc.object_id = 1                       │
        │    AND oc.is_active = 1                       │
        │  ORDER BY oc.created_at DESC;                 │
        └───────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │           MySQL Node (Execute Query)          │
        │                                               │
        │  Executes SQL query against database          │
        │                                               │
        │  Returns raw MySQL result:                    │
        │  [                                            │
        │    {                                          │
        │      id: 1,                                   │
        │      object_id: 1,                            │
        │      contact_type_id: 1,                      │
        │      contact_value: "john@example.com",       │
        │      is_active: 1,                            │
        │      created_at: "2024-01-15T10:00:00Z",      │
        │      updated_at: "2024-01-15T10:00:00Z",      │
        │      created_by: 1                            │
        │    }                                          │
        │  ]                                            │
        └───────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │    Code Node (Response Generator)             │
        │                                               │
        │  Code: n8n_universal_response_body_           │
        │        generator.js                           │
        │                                               │
        │  Converts MySQL result to standard format:    │
        │  {                                            │
        │    "success": true,                           │
        │    "data": [                                  │
        │      {                                        │
        │        "id": 1,                               │
        │        "object_id": 1,                        │
        │        "contact_type_id": 1,                  │
        │        "contact_value": "john@example.com",   │
        │        "is_active": true,                     │
        │        "created_at": "2024-01-15 10:00:00",   │
        │        "updated_at": "2024-01-15 10:00:00",   │
        │        "created_by": 1                        │
        │      }                                        │
        │    ]                                          │
        │  }                                            │
        └───────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────┐
        │         Respond to Webhook Node               │
        │                                               │
        │  Returns formatted JSON to client             │
        │  HTTP 200 OK                                  │
        └───────────────────────────────────────────────┘
                                  │
                                  │ HTTP Response
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Axios Response Interceptor                       │
│                     (lib/api/client.ts:84)                          │
│                                                                     │
│  • Unwraps response.data                                            │
│  • Handles 401 errors (redirects to /login)                         │
│  • Returns typed data                                               │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Returns data
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ContactsTab Component                            │
│                                                                     │
│  setContacts(contactsResponse.data || []);                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Passes to child
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ContactsTable Component                           │
│                                                                     │
│  Renders data grid with:                                            │
│  • Sortable columns                                                 │
│  • Filterable rows                                                  │
│  • Inline editing                                                   │
│  • Delete confirmation                                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Displays to user
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SEES DATA                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ID │ Type  │ Value              │ Active │ Created At       │   │
│  ├────┼───────┼────────────────────┼────────┼──────────────────┤   │
│  │ 1  │ Email │ john@example.com   │ ✓      │ 2024-01-15 10:00 │   │
│  │ 2  │ Phone │ +1-555-1234        │ ✓      │ 2024-01-16 14:30 │   │
│  └────┴───────┴────────────────────┴────────┴──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## All 5 Endpoint Flows

### 1. GET /objects/:object_id/contacts (List)
```
Frontend → contactApi.getByObjectId(1)
        → GET /objects/1/contacts
        → n8n Webhook → Set → Query Builder → MySQL → Response → Frontend
        → Displays in ContactsTable
```

### 2. GET /contacts/:id (Single)
```
Frontend → contactApi.getById(123)
        → GET /contacts/123
        → n8n Webhook → Set → Query Builder → MySQL → Response → Frontend
        → Returns single contact object
```

### 3. POST /objects/:object_id/contacts (Create)
```
Frontend → User fills form → Clicks "Create Contact"
        → contactApi.create(1, { contact_type_id: 1, contact_value: "..." })
        → POST /objects/1/contacts
        → n8n Webhook → Set → Query Builder → MySQL INSERT → Response → Frontend
        → Adds new contact to table
```

### 4. PUT /contacts/:id (Update)
```
Frontend → User clicks Edit → Modifies data → Clicks Save
        → contactApi.update(123, { contact_value: "new@example.com" })
        → PUT /contacts/123
        → n8n Webhook → Set → Query Builder → MySQL UPDATE → Response → Frontend
        → Updates contact in table
```

### 5. DELETE /contacts/:id (Soft Delete)
```
Frontend → User clicks Delete → Confirms
        → contactApi.delete(123)
        → DELETE /contacts/123
        → n8n Webhook → Set → Query Builder → MySQL UPDATE (is_active=0) → Response → Frontend
        → Removes from active view (soft delete)
```

---

## Current Status

| Component | Status | Location |
|-----------|--------|----------|
| Frontend UI | ✅ Complete | `frontend/src/components/contacts/` |
| API Client | ✅ Complete | `frontend/src/lib/api/contacts.ts` |
| Type Definitions | ✅ Complete | `frontend/src/types/` |
| n8n Webhook | ⏳ **PENDING** | Webhook ID: `244d0b91-6c2c-482b-8119-59ac282fba4f` |
| Database Table | ❓ Unknown | `object_contacts` table |

---

## To Activate

**You need to configure the n8n webhook workflow** to handle these 5 endpoints using the universal scripts pattern.

See complete guide: `Docs/CONTACTS_ENDPOINT_ACTIVATION_GUIDE.md`

Quick reference: `Docs/n8n_contacts_endpoint_config.json`

Test script: `./Docs/test_contacts_endpoint.sh`
