# Universal Query Builder for n8n Webhook MySQL Operations

A type-safe, configurable query builder system for the Office Application that handles SELECT, INSERT, UPDATE, and DELETE operations for all object entities.

## Features

- **Pagination support** with configurable defaults (page size, max page size)
- **Shared primary key pattern** (objects table + entity tables) for persons, companies, users, invoices, transactions
- **Old/New value pattern** for updates (audit trail support)
- **Soft delete support** for entities with `is_active` flag
- **Dynamic filtering and search** across configured columns
- **Translation/language support** for lookup tables
- **Pre-configured entity definitions** for all object types

## Files

| File | Description |
|------|-------------|
| `QueryBuilder.ts` | TypeScript version with full type definitions |
| `QueryBuilder.js` | JavaScript version for direct use in n8n Code nodes |
| `n8nHelpers.ts` | TypeScript helper functions for n8n webhook integration |

## Quick Start

### In n8n Code Node (JavaScript)

```javascript
const {
  createQueryBuilder,
  formatListResponse,
  formatErrorResponse
} = require('./query-builder/QueryBuilder');

// Get entity type from webhook context
const entityType = $input.first().json.entityType || 'persons';
const params = $input.first().json.query;

try {
  const builder = createQueryBuilder(entityType);
  const { query, countQuery } = builder.buildSelect(params);

  return [{ json: { query, countQuery } }];
} catch (error) {
  return [{ json: formatErrorResponse('QUERY_ERROR', error.message) }];
}
```

## Entity Types

### Main Entities (Shared Primary Key Pattern)

These entities share their primary key with the `objects` table:

| Entity Type | Table | Object Type Code |
|-------------|-------|------------------|
| `persons` | `persons` | `person` |
| `companies` | `companies` | `company` |
| `users` | `users` | `user` |
| `invoices` | `invoices` | `invoice` |
| `transactions` | `transactions` | `transaction` |

### Child Entities

These entities have their own primary keys but link to objects:

| Entity Type | Table | Description |
|-------------|-------|-------------|
| `object_addresses` | `object_addresses` | Addresses linked to objects |
| `object_contacts` | `object_contacts` | Contacts linked to objects |
| `object_identifications` | `object_identifications` | IDs linked to objects |
| `object_notes` | `object_notes` | Notes linked to objects |
| `object_relations` | `object_relations` | Relations between objects |
| `object_audits` | `object_audits` | Audit logs for objects |

### Lookup Tables

Use `lookup:` prefix for lookup/reference data:

```javascript
const builder = createQueryBuilder('lookup:address-types');
```

Available lookup types:
- `languages`, `object-types`, `object-statuses`
- `sexes`, `salutations`, `product-categories`
- `countries`, `currencies`
- `address-types`, `address-area-types`
- `contact-types`, `identification-types`
- `transaction-types`, `note-types`
- `object-relation-types`, `audit-actions`

### Translations

Use `translation` type for translations table (composite key):

```javascript
const builder = createQueryBuilder('translation');
```

## API Reference

### QueryBuilder

#### Constructor

```javascript
const builder = new QueryBuilder('persons');
// or
const builder = new QueryBuilder(customEntityConfig);
```

#### buildSelect(params)

Builds a SELECT query with pagination, filtering, and sorting.

```javascript
const result = builder.buildSelect({
  page: 1,
  per_page: 20,
  search: 'John',
  sort_by: 'last_name',
  sort_dir: 'ASC',
  object_status_id: 1,
  is_active: true
});

// Returns:
// {
//   query: 'SELECT ... FROM persons p ...',
//   countQuery: 'SELECT COUNT(*) as total FROM ...',
//   params: { page: 1, per_page: 20, offset: 0, search: 'John', ... }
// }
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `per_page` | number | 20 | Items per page (max 100) |
| `search` | string | - | Search term (searches configured columns) |
| `sort_by` | string | entity default | Column to sort by |
| `sort_dir` | 'ASC' \| 'DESC' | entity default | Sort direction |
| `object_status_id` | number | - | Filter by object status |
| `object_id` | number | - | Filter by parent object (child entities) |
| `is_active` | boolean | true | Filter by active status |

#### buildSelectById(id)

Builds a SELECT query for a single record by ID.

```javascript
const result = builder.buildSelectById(123);

