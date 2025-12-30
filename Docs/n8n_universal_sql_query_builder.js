/**
 * n8n Code Node - Universal SQL Query Builder
 *
 * This node generates SQL queries dynamically based on incoming webhook parameters
 * Supports GET, POST, PUT, PATCH, DELETE operations for any entity
 *
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect a MySQL node after this code node
 * 5. Pass the generated query to the MySQL node
 *
 * Input Parameters (from webhook):
 * - method: HTTP method (GET, POST, PUT, PATCH, DELETE)
 * - table: Database table name (required)
 * - params: URL path parameters (e.g., { id: 123, object_id: 456 })
 * - query: Query string parameters (e.g., { is_active: true, contact_type_id: 1 })
 * - body: Request body for POST/PUT/PATCH operations
 * - joins: Array of join configurations (optional)
 * - select: Array of column names to select (optional, defaults to all)
 * - orderBy: Order by configuration (optional)
 *
 * Output:
 * - query: SQL query string
 * - params: Query parameters for prepared statement
 * - operation: Operation type (SELECT, INSERT, UPDATE, DELETE)
 * - metadata: Additional metadata about the query
 */

// Get input data from webhook
const inputData = $input.all()[0].json;

// Extract parameters
const method = (inputData.method || 'GET').toUpperCase();
const table = inputData.table || inputData.params?.table;
const pathParams = inputData.params || {};
const queryParams = inputData.query || {};
const bodyData = inputData.body || {};
const joins = inputData.joins || [];
const selectColumns = inputData.select || ['*'];
const orderBy = inputData.orderBy || null;

// Validate required parameters
if (!table) {
  throw new Error('Table name is required. Provide it in inputData.table or inputData.params.table');
}

// Helper function to escape SQL identifiers (table/column names)
const escapeIdentifier = (identifier) => {
  return `\`${identifier.replace(/`/g, '``')}\``;
};

// Helper function to escape string values
const escapeValue = (value) => {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  // Escape single quotes for SQL strings
  return `'${value.toString().replace(/'/g, "''")}'`;
};

// Helper function to build WHERE clause from parameters
const buildWhereClause = (params, tableAlias = null) => {
  const conditions = [];
  const prefix = tableAlias ? `${tableAlias}.` : '';

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      conditions.push(`${prefix}${escapeIdentifier(key)} IS NULL`);
    } else if (typeof value === 'boolean') {
      conditions.push(`${prefix}${escapeIdentifier(key)} = ${value ? 1 : 0}`);
    } else if (typeof value === 'number') {
      conditions.push(`${prefix}${escapeIdentifier(key)} = ${value}`);
    } else {
      conditions.push(`${prefix}${escapeIdentifier(key)} = ${escapeValue(value)}`);
    }
  }

  return conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
};

// Helper function to build JOIN clauses
const buildJoinClauses = (joins) => {
  return joins.map(join => {
    const joinType = (join.type || 'LEFT').toUpperCase();
    const joinTable = escapeIdentifier(join.table);
    const alias = join.alias ? escapeIdentifier(join.alias) : null;
    const condition = join.on;

    return `${joinType} JOIN ${joinTable}${alias ? ' ' + alias : ''} ON ${condition}`;
  }).join('\n');
};

// Helper function to build SELECT columns
const buildSelectColumns = (columns, tableAlias = null) => {
  if (columns.includes('*')) {
    return tableAlias ? `${tableAlias}.*` : '*';
  }

  return columns.map(col => {
    // Support for column aliases: "column_name AS alias"
    if (col.includes(' AS ') || col.includes(' as ')) {
      return col;
    }
    const prefix = tableAlias ? `${tableAlias}.` : '';
    return `${prefix}${escapeIdentifier(col)}`;
  }).join(', ');
};

// Helper function to build ORDER BY clause
const buildOrderByClause = (orderBy) => {
  if (!orderBy) return '';

  if (typeof orderBy === 'string') {
    // Simple string: "created_at DESC"
    return `ORDER BY ${orderBy}`;
  }

  if (Array.isArray(orderBy)) {
    // Array of strings: ["created_at DESC", "id ASC"]
    return `ORDER BY ${orderBy.join(', ')}`;
  }

  if (typeof orderBy === 'object') {
    // Object: { column: 'created_at', direction: 'DESC' }
    const column = orderBy.column || 'id';
    const direction = (orderBy.direction || 'ASC').toUpperCase();
    return `ORDER BY ${escapeIdentifier(column)} ${direction}`;
  }

  return '';
};

