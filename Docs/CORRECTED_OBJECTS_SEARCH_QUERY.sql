-- CORRECTED SQL Query for POST /api/v1/objects/search
-- This version fixes syntax errors and handles NULL query parameter correctly

-- ============================================================================
-- QUERY 1: Count total matching objects
-- ============================================================================
SELECT COUNT(*) as total
FROM objects o
WHERE
    o.is_active = 1
    AND (
        CAST('{{ $json.body.object_type_ids }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.object_type_ids }}' AS CHAR) = ''
        OR o.object_type_id IN ({{ $json.body.object_type_ids }})
    )
    AND (
        CAST('{{ $json.body.object_status_ids }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.object_status_ids }}' AS CHAR) = ''
        OR o.object_status_id IN ({{ $json.body.object_status_ids }})
    )
    AND (
        CAST('{{ $json.body.query }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.query }}' AS CHAR) = ''
        OR o.id IN (
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

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
        WHEN 1 THEN (
            SELECT CONCAT_WS(' ', p.first_name, p.last_name)
            FROM persons p
            WHERE p.id = o.id
        )
        WHEN 2 THEN (
            SELECT c.company_name
            FROM companies c
            WHERE c.id = o.id
        )
        WHEN 3 THEN (
            SELECT u.username
            FROM users u
            WHERE u.id = o.id
        )
        WHEN 4 THEN (
            SELECT CONCAT('Invoice #', i.invoice_number)
            FROM invoices i
            WHERE i.id = o.id
        )
        WHEN 5 THEN (
            SELECT CONCAT('Transaction #', t.transaction_number)
            FROM transactions t
            WHERE t.id = o.id
        )
        WHEN (SELECT id FROM object_types WHERE code = 'document' LIMIT 1) THEN (
            SELECT d.title
            FROM documents d
            WHERE d.id = o.id
        )
        WHEN (SELECT id FROM object_types WHERE code = 'file' LIMIT 1) THEN (
            SELECT f.file_name
            FROM files f
            WHERE f.id = o.id
        )
        ELSE CONCAT('Object #', o.id)
    END as display_name,
    o.created_at
FROM objects o
LEFT JOIN object_types ot_lookup ON o.object_type_id = ot_lookup.id
LEFT JOIN translations ot ON ot.code = ot_lookup.code
    AND ot.language_id = COALESCE(
        CAST('{{ $headers["x-language-id"] }}' AS UNSIGNED),
        CAST('{{ $json.body.language_id }}' AS UNSIGNED),
        1
    )
WHERE
    o.is_active = 1
    AND (
        CAST('{{ $json.body.object_type_ids }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.object_type_ids }}' AS CHAR) = ''
        OR o.object_type_id IN ({{ $json.body.object_type_ids }})
    )
    AND (
        CAST('{{ $json.body.object_status_ids }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.object_status_ids }}' AS CHAR) = ''
        OR o.object_status_id IN ({{ $json.body.object_status_ids }})
    )
    AND (
        CAST('{{ $json.body.query }}' AS CHAR) = 'null'
        OR CAST('{{ $json.body.query }}' AS CHAR) = ''
        OR o.id IN (
            SELECT p.id FROM persons p
            WHERE CONCAT_WS(' ', p.first_name, p.last_name, p.email) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT c.id FROM companies c
            WHERE c.company_name LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT u.id FROM users u
            WHERE CONCAT_WS(' ', u.username, u.email, u.first_name, u.last_name) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT i.id FROM invoices i
            WHERE CONCAT_WS(' ', i.invoice_number, i.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT t.id FROM transactions t
            WHERE CONCAT_WS(' ', t.transaction_number, t.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT d.id FROM documents d
            WHERE CONCAT_WS(' ', d.title, d.description, d.document_number) LIKE CONCAT('%', '{{ $json.body.query }}', '%')

            UNION

            SELECT f.id FROM files f
            WHERE CONCAT_WS(' ', f.file_name, f.original_name, f.description) LIKE CONCAT('%', '{{ $json.body.query }}', '%')
        )
    )
ORDER BY o.created_at DESC
LIMIT {{ $json.body.per_page }}
OFFSET {{ ($json.body.page - 1) * $json.body.per_page }};
