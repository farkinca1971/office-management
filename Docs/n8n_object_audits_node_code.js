/**
 * n8n Code Node - Object Audits Query Builder
 *
 * This node builds SQL queries for fetching object audit records with username
 *
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect a MySQL node after this code node
 * 5. Pass the query from this node to the MySQL node
 *
 * Input Parameters (from webhook or previous node):
 * - object_id: ID of the object to fetch audits for (required)
 * - audit_action_id: Filter by specific audit action (optional)
 * - limit: Number of records to return (optional, default: 100)
 * - offset: Pagination offset (optional, default: 0)
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract parameters
const objectId = inputData.params?.object_id ||
                 inputData.object_id ||
                 inputData.query?.object_id ||
                 inputData.body?.object_id;

const auditActionId = inputData.query?.audit_action_id ||
                      inputData.audit_action_id ||
                      inputData.body?.audit_action_id;

const limit = parseInt(inputData.query?.limit || inputData.limit || inputData.body?.limit || 100);
const offset = parseInt(inputData.query?.offset || inputData.offset || inputData.body?.offset || 0);

// Validate required parameters
if (!objectId) {
  return {
    json: {
      success: false,
      error: {
        code: 'MISSING_OBJECT_ID',
        message: 'object_id is required to fetch audit records'
      }
    }
  };
}

// Build WHERE clause
const whereClauses = [`oa.object_id = ${parseInt(objectId)}`];

if (auditActionId) {
  whereClauses.push(`oa.audit_action_id = ${parseInt(auditActionId)}`);
}

const whereClause = whereClauses.join(' AND ');

// Build SQL query
// IMPORTANT: This query joins with users table to get the username
const sqlQuery = `
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
WHERE ${whereClause}
ORDER BY oa.created_at DESC
LIMIT ${limit} OFFSET ${offset};
`;

// Return the SQL query for the next node
return {
  json: {
    query: sqlQuery.trim(),
    parameters: {
      object_id: parseInt(objectId),
      audit_action_id: auditActionId ? parseInt(auditActionId) : null,
      limit: limit,
      offset: offset
    }
  }
};