// Build SQL query based on HTTP method
let sqlQuery = '';
let operation = '';
let metadata = {};

switch (method) {
  case 'GET': {
    operation = 'SELECT';

    // Build SELECT clause
    const tableAlias = table.substring(0, 2); // First 2 letters as alias
    const selectClause = buildSelectColumns(selectColumns, tableAlias);

    // Build JOIN clauses
    const joinClauses = buildJoinClauses(joins);

    // Build WHERE clause
    // Combine path params and query params for WHERE clause
    const whereParams = { ...pathParams, ...queryParams };
    // Remove non-filter params
    delete whereParams.table;
    delete whereParams.lookup_type;
    const whereClause = buildWhereClause(whereParams, tableAlias);

    // Build ORDER BY clause
    const orderByClause = buildOrderByClause(orderBy);

    // Construct full query
    sqlQuery = `
SELECT ${selectClause}
FROM ${escapeIdentifier(table)} ${tableAlias}
${joinClauses}
${whereClause}
${orderByClause};
    `.trim();

    metadata = {
      tableAlias,
      whereParams,
      hasJoins: joins.length > 0,
      hasWhere: whereClause.length > 0,
      hasOrderBy: orderByClause.length > 0
    };
    break;
  }

  case 'POST': {
    operation = 'INSERT';

    // Extract columns and values from body
    const columns = Object.keys(bodyData);
    const values = Object.values(bodyData).map(escapeValue);

    if (columns.length === 0) {
      throw new Error('POST request requires body data with at least one field');
    }

    sqlQuery = `
INSERT INTO ${escapeIdentifier(table)} (${columns.map(escapeIdentifier).join(', ')})
VALUES (${values.join(', ')});
    `.trim();

    metadata = {
      columns,
      valueCount: values.length
    };
    break;
  }

  case 'PUT':
  case 'PATCH': {
    operation = 'UPDATE';

    // Extract SET clause from body
    const setClause = Object.entries(bodyData)
      .map(([key, value]) => `${escapeIdentifier(key)} = ${escapeValue(value)}`)
      .join(', ');

    if (!setClause) {
      throw new Error(`${method} request requires body data with at least one field to update`);
    }

    // Build WHERE clause from path params (usually contains ID)
    const whereClause = buildWhereClause(pathParams);

    if (!whereClause) {
      throw new Error(`${method} request requires path parameters (e.g., id) to identify the record to update`);
    }

    sqlQuery = `
UPDATE ${escapeIdentifier(table)}
SET ${setClause}
${whereClause};
    `.trim();

    metadata = {
      updateFields: Object.keys(bodyData),
      whereParams: pathParams
    };
    break;
  }

  case 'DELETE': {
    operation = 'DELETE';

    // Build WHERE clause from path params (usually contains ID)
    const whereClause = buildWhereClause(pathParams);

    if (!whereClause) {
      throw new Error('DELETE request requires path parameters (e.g., id) to identify the record to delete');
    }

    // Check if this is a soft delete (set is_active = 0) or hard delete
    const isSoftDelete = inputData.softDelete !== false; // Default to soft delete

    if (isSoftDelete) {
      // Soft delete: UPDATE table SET is_active = 0 WHERE ...
      sqlQuery = `
UPDATE ${escapeIdentifier(table)}
SET ${escapeIdentifier('is_active')} = 0
${whereClause};
      `.trim();

      metadata = {
        deleteType: 'soft',
        whereParams: pathParams
      };
    } else {
      // Hard delete: DELETE FROM table WHERE ...
      sqlQuery = `
DELETE FROM ${escapeIdentifier(table)}
${whereClause};
      `.trim();

      metadata = {
        deleteType: 'hard',
        whereParams: pathParams
      };
    }
    break;
  }

  default:
    throw new Error(`Unsupported HTTP method: ${method}. Supported: GET, POST, PUT, PATCH, DELETE`);
}

// Return the generated SQL query and metadata
return {
  json: {
    query: sqlQuery,
    operation,
    method,
    table,
    metadata,
    // Include original input for debugging
    debug: {
      inputKeys: Object.keys(inputData),
      pathParams,
      queryParams,
      bodyKeys: Object.keys(bodyData),
      hasJoins: joins.length > 0,
      selectColumns
    }
  }
};
