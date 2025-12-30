/**
 * n8n Set Node - Contacts GET Query Builder
 *
 * Purpose: Build SQL query for fetching contacts with support for filtering
 *
 * Route: GET /objects/:object_id/contacts
 *
 * Query Parameters:
 * - is_active (optional): boolean - filter by active status
 * - contact_type_id (optional): number - filter by contact type
 *
 * Behavior:
 * - If is_active is NOT provided → return ALL contacts (active AND inactive)
 * - If is_active = true → return only active contacts
 * - If is_active = false → return only inactive contacts
 * - If contact_type_id is provided → filter by contact type
 */

// Get parameters from the HTTP request
const objectId = $json.params.object_id;
const isActiveParam = $json.query.is_active;
const contactTypeId = $json.query.contact_type_id;

// Base SQL query with JOIN to get contact type name
let sql = `
  SELECT
    oc.id,
    oc.object_id,
    oc.contact_type_id,
    oc.contact_value,
    oc.is_active,
    oc.created_at,
    oc.updated_at,
    oc.created_by,
    ct.code as contact_type_code,
    COALESCE(
      (SELECT text FROM translations
       WHERE code = ct.code
       AND language_id = {{ $json.query.language_id || 1 }}
       LIMIT 1),
      ct.code
    ) as contact_type_name
  FROM object_contacts oc
  LEFT JOIN contact_types ct ON oc.contact_type_id = ct.id
  WHERE oc.object_id = ${objectId}
`;

// Build WHERE conditions
const conditions = [];

// Handle is_active filter
// IMPORTANT: Only filter by is_active if the parameter is explicitly provided
if (isActiveParam !== undefined && isActiveParam !== null && isActiveParam !== '') {
  // Convert string to boolean if needed
  const isActive = isActiveParam === true || isActiveParam === 'true' || isActiveParam === '1';
  conditions.push(`oc.is_active = ${isActive ? 'TRUE' : 'FALSE'}`);
}
// If isActiveParam is not provided, don't filter by is_active at all
// This allows the frontend to receive ALL contacts and do client-side filtering

// Handle contact_type_id filter
if (contactTypeId !== undefined && contactTypeId !== null && contactTypeId !== '') {
  conditions.push(`oc.contact_type_id = ${contactTypeId}`);
}

// Add conditions to query if any exist
if (conditions.length > 0) {
  sql += ' AND ' + conditions.join(' AND ');
}

// Add ordering
sql += ' ORDER BY oc.created_at DESC';

// Return the query configuration
return {
  query: sql,
  object_id: objectId,
  is_active_filter: isActiveParam,
  contact_type_filter: contactTypeId
};
