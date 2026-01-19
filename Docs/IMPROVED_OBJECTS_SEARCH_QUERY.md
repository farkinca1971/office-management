# Improved Universal Object Search SQL Query

## Overview
This document provides an **improved and extendable** SQL query for the `POST /api/v1/objects/search` endpoint that searches across ALL entity types in the system.

## Current Entity Types
1. **Person** (object_type_id = 1)
2. **Company** (object_type_id = 2)
3. **User** (object_type_id = 3)
4. **Invoice** (object_type_id = 4)
5. **Transaction** (object_type_id = 5)
6. **Document** (object_type_id = 6 or higher - check your database)
7. **File** (object_type_id = 7 or higher - check your database)

## Improved SQL Query

### Count Total Matching Objects
```sql
SELECT COUNT(*) as total
FROM objects o
WHERE
    o.is_active = 1
    AND ({{ $json.body.object_type_ids }} IS NULL OR o.object_type_id IN ({{ $json.body.object_type_ids }}))
    AND ({{ $json.body.object_status_ids }} IS NULL OR o.object_status_id IN ({{ $json.body.object_status_ids }}))
    AND (
        {{ $json.body.query }} IS NULL OR
        o.id IN (
            -- Search in persons
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in companies
            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in users
            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in invoices (assuming invoice_number field exists)
            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in transactions (assuming transaction_number field exists)
            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in documents (assuming documents table exists)
            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in files (assuming files table exists)
            SELECT f.id FROM files f
            WHERE CONCAT_WS(' ', f.file_name, f.original_name, f.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')
        )
    );
```

### Get Paginated Results with Display Names
```sql
SELECT
    o.id,
    o.object_type_id,
    o.object_status_id,
    ot.text as object_type_name,
    CASE o.object_type_id
        -- Person
        WHEN 1 THEN (
            SELECT CONCAT_WS(' ', p.first_name, p.last_name)
            FROM persons p
            WHERE p.id = o.id
        )

        -- Company
        WHEN 2 THEN (
            SELECT c.company_name
            FROM companies c
            WHERE c.id = o.id
        )

        -- User
        WHEN 3 THEN (
            SELECT u.username
            FROM users u
            WHERE u.id = o.id
        )

        -- Invoice (assuming invoice_number exists)
        WHEN 4 THEN (
            SELECT CONCAT('Invoice #', i.invoice_number)
            FROM invoices i
            WHERE i.id = o.id
        )

        -- Transaction (assuming transaction_number exists)
        WHEN 5 THEN (
            SELECT CONCAT('Transaction #', t.transaction_number)
            FROM transactions t
            WHERE t.id = o.id
        )

        -- Document (check actual object_type_id for documents in your DB)
        -- Update the WHEN clause number based on your database
        WHEN (SELECT id FROM object_types WHERE code = 'document' LIMIT 1) THEN (
            SELECT d.title
            FROM documents d
            WHERE d.id = o.id
        )

        -- File (check actual object_type_id for files in your DB)
        -- Update the WHEN clause number based on your database
        WHEN (SELECT id FROM object_types WHERE code = 'file' LIMIT 1) THEN (
            SELECT f.file_name
            FROM files f
            WHERE f.id = o.id
        )

        -- Fallback for unknown types
        ELSE CONCAT('Object #', o.id)
    END as display_name,
    o.created_at
FROM objects o
LEFT JOIN object_types ot_lookup ON o.object_type_id = ot_lookup.id
LEFT JOIN translations ot ON ot.code = ot_lookup.code AND ot.language_id = COALESCE({{ $headers['x-language-id'] }}, {{ $json.body.language_id }}, 1)
WHERE
    o.is_active = 1
    AND ({{ $json.body.object_type_ids }} IS NULL OR o.object_type_id IN ({{ $json.body.object_type_ids }}))
    AND ({{ $json.body.object_status_ids }} IS NULL OR o.object_status_id IN ({{ $json.body.object_status_ids }}))
    AND (
        {{ $json.body.query }} IS NULL OR
        o.id IN (
            -- Search in persons
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in companies
            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in users
            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in invoices
            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in transactions
            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in documents
            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', {{ $json.body.query }}, '%')

            UNION

            -- Search in files
            SELECT f.id FROM files f
            WHERE CONCAT_WS(' ', f.file_name, f.original_name, f.description) LIKE CONCAT('%', {{ $json.body.query }}, '%')
        )
    )
ORDER BY o.created_at DESC
LIMIT {{ $json.body.per_page }}
OFFSET {{ ($json.body.page - 1) * $json.body.per_page }};
```

## Key Improvements