// Returns:
// {
//   query: 'SELECT ... FROM persons p ... WHERE p.id = 123',
//   params: { id: 123 }
// }
```

#### buildInsert(data)

Builds an INSERT query. For shared primary key entities, creates a transaction with objects table insert.

```javascript
const result = builder.buildInsert({
  first_name: 'John',
  last_name: 'Doe',
  object_status_id: 1
});

// Returns (for persons):
// {
//   query: 'START TRANSACTION; INSERT INTO objects... INSERT INTO persons... COMMIT;',
//   params: { first_name: 'John', ... }
// }
```

#### buildUpdate(id, data, useOldNewPattern = false)

Builds an UPDATE query. Supports both simple updates and old/new pattern.

**Simple Update:**

```javascript
const result = builder.buildUpdate(123, {
  first_name: 'Jane',
  last_name: 'Smith'
});
```

**Old/New Pattern (for audit tracking):**

```javascript
const result = builder.buildUpdate(123, {
  first_name_old: 'John',
  first_name_new: 'Jane',
  last_name_old: 'Doe',
  last_name_new: 'Smith'
}, true);
```

#### buildDelete(id)

Builds a DELETE query. Uses soft delete for entities with `supportsSoftDelete` flag.

```javascript
const result = builder.buildDelete(123);

// Soft delete (addresses, contacts, etc.):
// UPDATE object_addresses SET is_active = 0 WHERE id = 123

// Hard delete via objects cascade (persons, companies, etc.):
// DELETE FROM objects WHERE id = 123
```

### LookupQueryBuilder

For lookup/reference tables with translation support.

```javascript
const builder = new LookupQueryBuilder('address-types');

// List with translations
const result = builder.buildSelect({ language_id: 1 });

// Create with translation
const result = builder.buildInsert({
  code: 'new_type',
  is_active: true,
  text: 'New Type',
  language_id: 1
});
```

### TranslationQueryBuilder

For the translations table (composite key: code + language_id).

```javascript
const builder = new TranslationQueryBuilder();

// List translations
const result = builder.buildSelect({ code: 'person', language_id: 1 });

// Upsert translation
const result = builder.buildUpsert({
  code: 'person',
  language_id: 1,
  text: 'Person'
});
```

### Factory Function

Use `createQueryBuilder` to automatically select the right builder:

```javascript
const { createQueryBuilder } = require('./QueryBuilder');

// Entity builder
const personBuilder = createQueryBuilder('persons');

// Lookup builder
const addressTypeBuilder = createQueryBuilder('lookup:address-types');

// Translation builder
const translationBuilder = createQueryBuilder('translation');
```

## Response Formatting

```javascript
const {
  formatListResponse,
  formatItemResponse,
  formatErrorResponse,
  formatSuccessResponse
} = require('./QueryBuilder');

// List response with pagination
const response = formatListResponse(data, total, page, perPage);
// { success: true, data: [...], pagination: { page, per_page, total, total_pages } }

// Single item response
const response = formatItemResponse(item);
// { success: true, data: {...} }

// Error response
const response = formatErrorResponse('NOT_FOUND', 'Resource not found');
// { success: false, error: { code: 'NOT_FOUND', message: 'Resource not found' } }

// Success response (for delete, etc.)
const response = formatSuccessResponse();
// { success: true, data: { success: true } }
```

## n8n Workflow Integration

### Example: Generic Entity Handler Workflow

1. **Webhook Trigger** - Receives HTTP requests
2. **Set Node** - Extracts entity type from path
3. **Code Node** - Builds query using QueryBuilder
4. **MySQL Node** - Executes the generated query
5. **Code Node** - Formats response

### Webhook Trigger Configuration

```
URL: /api/v1/:entityType
Methods: GET, POST, PUT, DELETE
```

### Set Node - Extract Entity Type

```javascript
// Extract entity type from URL path
const path = $input.first().json.path;
const entityType = path.split('/')[3]; // e.g., 'persons'

