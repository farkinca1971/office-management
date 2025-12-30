# n8n Workflow Structure for API Endpoints

## Standard GET List Endpoint (e.g., GET /api/v1/persons)

```
┌─────────────────────┐
│  Webhook Trigger    │
│  GET /api/v1/persons│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Query Builder)   │
│   - Build SQL       │
│   - Validate params │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node        │
│   Execute Query     │
│   Returns: Array    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Formatter)       │
│   Returns:          │
│   {                 │
│     success: true,  │
│     data: [...]     │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
└─────────────────────┘
```

## GET Single Item Endpoint (e.g., GET /api/v1/persons/:id)

```
┌─────────────────────┐
│  Webhook Trigger    │
│  GET /persons/:id   │
│  Params: { id: 8 }  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   - Extract :id     │
│   - Build SQL       │
│   WHERE id = ?      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node        │
│   Execute Query     │
│   Returns: Object   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Formatter)       │
│   Returns:          │
│   {                 │
│     success: true,  │
│     data: {...}     │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
└─────────────────────┘
```

## POST/Create Endpoint (e.g., POST /api/v1/persons)

```
┌─────────────────────┐
│  Webhook Trigger    │
│  POST /api/v1/persons│
│  Body: {            │
│    first_name: "..." │
│    last_name: "..."  │
│  }                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Validation)      │
│   - Validate input  │
│   - Check required  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node #1     │
│   INSERT INTO       │
│   objects (...)     │
│   Returns: insertId │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node #2     │
│   INSERT INTO       │
│   persons (...)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node #3     │
│   SELECT created    │
│   record by ID      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Formatter)       │
│   Returns:          │
│   {                 │
│     success: true,  │
│     data: {...}     │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
│  HTTP 201 Created   │
└─────────────────────┘
```

## Lookup Endpoint (e.g., GET /api/v1/lookups/audit-actions)

```
┌─────────────────────┐
│  Webhook Trigger    │
│  GET /lookups/:type │
│  Params: {          │
│    lookup_type:     │
│    "audit-actions"  │
│  }                  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Query Builder)   │
│   - Extract type    │
│   - Build SQL with  │
│     JOIN for        │
│     translations    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node        │
│   Execute Query     │
│   Returns:          │
│   [{ id, code,      │
│      name, ...}]    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Formatter)       │
│   Returns:          │
│   {                 │
│     success: true,  │
│     data: [...]     │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
└─────────────────────┘
```

## Audit Records Endpoint (GET /api/v1/object-audits/object/:object_id)

```
┌─────────────────────┐
│  Webhook Trigger    │
│  GET /object-audits/│
│      object/:id     │
│  Params:            │
│  { object_id: 8 }   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Query Builder)   │
│   Build SQL:        │
│   SELECT oa.*,      │
│     u.username AS   │
│     created_by_     │
│     username        │
│   FROM object_audits│
│   LEFT JOIN users   │
│   WHERE object_id=? │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   MySQL Node        │
│   Execute Query     │
│   Returns: Array    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Code Node         │
│   (Formatter)       │
│   Returns:          │
│   {                 │
│     success: true,  │
│     data: [...]     │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
└─────────────────────┘
```

## Error Handling Pattern

All workflows should include error handling:

```
┌─────────────────────┐
│  Any Node           │
└──────────┬──────────┘
           │
           ▼ (on error)
┌─────────────────────┐
│   Code Node         │
│   (Error Handler)   │
│   Returns:          │
│   {                 │
│     success: false, │
│     error: {        │
│       code: "...",  │
│       message: "..."│
│     }               │
│   }                 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Respond to Webhook │
│  HTTP 500 or 400    │
└─────────────────────┘
```

## Key Principles

1. **Always format responses** - Use formatter code nodes
2. **Always return success/error structure** - Frontend expects this
3. **Use LEFT JOIN for optional data** - e.g., users table in audits
4. **Handle null values** - MySQL may return NULL for optional fields
5. **Return appropriate HTTP status codes**:
   - 200 OK - Successful GET/PUT/PATCH
   - 201 Created - Successful POST
   - 400 Bad Request - Validation errors
   - 404 Not Found - Resource doesn't exist
   - 500 Internal Server Error - Server/database errors

## Node Naming Convention

Use clear, descriptive names for your nodes:
- ✅ "Build Persons Query"
- ✅ "Execute Get Persons"
- ✅ "Format Response"
- ❌ "Code"
- ❌ "MySQL"
- ❌ "Code 1"

This makes workflows easier to understand and maintain.