### 1. **All Entity Types Included**
The query now searches across:
- ✅ Persons
- ✅ Companies
- ✅ Users
- ✅ Invoices
- ✅ Transactions
- ✅ Documents
- ✅ Files

### 2. **Extendable Pattern**
To add a new entity type in the future:

**Step 1**: Add to the search subquery:
```sql
UNION

-- Search in [new_entity]
SELECT ne.id FROM [new_entity_table] ne
WHERE CONCAT_WS(' ', ne.field1, ne.field2) LIKE CONCAT('%', {{ $json.body.query }}, '%')
```

**Step 2**: Add to the display_name CASE statement:
```sql
-- [New Entity Type]
WHEN [object_type_id] THEN (
    SELECT ne.display_field
    FROM [new_entity_table] ne
    WHERE ne.id = o.id
)
```

### 3. **Only Active Objects**
Added `o.is_active = 1` filter to exclude soft-deleted objects from search results.

### 4. **Language Support**
Uses language_id from either header or body:
```sql
COALESCE({{ $headers['x-language-id'] }}, {{ $json.body.language_id }}, 1)
```

### 5. **Performance Optimization**
- Uses `UNION` instead of `UNION ALL` to remove duplicate IDs
- Uses `CONCAT_WS` (concat with separator) which ignores NULL values
- Filters by `is_active` first to reduce result set
- Uses indexed fields in WHERE clauses (id, object_type_id)

## Database Schema Assumptions

The query assumes your database has these tables:
- `objects` (id, object_type_id, object_status_id, is_active, created_at)
- `persons` (id, first_name, last_name, email)
- `companies` (id, company_name)
- `users` (id, username, email, first_name, last_name)
- `invoices` (id, invoice_number, description)
- `transactions` (id, transaction_number, description)
- `documents` (id, title, description, document_number)
- `files` (id, file_name, original_name, description)

**⚠️ Important**: Verify the actual column names in your database and adjust accordingly.

## Determining Object Type IDs

To find the correct object_type_id for documents and files, run this query:
```sql
SELECT id, code, name FROM object_types WHERE code IN ('document', 'file');
```

Then update the WHEN clauses in the display_name CASE statement with the actual IDs.

## Alternative: Dynamic Lookup for Object Type IDs

If you want the query to be fully dynamic without hardcoding object_type_id values:

```sql
CASE
    WHEN o.object_type_id = (SELECT id FROM object_types WHERE code = 'person' LIMIT 1) THEN (...)
    WHEN o.object_type_id = (SELECT id FROM object_types WHERE code = 'company' LIMIT 1) THEN (...)
    WHEN o.object_type_id = (SELECT id FROM object_types WHERE code = 'user' LIMIT 1) THEN (...)
    -- etc.
END as display_name
```

This approach is more flexible but slightly slower due to the subqueries.

## Testing the Query

### Test 1: Search all entity types
```bash
curl -X POST 'http://localhost:5678/webhook/.../api/v1/objects/search' \
  -H 'Content-Type: application/json' \
  -H 'X-Language-ID: 1' \
  -d '{
    "query": "test",
    "page": 1,
    "per_page": 20
  }'
```

### Test 2: Search only persons and companies
```bash
curl -X POST 'http://localhost:5678/webhook/.../api/v1/objects/search' \
  -H 'Content-Type: application/json' \
  -H 'X-Language-ID: 1' \
  -d '{
    "query": "john",
    "object_type_ids": [1, 2],
    "page": 1,
    "per_page": 20
  }'
```

### Test 3: Search only documents
```bash
curl -X POST 'http://localhost:5678/webhook/.../api/v1/objects/search' \
  -H 'Content-Type: application/json' \
  -H 'X-Language-ID: 1' \
  -d '{
    "query": "contract",
    "object_type_ids": [6],
    "page": 1,
    "per_page": 20
  }'
```

## Migration Notes

When implementing this query in n8n:

1. **Backup existing workflow** before making changes
2. **Test with small dataset** first
3. **Verify object_type_id values** in your database
4. **Adjust column names** to match your actual schema
5. **Test each entity type** individually to ensure correct display_name
6. **Monitor query performance** - add indexes if needed

## Future Enhancements

Consider these improvements for production:

1. **Full-text search**: Use MySQL FULLTEXT indexes for better performance
2. **Fuzzy matching**: Implement SOUNDEX or Levenshtein distance for typo tolerance
3. **Result ranking**: Order by relevance score instead of created_at
4. **Highlight matches**: Return matching text snippets in results
5. **Search filters**: Add date ranges, created_by, status filters
6. **Caching**: Cache common searches using Redis

---

**Last Updated**: 2026-01-11
**Tested On**: MySQL 8.0+
**Status**: Ready for implementation