return [{
  json: {
    entityType,
    method: $input.first().json.method,
    params: $input.first().json.params,
    query: $input.first().json.query,
    body: $input.first().json.body
  }
}];
```

### Code Node - Build Query

```javascript
const { createQueryBuilder, formatErrorResponse } = require('./QueryBuilder');

const { entityType, method, params, query, body } = $input.first().json;

try {
  const builder = createQueryBuilder(entityType);
  let result;

  switch (method) {
    case 'GET':
      result = params.id
        ? builder.buildSelectById(params.id)
        : builder.buildSelect(query);
      break;
    case 'POST':
      result = builder.buildInsert(body);
      break;
    case 'PUT':
      result = builder.buildUpdate(params.id, body);
      break;
    case 'DELETE':
      result = builder.buildDelete(params.id);
      break;
  }

  return [{ json: result }];
} catch (error) {
  return [{ json: formatErrorResponse('QUERY_ERROR', error.message) }];
}
```

### Code Node - Format Response

```javascript
const {
  formatListResponse,
  formatItemResponse,
  formatSuccessResponse
} = require('./QueryBuilder');

const mysqlResult = $input.first().json;
const queryParams = $('Set').first().json.query;

// For list queries
if (Array.isArray(mysqlResult)) {
  const total = $('MySQL Count').first().json.total;
  return [{
    json: formatListResponse(
      mysqlResult,
      total,
      queryParams.page || 1,
      queryParams.per_page || 20
    )
  }];
}

// For single item queries
if (mysqlResult.id) {
  return [{ json: formatItemResponse(mysqlResult) }];
}

// For delete operations
return [{ json: formatSuccessResponse() }];
```

## Entity Configuration Reference

Each entity is configured with:

```typescript
interface EntityConfig {
  tableName: string;           // Database table name
  tableAlias: string;          // Alias for queries (e.g., 'p' for persons)
  objectTypeCode: string;      // Code in object_types table
  usesSharedPrimaryKey: boolean; // Uses objects table for ID
  columns: ColumnDefinition[];  // Column definitions
  defaultSelectColumns: string[]; // Columns to select by default
  searchColumns?: string[];     // Columns to search in
  defaultSortColumn: string;    // Default ORDER BY column
  defaultSortDirection: 'ASC' | 'DESC';
  joins?: JoinDefinition[];     // JOIN definitions
  supportsSoftDelete?: boolean; // Uses is_active for soft delete
  usesObjectDelete?: boolean;   // DELETE from objects table
}
```

### Column Definition

```typescript
interface ColumnDefinition {
  name: string;               // Column name
  type: ColumnType;           // Data type
  nullable?: boolean;         // Can be NULL
  defaultValue?: any;         // Default value
  isPrimaryKey?: boolean;     // Is primary key
  isForeignKey?: boolean;     // Is foreign key
  foreignKeyTable?: string;   // Referenced table
  searchable?: boolean;       // Include in search
  sortable?: boolean;         // Allow sorting
  trackChanges?: boolean;     // Use old/new pattern for updates
}
```

## Best Practices

1. **Always use parameterized values** - The builder escapes values to prevent SQL injection
2. **Use the old/new pattern for auditable updates** - Enables tracking what changed
3. **Leverage pagination** - Always paginate list queries to prevent memory issues
4. **Use soft deletes** - Prefer soft delete over hard delete for data recovery
5. **Cache lookup data** - Lookup tables change rarely, cache on the frontend

## Compliance with Office Application API

This query builder is fully compliant with:

- **Shared primary key pattern** - Creates objects table record first, uses LAST_INSERT_ID()
- **Old/new value pattern** - Matches frontend components like AddressesTable, ContactsTable
- **Soft delete pattern** - Sets is_active = 0 instead of hard delete
- **Language ID handling** - Supports translations via language_id parameter
- **Response format** - Matches expected { success, data, pagination } structure
- **Lookup table structure** - Handles translation joins and object_type_id filters
