-- SQL Query for fetching object_audits with username from users table
-- This query should be used in the n8n workflow that fetches audit records
--
-- Frontend expects the following fields:
-- - id, object_id, audit_action_id, created_by, created_at
-- - created_by_username (username from users table)
-- - old_values, new_values, ip_address, user_agent, notes

SELECT
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    u.username AS created_by_username,
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
LEFT JOIN users u ON u.id = oa.created_by
WHERE oa.object_id = ?  -- Replace ? with the object_id parameter
ORDER BY oa.created_at DESC;

-- Example with specific object_id:
-- WHERE oa.object_id = 8

-- If you need to filter by audit_action_id:
-- WHERE oa.object_id = ? AND oa.audit_action_id = ?

-- If you need pagination:
-- LIMIT ? OFFSET ?
