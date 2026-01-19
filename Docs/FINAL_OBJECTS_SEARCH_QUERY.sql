-- ============================================================================
-- FINAL SQL Query for POST /api/v1/objects/search
-- Simplified version that works with n8n parameter handling
-- ============================================================================

-- IMPORTANT: The frontend now only sends fields that have values
-- Missing fields are NOT sent at all (not as "undefined" or "null")
-- So we can use simple IS NULL checks in SQL

-- ============================================================================
-- QUERY 1: Count total matching objects
-- ============================================================================
SELECT COUNT(*) as total
FROM objects o
WHERE
    o.is_active = 1
    AND (
        '{{ $json.body.object_type_ids }}' IS NULL
        OR '{{ $json.body.object_type_ids }}' = ''
        OR o.object_type_id IN ({{ $json.body.object_type_ids }})
    )
    AND (
        '{{ $json.body.object_status_ids }}' IS NULL
        OR '{{ $json.body.object_status_ids }}' = ''
        OR o.object_status_id IN ({{ $json.body.object_status_ids }})
    )
    AND (
        '{{ $json.body.query }}' IS NULL
        OR '{{ $json.body.query }}' = ''
        OR o.id IN (
            -- Search in persons
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in companies
            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in users
            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in invoices
            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in transactions
            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in documents
            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in files
            SELECT f.id FROM files f
            WHERE CONCAT_WS(' ', f.file_name, f.original_name, f.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')
        )
    );

-- ============================================================================
-- QUERY 2: Get paginated results with display names
-- ============================================================================
SELECT
    o.id,
    o.object_type_id,
    o.object_status_id,
    ot.text as object_type_name,
    CASE o.object_type_id
        -- Person (object_type_id = 1)
        WHEN 1 THEN (
            SELECT CONCAT_WS(' ', p.first_name, p.last_name)
            FROM persons p
            WHERE p.id = o.id
        )

        -- Company (object_type_id = 2)
        WHEN 2 THEN (
            SELECT c.company_name
            FROM companies c
            WHERE c.id = o.id
        )

        -- User (object_type_id = 3)
        WHEN 3 THEN (
            SELECT u.username
            FROM users u
            WHERE u.id = o.id
        )

        -- Invoice (object_type_id = 4)
        WHEN 4 THEN (
            SELECT CONCAT('Invoice #', i.invoice_number)
            FROM invoices i
            WHERE i.id = o.id
        )

        -- Transaction (object_type_id = 5)
        WHEN 5 THEN (
            SELECT CONCAT('Transaction #', t.transaction_number)
            FROM transactions t
            WHERE t.id = o.id
        )

        -- Document (use subquery to get dynamic ID)
        -- If you know the exact object_type_id, replace this with: WHEN 6 THEN
        WHEN (SELECT id FROM object_types WHERE code = 'document' LIMIT 1) THEN (
            SELECT d.title
            FROM documents d
            WHERE d.id = o.id
        )

        -- File (use subquery to get dynamic ID)
        -- If you know the exact object_type_id, replace this with: WHEN 7 THEN
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
LEFT JOIN translations ot ON ot.code = ot_lookup.code
    AND ot.language_id = COALESCE(
        {{ $headers["x-language-id"] }},
        {{ $json.body.language_id }},
        1
    )
WHERE
    o.is_active = 1
    AND (
        '{{ $json.body.object_type_ids }}' IS NULL
        OR '{{ $json.body.object_type_ids }}' = ''
        OR o.object_type_id IN ({{ $json.body.object_type_ids }})
    )
    AND (
        '{{ $json.body.object_status_ids }}' IS NULL
        OR '{{ $json.body.object_status_ids }}' = ''
        OR o.object_status_id IN ({{ $json.body.object_status_ids }})
    )
    AND (
        '{{ $json.body.query }}' IS NULL
        OR '{{ $json.body.query }}' = ''
        OR o.id IN (
            -- Search in persons
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in companies
            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in users
            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in invoices
            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in transactions
            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in documents
            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            -- Search in files
            SELECT f.id FROM files f
            WHERE CONCAT_WS(' ', f.file_name, f.original_name, f.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')
        )
    )
ORDER BY o.created_at DESC
LIMIT {{ $json.body.per_page }}
OFFSET {{ ($json.body.page - 1) * $json.body.per_page }};

-- ============================================================================
-- NOTES FOR n8n IMPLEMENTATION
-- ============================================================================

-- 1. The frontend now cleans up undefined values before sending
--    - If query is empty/undefined: field is NOT sent
--    - If object_type_ids is empty/undefined: field is NOT sent
--    - If object_status_ids is empty/undefined: field is NOT sent

-- 2. Always sent (with defaults):
--    - page: defaults to 1
--    - per_page: defaults to 20
--    - language_id: added by interceptor

-- 3. Header handling:
--    - Language ID is sent in X-Language-ID header (always)
--    - Also in body as language_id (added by interceptor)

-- 4. Parameter checking in SQL:
--    - Use: '{{ $json.body.field }}' IS NULL OR '{{ $json.body.field }}' = ''
--    - This handles both missing fields and empty strings

-- 5. Array parameters (object_type_ids, object_status_ids):
--    - When sent: comes as array like [1,2,3]
--    - Use directly in IN clause: IN ({{ $json.body.object_type_ids }})
--    - n8n automatically expands arrays to comma-separated values

-- 6. Performance optimization:
--    - If you know exact object_type_id values for documents and files,
--      replace the subqueries with hardcoded values:
--      WHEN 6 THEN ... (for documents)
--      WHEN 7 THEN ... (for files)

-- 7. Verify these column names exist in your database:
--    persons: first_name, last_name, email
--    companies: company_name
--    users: username, email, first_name, last_name
--    invoices: invoice_number, description
--    transactions: transaction_number, description
--    documents: title, description, document_number
--    files: file_name, original_name, description
