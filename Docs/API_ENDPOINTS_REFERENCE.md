# Complete API Endpoints Reference with MySQL Queries

This document provides a comprehensive list of all API endpoints, their explanations, and the corresponding MySQL queries for n8n workflows.

## Table of Contents

1. [Lookup/Reference Data Endpoints](#lookup-reference-data-endpoints)
2. [Person Endpoints](#person-endpoints)
3. [Company Endpoints](#company-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Address Endpoints](#address-endpoints)
6. [Contact Endpoints](#contact-endpoints)
7. [Identification Endpoints](#identification-endpoints)
8. [Invoice Endpoints](#invoice-endpoints)
9. [Transaction Endpoints](#transaction-endpoints)
10. [Object Relation Endpoints](#object-relation-endpoints)
11. [Object Audit Endpoints](#object-audit-endpoints)
12. [Authentication Endpoints](#authentication-endpoints)

---

## Core Database Schema

### Shared Primary Key Pattern

This database uses a **shared primary key pattern** where entity-specific tables (persons, companies, users, invoices, transactions) share their primary key with the `objects` table. This means:

- The `objects.id` column generates the primary key
- Entity tables use that same ID value as their primary key
- Entity tables reference `objects.id` via a foreign key with `ON DELETE CASCADE`

### Objects Table (Central Entity Table)

```sql
CREATE TABLE objects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key - shared with entity tables',
    object_type_id INT NOT NULL COMMENT 'Type of object (person, company, user, invoice, transaction)',
    object_status_id INT NOT NULL COMMENT 'Status of the object (active, pending, etc.)',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (object_status_id) REFERENCES object_statuses(id) ON DELETE RESTRICT
);
```

**Note**: The `objects` table does NOT have `is_active`, `created_at`, or `updated_at` columns. These fields are handled by the entity-specific tables.

### Creating New Entities

When creating a new entity (person, company, user, etc.), follow this pattern:

1. Insert into `objects` table first to generate the shared ID
2. Use `LAST_INSERT_ID()` to get the generated ID
3. Insert into the entity table using that ID as the primary key

```sql
START TRANSACTION;

-- Step 1: Create the object record
INSERT INTO objects (object_type_id, object_status_id)
VALUES ((SELECT id FROM object_types WHERE code = 'person'), 1);

-- Step 2: Get the generated ID
SET @object_id = LAST_INSERT_ID();

-- Step 3: Insert into entity table using the same ID
INSERT INTO persons (id, first_name, last_name, ...)
VALUES (@object_id, 'John', 'Doe', ...);

COMMIT;
```

### Object Types Reference

| Code | ID | Description |
|------|-----|-------------|
| `person` | 1 | Natural person |
| `company` | 2 | Legal entity/company |
| `user` | 3 | System user |
| `invoice` | 4 | Invoice document |
| `transaction` | 5 | Financial transaction |

---

## Lookup/Reference Data Endpoints

All lookup table endpoints use a unified endpoint pattern: `/api/v1/lookups/:lookup_type`

### Unified Endpoint Pattern

**Base Endpoint**: `/api/v1/lookups/:lookup_type`

Where `:lookup_type` can be one of:
- `languages`
- `object-types`
- `object-statuses`
- `sexes`
- `salutations`
- `product-categories`
- `countries`
- `address-types`
- `address-area-types`
- `contact-types`
- `transaction-types`
- `currencies`
- `object-relation-types`
- `translations` (special structure - see below)

### CRUD Operations

All lookup tables support the following operations:

#### 1. List All Items

**Endpoint**: `GET /api/v1/lookups/:lookup_type`

**Description**: Retrieve all items for the specified lookup type with optional language-specific translations.

**Query Parameters** (optional):
- `language_code`: Language code for translations (e.g., `en`, `hu`, `de`) - Returns translations in specified language
- `language_id`: Language ID for translations (e.g., `1`, `2`, `3`) - Alternative to language_code
- `object_type_id` (for object-statuses only): Filter by object type
- `code` (for translations only): Filter by translation code
- `is_active`: Filter by active status (default: `true`)

**Language Selection Priority**:
1. `language_id` (if provided) - Takes precedence
2. `language_code` (if provided) - Used if language_id not provided
3. Default: `'en'` (English) - Used if neither is provided

**Example**: `GET /api/v1/lookups/languages`

**Example with Language**: `GET /api/v1/lookups/object-types?language_code=hu`

**Response** (without language parameter - defaults to English):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "en",
      "is_active": true,
      "name": "English"
    }
  ]
}
```

**Response** (with `language_code=hu` - Hungarian translations):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "en",
      "is_active": true,
      "name": "Angol"
    }
  ]
}
```

**n8n Webhook Path**: `/api/v1/lookups/:lookup_type`

**n8n Implementation Notes**:
- Extract `lookup_type` from path parameter: `{{ $json.params.lookup_type }}`
- Use the `lookup_type` to determine which table to query
- See `n8n_lookup_node_setup.md` for dynamic lookup handler implementation

---

#### 2. Get Single Item

**Endpoint**: `GET /api/v1/lookups/:lookup_type/:id`

**Description**: Retrieve a single item by ID.

**Example**: `GET /api/v1/lookups/languages/1`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "en",
    "is_active": true
  }
}
```

**n8n Implementation**:
- Extract `lookup_type` from `{{ $json.params.lookup_type }}`
- Extract `id` from `{{ $json.params.id }}`
- Query: `SELECT * FROM {{ lookup_type_table }} WHERE id = {{ $json.params.id }}`

---

#### 3. Create Item

**Endpoint**: `POST /api/v1/lookups/:lookup_type`

**Description**: Create a new item in the specified lookup table. Optionally includes translation data for the current language.

**Request Body**:
```json
{
  "code": "new_code",
  "is_active": true,
  "text": "Translation text in current language",
  "language_id": 1
}
```

**Fields**:
- `code` (required): Unique code for the lookup item
- `is_active` (optional, default: `true`): Active status
- `text` (optional): Translation text for the current language
- `language_id` (optional): Language ID for the translation. If provided with `text`, creates/updates the translation for this language. If `text` is provided without `language_id`, uses the current request language context.

**Example**: `POST /api/v1/lookups/languages`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "code": "new_code",
    "is_active": true
  }
}
```

**Note**: If `text` and `language_id` are provided, the API will automatically create or update the translation entry in the `translations` table for the specified language. If `text` is provided without `language_id`, the system will use the current language context from the request headers or session.

**n8n Implementation**:
- Extract `lookup_type` from `{{ $json.params.lookup_type }}`
- Insert into appropriate table based on `lookup_type`
- If `text` and `language_id` are provided, insert/update corresponding entry in `translations` table
- Return created item

---

#### 4. Update Item

**Endpoint**: `PUT /api/v1/lookups/:lookup_type/:id`

**Description**: Update an existing item. Optionally includes translation data for the current language.

**Request Body** (all fields optional):
```json
{
  "code": "updated_code",
  "is_active": false,
  "text": "Updated translation text in current language",
  "language_id": 1
}
```

**Fields**:
- `code` (optional): Updated code for the lookup item
- `is_active` (optional): Updated active status
- `text` (optional): Translation text for the current language. If provided, updates the translation for the specified or current language.
- `language_id` (optional): Language ID for the translation. If provided with `text`, updates the translation for this language. If `text` is provided without `language_id`, uses the current request language context.

**Example**: `PUT /api/v1/lookups/languages/1`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "updated_code",
    "is_active": false
  }
}
```

**Note**: If `text` and `language_id` are provided, the API will automatically update the translation entry in the `translations` table for the specified language. If the translation doesn't exist, it will be created. If `text` is provided without `language_id`, the system will use the current language context from the request headers or session.

**n8n Implementation**:
- Extract `lookup_type` and `id` from path parameters
- Update table based on `lookup_type`
- If `text` and `language_id` are provided, update/create corresponding entry in `translations` table
- Return updated item

---

#### 5. Delete Item

**Endpoint**: `DELETE /api/v1/lookups/:lookup_type/:id`

**Description**: Delete (soft delete by setting is_active=false) an item.

**Example**: `DELETE /api/v1/lookups/languages/1`

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true
  }
}
```

**n8n Implementation**:
- Extract `lookup_type` and `id` from path parameters
- Update `is_active = 0` in the appropriate table
- Return success confirmation

---

### Supported Lookup Types

| Lookup Type | Table Name | Description |
|------------|------------|-------------|
| `languages` | `languages` | Supported language codes (ISO codes) |
| `object-types` | `object_types` | Entity type classification (person, company, user, etc.) |
| `object-statuses` | `object_statuses` | Status values for objects (supports `object_type_id` filter) |
| `sexes` | `sexes` | Gender/sex options |
| `salutations` | `salutations` | Title prefixes (Mr., Mrs., Dr., etc.) |
| `product-categories` | `product_categories` | Product categorization |
| `countries` | `countries` | Country codes (ISO codes) |
| `address-types` | `address_types` | Address classification (home, work, etc.) |
| `address-area-types` | `address_area_types` | Street/area type (street, avenue, etc.) |
| `contact-types` | `contact_types` | Contact method types (phone, email, etc.) |
| `transaction-types` | `transaction_types` | Transaction classification (SALE, PURCHASE, etc.) |
| `currencies` | `currencies` | Currency codes (ISO codes) |
| `object-relation-types` | `object_relation_types` | Relationship types between objects (special structure - see below) |
| `translations` | `translations` | Multi-language text storage (special structure) |

---

### Special Case: Translations

Translations use a composite key (code + language_id) instead of a single ID.

**List Translations**: `GET /api/v1/lookups/translations?code={code}&language_id={id}`

**Get Translation**: `GET /api/v1/lookups/translations/:code/:language_id`

**Create Translation**: `POST /api/v1/lookups/translations`
```json
{
  "code": "translation_code",
  "language_id": 1,
  "text": "Translated text"
}
```

**Update Translation**: `PUT /api/v1/lookups/translations/:code/:language_id`
```json
{
  "text": "Updated translated text"
}
```

**Delete Translation**: `DELETE /api/v1/lookups/translations/:code/:language_id`

---

### Special Case: Object Relation Types

Object relation types define relationships between objects and have additional fields for parent/child object types and mirrored relationships.

**Database Schema**:
```sql
CREATE TABLE object_relation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Relation type code (e.g., mother, son, employer, worker)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this relation type is currently active',
    parent_object_type_id INT COMMENT 'Parent object type ID (references object_types.id)',
    child_object_type_id INT COMMENT 'Child object type ID (references object_types.id)',
    mirrored_type_id INT COMMENT 'Mirrored relation type ID (references object_relation_types.id)',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (parent_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (child_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (mirrored_type_id) REFERENCES object_relation_types(id) ON DELETE RESTRICT
);
```

**List Object Relation Types**: `GET /api/v1/lookups/object-relation-types?language_code={lang}&parent_object_type_id={id}&child_object_type_id={id}`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "mother",
      "is_active": true,
      "parent_object_type_id": 1,
      "child_object_type_id": 1,
      "mirrored_type_id": 2,
      "name": "Mother"
    }
  ]
}
```

**Create Object Relation Type**: `POST /api/v1/lookups/object-relation-types`
```json
{
  "code": "employer",
  "is_active": true,
  "parent_object_type_id": 2,
  "child_object_type_id": 1,
  "mirrored_type_id": null,
  "text": "Employer",
  "language_id": 1
}
```

**Update Object Relation Type**: `PUT /api/v1/lookups/object-relation-types/:id`
```json
{
  "is_active": true,
  "parent_object_type_id": 2,
  "child_object_type_id": 1,
  "mirrored_type_id": 5,
  "text": "Employer Updated",
  "language_id": 1
}
```

**Relationship Examples**:
- **Family (Person → Person)**: mother ↔ child, father ↔ child, spouse ↔ spouse
- **Business (Company → Person)**: employer ↔ worker
- **Symmetric**: spouse (self-mirrored), sibling (self-mirrored), business_partner (self-mirrored)

**MySQL Query (Get with translations)**:
```sql
SELECT
    ort.id,
    ort.code,
    ort.is_active,
    ort.parent_object_type_id,
    ort.child_object_type_id,
    ort.mirrored_type_id,
    t.text as name
FROM object_relation_types ort
LEFT JOIN translations t ON t.code = ort.code
    AND t.language_id = (SELECT id FROM languages WHERE code = {{ $json.query.language_code }} OR {{ $json.query.language_code }} IS NULL LIMIT 1)
WHERE ort.is_active = 1
    AND ({{ $json.query.parent_object_type_id }} IS NULL OR ort.parent_object_type_id = {{ $json.query.parent_object_type_id }})
    AND ({{ $json.query.child_object_type_id }} IS NULL OR ort.child_object_type_id = {{ $json.query.child_object_type_id }})
ORDER BY ort.code;
```

---

### Example MySQL Queries for n8n

**Get All Languages**:
```sql
SELECT 
    id,
    code,
    is_active
FROM languages
WHERE is_active = 1
ORDER BY code;
```

**Get Object Types with Translations**:
```sql
SELECT 
    ot.id,
    ot.code,
    ot.is_active,
    t.text as name
FROM object_types ot
LEFT JOIN translations t ON t.code = ot.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE ot.is_active = 1
ORDER BY ot.code;
```

**Get Object Statuses (with optional filter)**:
```sql
SELECT 
    os.id,
    os.code,
    os.is_active,
    os.object_type_id,
    t.text as name
FROM object_statuses os
LEFT JOIN translations t ON t.code = os.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE os.is_active = 1
    AND ({{ $json.query.object_type_id }} IS NULL OR os.object_type_id = {{ $json.query.object_type_id }})
ORDER BY os.code;
```

**Create Language**:
```sql
INSERT INTO languages (code, is_active)
VALUES ({{ $json.body.code }}, COALESCE({{ $json.body.is_active }}, 1));

SELECT * FROM languages WHERE id = LAST_INSERT_ID();
```

**Update Language**:
```sql
UPDATE languages
SET 
    code = COALESCE({{ $json.body.code }}, code),
    is_active = COALESCE({{ $json.body.is_active }}, is_active)
WHERE id = {{ $json.params.id }};

SELECT * FROM languages WHERE id = {{ $json.params.id }};
```

**Delete Language (Soft Delete)**:
```sql
UPDATE languages
SET is_active = 0
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Person Endpoints

### Database Schema Reference

The `persons` table uses a shared primary key pattern with the `objects` table:

```sql
CREATE TABLE persons (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    first_name VARCHAR(100) NOT NULL COMMENT 'First/given name',
    middle_name VARCHAR(100) COMMENT 'Middle name (optional)',
    last_name VARCHAR(100) NOT NULL COMMENT 'Last/family name',
    mother_name VARCHAR(100) COMMENT 'Mother\'s name (for cultural requirements)',
    sex_id INT COMMENT 'Sex/gender from sexes table',
    salutation_id INT COMMENT 'Title/salutation from salutations table',
    birth_date DATE COMMENT 'Date of birth',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (sex_id) REFERENCES sexes(id) ON DELETE RESTRICT,
    FOREIGN KEY (salutation_id) REFERENCES salutations(id) ON DELETE RESTRICT
);
```

**Note**: The `persons.id` column IS the `objects.id` (shared primary key pattern). There is no separate `object_id` column. Contact information (email, phone) is stored in the `object_contacts` table.

---

### 15. List Persons

**Endpoint**: `GET /api/v1/persons?page=1&per_page=20&object_status_id={id}&search={term}`

**Description**: Retrieve a paginated list of persons with optional filtering and search.

**Request Parameters**:
- `page` (default: 1): Page number
- `per_page` (default: 20): Items per page
- `object_status_id` (optional): Filter by status
- `search` (optional): Search term (searches first_name, last_name)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "middle_name": null,
      "last_name": "Doe",
      "mother_name": null,
      "sex_id": 1,
      "salutation_id": 2,
      "birth_date": "1990-01-15",
      "object_status_id": 1,
      "object_type_id": 1
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM persons p
JOIN objects o ON o.id = p.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

-- Get paginated results
SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.mother_name,
    p.sex_id,
    p.salutation_id,
    p.birth_date,
    o.object_status_id,
    o.object_type_id
FROM persons p
JOIN objects o ON o.id = p.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    )
ORDER BY p.last_name, p.first_name
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 16. Get Person by ID

**Endpoint**: `GET /api/v1/persons/{id}`

**Description**: Retrieve a single person by ID.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "middle_name": null,
    "last_name": "Doe",
    "mother_name": null,
    "sex_id": 1,
    "salutation_id": 2,
    "birth_date": "1990-01-15",
    "object_status_id": 1,
    "object_type_id": 1
  }
}
```

**MySQL Query**:
```sql
SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.mother_name,
    p.sex_id,
    p.salutation_id,
    p.birth_date,
    o.object_status_id,
    o.object_type_id
FROM persons p
JOIN objects o ON o.id = p.id
WHERE p.id = {{ $json.params.id }};
```

---

### 17. Create Person

**Endpoint**: `POST /api/v1/persons`

**Description**: Create a new person. The person's ID will be the same as the object ID (shared primary key pattern).

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "middle_name": null,
  "mother_name": null,
  "object_status_id": 1,
  "sex_id": 1,
  "salutation_id": 1,
  "birth_date": "1990-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "first_name": "John",
    "middle_name": null,
    "last_name": "Doe",
    "mother_name": null,
    "sex_id": 1,
    "salutation_id": 1,
    "birth_date": "1990-01-15",
    "object_status_id": 1,
    "object_type_id": 1
  }
}
```

**MySQL Query**:
```sql
-- Start transaction
START TRANSACTION;

-- Insert into objects table first (generates the shared ID)
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'person'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

-- Insert into persons table using the same ID
INSERT INTO persons (
    id,
    first_name,
    last_name,
    middle_name,
    mother_name,
    birth_date,
    sex_id,
    salutation_id
) VALUES (
    @object_id,
    {{ $json.body.first_name }},
    {{ $json.body.last_name }},
    {{ $json.body.middle_name }},
    {{ $json.body.mother_name }},
    {{ $json.body.birth_date }},
    {{ $json.body.sex_id }},
    {{ $json.body.salutation_id }}
);

-- Commit transaction
COMMIT;

-- Return created person
SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.mother_name,
    p.sex_id,
    p.salutation_id,
    p.birth_date,
    o.object_status_id,
    o.object_type_id
FROM persons p
JOIN objects o ON o.id = p.id
WHERE p.id = @object_id;
```

---

### 18. Update Person

**Endpoint**: `PUT /api/v1/persons/{id}`

**Description**: Update an existing person.

**Request Body**: Partial update (only include fields to update)
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "object_status_id": 2
}
```

**MySQL Query**:
```sql
-- Update persons table
UPDATE persons p
JOIN objects o ON o.id = p.id
SET
    p.first_name = COALESCE({{ $json.body.first_name }}, p.first_name),
    p.last_name = COALESCE({{ $json.body.last_name }}, p.last_name),
    p.middle_name = COALESCE({{ $json.body.middle_name }}, p.middle_name),
    p.mother_name = COALESCE({{ $json.body.mother_name }}, p.mother_name),
    p.birth_date = COALESCE({{ $json.body.birth_date }}, p.birth_date),
    p.sex_id = COALESCE({{ $json.body.sex_id }}, p.sex_id),
    p.salutation_id = COALESCE({{ $json.body.salutation_id }}, p.salutation_id),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE p.id = {{ $json.params.id }};

-- Return updated person
SELECT
    p.id,
    p.first_name,
    p.middle_name,
    p.last_name,
    p.mother_name,
    p.sex_id,
    p.salutation_id,
    p.birth_date,
    o.object_status_id,
    o.object_type_id
FROM persons p
JOIN objects o ON o.id = p.id
WHERE p.id = {{ $json.params.id }};
```

---

### 19. Delete Person

**Endpoint**: `DELETE /api/v1/persons/{id}`

**Description**: Delete a person. This will cascade delete the person record since `persons.id` references `objects.id` with `ON DELETE CASCADE`.

**MySQL Query**:
```sql
-- Delete object (cascades to persons table)
DELETE FROM objects
WHERE id = {{ $json.params.id }};

-- Return success
SELECT 1 as success;
```

**Note**: The `persons` table has `FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE`, so deleting the object will automatically delete the person record.

---

## Company Endpoints

### Database Schema Reference

The `companies` table uses a shared primary key pattern with the `objects` table:

```sql
CREATE TABLE companies (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    company_id VARCHAR(255) NOT NULL COMMENT 'Company registration/tax ID (business identifier)',
    company_name VARCHAR(255) NOT NULL COMMENT 'Legal company name',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE
);
```

**Note**: The `companies.id` column IS the `objects.id` (shared primary key pattern). There is no separate `object_id` column.

---

### 20. List Companies

**Endpoint**: `GET /api/v1/companies?page=1&per_page=20&object_status_id={id}&search={term}`

**Description**: Retrieve a paginated list of companies.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "company_name": "Acme Corp",
      "company_id": "REG-12345",
      "object_status_id": 1,
      "object_type_id": 2
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM companies c
JOIN objects o ON o.id = c.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        c.company_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        c.company_id LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

-- Get paginated results
SELECT
    c.id,
    c.company_name,
    c.company_id,
    o.object_status_id,
    o.object_type_id
FROM companies c
JOIN objects o ON o.id = c.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        c.company_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        c.company_id LIKE CONCAT('%', {{ $json.query.search }}, '%')
    )
ORDER BY c.company_name
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 21. Get Company by ID

**Endpoint**: `GET /api/v1/companies/{id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "company_name": "Acme Corp",
    "company_id": "REG-12345",
    "object_status_id": 1,
    "object_type_id": 2
  }
}
```

**MySQL Query**:
```sql
SELECT
    c.id,
    c.company_name,
    c.company_id,
    o.object_status_id,
    o.object_type_id
FROM companies c
JOIN objects o ON o.id = c.id
WHERE c.id = {{ $json.params.id }};
```

---

### 22. Create Company

**Endpoint**: `POST /api/v1/companies`

**Request Body**:
```json
{
  "company_name": "Acme Corp",
  "company_id": "REG-12345",
  "object_status_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "company_name": "Acme Corp",
    "company_id": "REG-12345",
    "object_status_id": 1,
    "object_type_id": 2
  }
}
```

**MySQL Query**:
```sql
START TRANSACTION;

-- Insert into objects table first (generates the shared ID)
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'company'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

-- Insert into companies table using the same ID
INSERT INTO companies (
    id,
    company_name,
    company_id
) VALUES (
    @object_id,
    {{ $json.body.company_name }},
    {{ $json.body.company_id }}
);

COMMIT;

-- Return created company
SELECT
    c.id,
    c.company_name,
    c.company_id,
    o.object_status_id,
    o.object_type_id
FROM companies c
JOIN objects o ON o.id = c.id
WHERE c.id = @object_id;
```

---

### 23. Update Company

**Endpoint**: `PUT /api/v1/companies/{id}`

**Request Body**: Partial update (only include fields to update)
```json
{
  "company_name": "Acme Corporation",
  "object_status_id": 2
}
```

**MySQL Query**:
```sql
UPDATE companies c
JOIN objects o ON o.id = c.id
SET
    c.company_name = COALESCE({{ $json.body.company_name }}, c.company_name),
    c.company_id = COALESCE({{ $json.body.company_id }}, c.company_id),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE c.id = {{ $json.params.id }};

-- Return updated company
SELECT
    c.id,
    c.company_name,
    c.company_id,
    o.object_status_id,
    o.object_type_id
FROM companies c
JOIN objects o ON o.id = c.id
WHERE c.id = {{ $json.params.id }};
```

---

### 24. Delete Company

**Endpoint**: `DELETE /api/v1/companies/{id}`

**Description**: Delete a company. This will cascade delete the company record.

**MySQL Query**:
```sql
-- Delete object (cascades to companies table)
DELETE FROM objects
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

**Note**: The `companies` table has `FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE`, so deleting the object will automatically delete the company record.

---

## User Endpoints

### Database Schema Reference

The `users` table uses a shared primary key pattern with the `objects` table. Passwords are stored separately in `user_passwords`:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    username VARCHAR(255) COMMENT 'Username for login (should be unique)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE
);

CREATE TABLE user_passwords (
    user_id BIGINT PRIMARY KEY COMMENT 'References users.id',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt, argon2, etc.)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this password is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Note**: The `users.id` column IS the `objects.id` (shared primary key pattern). There is no separate `object_id` column. User passwords are stored in a separate `user_passwords` table for security.

---

### 25. List Users

**Endpoint**: `GET /api/v1/users?page=1&per_page=20&object_status_id={id}&search={term}`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "johndoe",
      "object_status_id": 1,
      "object_type_id": 3
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 10,
    "total_pages": 1
  }
}
```

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM users u
JOIN objects o ON o.id = u.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        u.username LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

-- Get paginated results
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
JOIN objects o ON o.id = u.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        u.username LIKE CONCAT('%', {{ $json.query.search }}, '%')
    )
ORDER BY u.username
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 26. Get User by ID

**Endpoint**: `GET /api/v1/users/{id}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "object_status_id": 1,
    "object_type_id": 3
  }
}
```

**MySQL Query**:
```sql
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
JOIN objects o ON o.id = u.id
WHERE u.id = {{ $json.params.id }};
```

---

### 27. Create User

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "password123",
  "object_status_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 100,
    "username": "johndoe",
    "object_status_id": 1,
    "object_type_id": 3
  }
}
```

**MySQL Query**:
```sql
START TRANSACTION;

-- Insert into objects table first (generates the shared ID)
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'user'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

-- Insert into users table using the same ID
INSERT INTO users (
    id,
    username
) VALUES (
    @object_id,
    {{ $json.body.username }}
);

-- Insert password into user_passwords table (password should be hashed before insertion)
INSERT INTO user_passwords (
    user_id,
    password_hash,
    is_active
) VALUES (
    @object_id,
    {{ $json.body.password }},  -- Should be hashed (bcrypt, argon2, etc.) before insertion
    TRUE
);

COMMIT;

-- Return created user (without password)
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
JOIN objects o ON o.id = u.id
WHERE u.id = @object_id;
```

---

### 28. Update User

**Endpoint**: `PUT /api/v1/users/{id}`

**Request Body**: Partial update (only include fields to update)
```json
{
  "username": "johndoe_updated",
  "object_status_id": 2
}
```

**MySQL Query**:
```sql
UPDATE users u
JOIN objects o ON o.id = u.id
SET
    u.username = COALESCE({{ $json.body.username }}, u.username),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE u.id = {{ $json.params.id }};

-- If password is being updated, update user_passwords separately
-- UPDATE user_passwords SET password_hash = {{ $json.body.password }}, updated_at = NOW()
-- WHERE user_id = {{ $json.params.id }} AND is_active = TRUE;

-- Return updated user
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
JOIN objects o ON o.id = u.id
WHERE u.id = {{ $json.params.id }};
```

---

### 29. Delete User

**Endpoint**: `DELETE /api/v1/users/{id}`

**Description**: Delete a user. This will cascade delete the user record and associated password.

**MySQL Query**:
```sql
-- Delete object (cascades to users and user_passwords tables)
DELETE FROM objects
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

**Note**: The `users` table has `FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE`, and `user_passwords` has `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`, so deleting the object will automatically delete both the user and password records.

---

## Address Endpoints

### Database Schema Reference

```sql
CREATE TABLE object_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id',
    address_type_id INT NOT NULL COMMENT 'Type of address (home, work, etc.)',
    street_address_1 VARCHAR(255) NOT NULL COMMENT 'Primary street address',
    street_address_2 VARCHAR(255) COMMENT 'Secondary street address (apt, suite, etc.)',
    address_area_type_id INT COMMENT 'Street/area type (street, avenue, etc.)',
    city VARCHAR(100) NOT NULL COMMENT 'City name',
    state_province VARCHAR(100) COMMENT 'State or province',
    postal_code VARCHAR(20) COMMENT 'Postal/ZIP code',
    country_id INT NOT NULL COMMENT 'Country from countries table',
    latitude DECIMAL(10, 8) COMMENT 'Geographic latitude',
    longitude DECIMAL(11, 8) COMMENT 'Geographic longitude',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this address is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT 'User/object who created this address',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (address_type_id) REFERENCES address_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_area_type_id) REFERENCES address_area_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL
);
```

---

### 30. Get Object Addresses

**Endpoint**: `GET /api/v1/objects/{object_id}/addresses?is_active={true|false}`

**Description**: Retrieve all addresses for a specific object.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 100,
      "address_type_id": 1,
      "street_address_1": "123 Main Street",
      "street_address_2": "Apt 4B",
      "address_area_type_id": 1,
      "city": "New York",
      "state_province": "NY",
      "postal_code": "10001",
      "country_id": 1,
      "latitude": 40.71280000,
      "longitude": -74.00600000,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_by": 1
    }
  ]
}
```

**MySQL Query**:
```sql
SELECT
    oa.id,
    oa.object_id,
    oa.address_type_id,
    oa.street_address_1,
    oa.street_address_2,
    oa.address_area_type_id,
    oa.city,
    oa.state_province,
    oa.postal_code,
    oa.country_id,
    oa.latitude,
    oa.longitude,
    oa.is_active,
    oa.created_at,
    oa.updated_at,
    oa.created_by
FROM object_addresses oa
WHERE oa.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR oa.is_active = {{ $json.query.is_active }})
ORDER BY oa.created_at DESC;
```

---

### 31. Add Address to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/addresses`

**Request Body**:
```json
{
  "address_type_id": 1,
  "street_address_1": "123 Main Street",
  "street_address_2": "Apt 4B",
  "address_area_type_id": 1,
  "city": "New York",
  "state_province": "NY",
  "postal_code": "10001",
  "country_id": 1,
  "latitude": 40.7128,
  "longitude": -74.006,
  "created_by": 1
}
```

**MySQL Query**:
```sql
INSERT INTO object_addresses (
    object_id,
    address_type_id,
    street_address_1,
    street_address_2,
    address_area_type_id,
    city,
    state_province,
    postal_code,
    country_id,
    latitude,
    longitude,
    is_active,
    created_by
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.address_type_id }},
    {{ $json.body.street_address_1 }},
    {{ $json.body.street_address_2 }},
    {{ $json.body.address_area_type_id }},
    {{ $json.body.city }},
    {{ $json.body.state_province }},
    {{ $json.body.postal_code }},
    {{ $json.body.country_id }},
    {{ $json.body.latitude }},
    {{ $json.body.longitude }},
    1,
    {{ $json.body.created_by }}
);

SELECT * FROM object_addresses WHERE id = LAST_INSERT_ID();
```

---

### 32. Update Address

**Endpoint**: `PUT /api/v1/addresses/{address_id}`

**MySQL Query**:
```sql
UPDATE object_addresses
SET
    address_type_id = COALESCE({{ $json.body.address_type_id }}, address_type_id),
    street_address_1 = COALESCE({{ $json.body.street_address_1 }}, street_address_1),
    street_address_2 = COALESCE({{ $json.body.street_address_2 }}, street_address_2),
    address_area_type_id = COALESCE({{ $json.body.address_area_type_id }}, address_area_type_id),
    city = COALESCE({{ $json.body.city }}, city),
    state_province = COALESCE({{ $json.body.state_province }}, state_province),
    postal_code = COALESCE({{ $json.body.postal_code }}, postal_code),
    country_id = COALESCE({{ $json.body.country_id }}, country_id),
    latitude = COALESCE({{ $json.body.latitude }}, latitude),
    longitude = COALESCE({{ $json.body.longitude }}, longitude),
    is_active = COALESCE({{ $json.body.is_active }}, is_active)
WHERE id = {{ $json.params.address_id }};

SELECT * FROM object_addresses WHERE id = {{ $json.params.address_id }};
```

---

### 33. Delete Address

**Endpoint**: `DELETE /api/v1/addresses/{address_id}`

**MySQL Query**:
```sql
UPDATE object_addresses
SET is_active = 0
WHERE id = {{ $json.params.address_id }};

SELECT 1 as success;
```

---

## Contact Endpoints

### Database Schema Reference

```sql
CREATE TABLE object_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id',
    contact_type_id INT NOT NULL COMMENT 'Type of contact (phone, email, etc.)',
    contact_value VARCHAR(255) NOT NULL COMMENT 'Contact value (phone number, email address, etc.)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this contact is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT 'User/object who created this contact',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_type_id) REFERENCES contact_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL
);
```

---

### 34. Get Object Contacts

**Endpoint**: `GET https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:object_id/contacts?is_active={true|false}&contact_type_id={type_id}`

**Note**: The base URL `https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f` should be set in `NEXT_PUBLIC_API_BASE_URL` environment variable.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 100,
      "contact_type_id": 1,
      "contact_value": "john@example.com",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_by": 1
    }
  ]
}
```

**MySQL Query**:
```sql
SELECT
    oc.id,
    oc.object_id,
    oc.contact_type_id,
    oc.contact_value,
    oc.is_active,
    oc.created_at,
    oc.updated_at,
    oc.created_by
FROM object_contacts oc
WHERE oc.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR oc.is_active = {{ $json.query.is_active }})
    AND ({{ $json.query.contact_type_id }} IS NULL OR oc.contact_type_id = {{ $json.query.contact_type_id }})
ORDER BY oc.created_at DESC;
```

---

### 35. Add Contact to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/contacts`

**Request Body**:
```json
{
  "contact_type_id": 1,
  "contact_value": "john@example.com",
  "created_by": 1
}
```

**MySQL Query**:
```sql
INSERT INTO object_contacts (
    object_id,
    contact_type_id,
    contact_value,
    is_active,
    created_by
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.contact_type_id }},
    {{ $json.body.contact_value }},
    1,
    {{ $json.body.created_by }}
);

SELECT * FROM object_contacts WHERE id = LAST_INSERT_ID();
```

---

### 36. Update Contact

**Endpoint**: `PUT /api/v1/contacts/{contact_id}`

**MySQL Query**:
```sql
UPDATE object_contacts
SET
    contact_type_id = COALESCE({{ $json.body.contact_type_id }}, contact_type_id),
    contact_value = COALESCE({{ $json.body.contact_value }}, contact_value),
    is_active = COALESCE({{ $json.body.is_active }}, is_active)
WHERE id = {{ $json.params.contact_id }};

SELECT * FROM object_contacts WHERE id = {{ $json.params.contact_id }};
```

---

### 37. Delete Contact

**Endpoint**: `DELETE /api/v1/contacts/{contact_id}`

**MySQL Query**:
```sql
UPDATE object_contacts
SET is_active = 0
WHERE id = {{ $json.params.contact_id }};

SELECT 1 as success;
```

---

## Identification Endpoints

### Database Schema Reference

```sql
CREATE TABLE object_identifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id',
    identification_type_id INT NOT NULL COMMENT 'Type of identification document',
    identification_value VARCHAR(255) NOT NULL COMMENT 'Identification number/value',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this identification is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT COMMENT 'User/object who created this identification',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (identification_type_id) REFERENCES identification_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL
);
```

---

### 38. Get Object Identifications

**Endpoint**: `GET /api/v1/objects/{object_id}/identifications?is_active={true|false}`

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 100,
      "identification_type_id": 1,
      "identification_value": "P123456789",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_by": 1
    }
  ]
}
```

**MySQL Query**:
```sql
SELECT
    oi.id,
    oi.object_id,
    oi.identification_type_id,
    oi.identification_value,
    oi.is_active,
    oi.created_at,
    oi.updated_at,
    oi.created_by
FROM object_identifications oi
WHERE oi.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR oi.is_active = {{ $json.query.is_active }})
ORDER BY oi.created_at DESC;
```

---

### 39. Add Identification to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/identifications`

**Request Body**:
```json
{
  "identification_type_id": 1,
  "identification_value": "P123456789",
  "created_by": 1
}
```

**MySQL Query**:
```sql
INSERT INTO object_identifications (
    object_id,
    identification_type_id,
    identification_value,
    is_active,
    created_by
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.identification_type_id }},
    {{ $json.body.identification_value }},
    1,
    {{ $json.body.created_by }}
);

SELECT * FROM object_identifications WHERE id = LAST_INSERT_ID();
```

---

### 40. Update Identification

**Endpoint**: `PUT /api/v1/identifications/{identification_id}`

**MySQL Query**:
```sql
UPDATE object_identifications
SET
    identification_type_id = COALESCE({{ $json.body.identification_type_id }}, identification_type_id),
    identification_value = COALESCE({{ $json.body.identification_value }}, identification_value),
    is_active = COALESCE({{ $json.body.is_active }}, is_active)
WHERE id = {{ $json.params.identification_id }};

SELECT * FROM object_identifications WHERE id = {{ $json.params.identification_id }};
```

---

### 41. Delete Identification

**Endpoint**: `DELETE /api/v1/identifications/{identification_id}`

**MySQL Query**:
```sql
UPDATE object_identifications
SET is_active = 0
WHERE id = {{ $json.params.identification_id }};

SELECT 1 as success;
```

---

## Notes Endpoints

### Database Schema Reference

```sql
CREATE TABLE note_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Note type code (e.g., note_general, note_meeting)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this note type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

CREATE TABLE object_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id - the object this note belongs to',
    note_type_id INT COMMENT 'Optional: Type of note (general, meeting, reminder, etc.)',
    subject_code VARCHAR(100) COMMENT 'Translation code for subject - references translations(code)',
    note_text_code VARCHAR(100) NOT NULL COMMENT 'Translation code for note content - references translations(code)',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT 'Whether this note should be pinned/highlighted',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this note is currently active (soft delete)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the note was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the note was last updated',
    created_by BIGINT COMMENT 'User/object who created this note',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (note_type_id) REFERENCES note_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (note_text_code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL
);
```

**Note**: The `subject_code` and `note_text_code` columns reference the `translations` table, allowing multi-language support for note content. Translation codes are typically generated as `note_subject_{note_id}` and `note_text_{note_id}`.

---

### 42. Get Object Notes

**Endpoint**: `GET /api/v1/objects/{object_id}/notes?is_active={true|false}&is_pinned={true|false}`

**Headers**:
- `X-Language-ID`: Language ID for translations (e.g., `1` for English, `2` for German, `3` for Hungarian)

**Description**: Retrieve all notes for a specific object with translated content, optionally filtered by active status or pinned status. The `language_id` is sent via the `X-Language-ID` header (NOT in query string) to avoid SQL WHERE clause conflicts.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 100,
      "note_type_id": 1,
      "subject_code": "note_subject_1",
      "note_text_code": "note_text_1",
      "subject": "First meeting",
      "note_text": "Discussed project requirements and timeline.",
      "is_pinned": false,
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "created_by": 1
    }
  ]
}
```

**MySQL Query**:
```sql
-- Note: language_id is read from X-Language-ID header, not from query params
SELECT
    n.id,
    n.object_id,
    n.note_type_id,
    n.subject_code,
    n.note_text_code,
    ts.text AS subject,
    tt.text AS note_text,
    n.is_pinned,
    n.is_active,
    n.created_at,
    n.updated_at,
    n.created_by
FROM object_notes n
LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $headers['x-language-id'] }}
LEFT JOIN translations tt ON tt.code = n.note_text_code AND tt.language_id = {{ $headers['x-language-id'] }}
WHERE n.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR n.is_active = {{ $json.query.is_active }})
    AND ({{ $json.query.is_pinned }} IS NULL OR n.is_pinned = {{ $json.query.is_pinned }})
ORDER BY n.is_pinned DESC, n.created_at DESC;
```

---

### 43. Add Note to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/notes`

**Description**: Create a new note for an object. The API should generate unique translation codes and insert translations for each provided language.

**Request Body**:
```json
{
  "note_type_id": 1,
  "subject": "First meeting",
  "note_text": "Discussed project requirements and timeline.",
  "is_pinned": false,
  "created_by": 1,
  "language_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "object_id": 100,
    "note_type_id": 1,
    "subject_code": "note_subject_1",
    "note_text_code": "note_text_1",
    "subject": "First meeting",
    "note_text": "Discussed project requirements and timeline.",
    "is_pinned": false,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "created_by": 1
  }
}
```

**MySQL Query** (Multi-step process):
```sql
-- Step 1: Insert the note first to get the auto-generated ID
INSERT INTO object_notes (
    object_id,
    note_type_id,
    subject_code,
    note_text_code,
    is_pinned,
    is_active,
    created_by
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.note_type_id }},
    NULL,  -- Will be updated after getting the ID
    NULL,  -- Will be updated after getting the ID
    COALESCE({{ $json.body.is_pinned }}, 0),
    1,
    {{ $json.body.created_by }}
);

SET @note_id = LAST_INSERT_ID();
SET @subject_code = CONCAT('note_subject_', @note_id);
SET @note_text_code = CONCAT('note_text_', @note_id);

-- Step 2: Insert translations for subject (if provided)
INSERT INTO translations (code, language_id, text) VALUES
(@subject_code, {{ $json.body.language_id }}, {{ $json.body.subject }});

-- Step 3: Insert translations for note_text
INSERT INTO translations (code, language_id, text) VALUES
(@note_text_code, {{ $json.body.language_id }}, {{ $json.body.note_text }});

-- Step 4: Update the note with translation codes
UPDATE object_notes
SET subject_code = @subject_code, note_text_code = @note_text_code
WHERE id = @note_id;

-- Step 5: Return the created note with translations
SELECT
    n.id,
    n.object_id,
    n.note_type_id,
    n.subject_code,
    n.note_text_code,
    ts.text AS subject,
    tt.text AS note_text,
    n.is_pinned,
    n.is_active,
    n.created_at,
    n.updated_at,
    n.created_by
FROM object_notes n
LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $json.body.language_id }}
LEFT JOIN translations tt ON tt.code = n.note_text_code AND tt.language_id = {{ $json.body.language_id }}
WHERE n.id = @note_id;
```

---

### 44. Update Note

**Endpoint**: `PUT /api/v1/notes/{note_id}`

**Description**: Update an existing note. Updates the translation for the specified language.

**Request Body**:
```json
{
  "note_type_id": 2,
  "subject": "Updated meeting notes",
  "note_text": "Revised discussion points and action items.",
  "is_pinned": true,
  "language_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "object_id": 100,
    "note_type_id": 2,
    "subject_code": "note_subject_1",
    "note_text_code": "note_text_1",
    "subject": "Updated meeting notes",
    "note_text": "Revised discussion points and action items.",
    "is_pinned": true,
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T11:30:00Z",
    "created_by": 1
  }
}
```

**MySQL Query**:
```sql
-- Get the existing translation codes
SELECT subject_code, note_text_code INTO @subject_code, @note_text_code
FROM object_notes WHERE id = {{ $json.params.note_id }};

-- Update or insert subject translation
INSERT INTO translations (code, language_id, text)
VALUES (@subject_code, {{ $json.body.language_id }}, {{ $json.body.subject }})
ON DUPLICATE KEY UPDATE text = {{ $json.body.subject }};

-- Update or insert note_text translation
INSERT INTO translations (code, language_id, text)
VALUES (@note_text_code, {{ $json.body.language_id }}, {{ $json.body.note_text }})
ON DUPLICATE KEY UPDATE text = {{ $json.body.note_text }};

-- Update the note metadata
UPDATE object_notes
SET
    note_type_id = COALESCE({{ $json.body.note_type_id }}, note_type_id),
    is_pinned = COALESCE({{ $json.body.is_pinned }}, is_pinned),
    updated_at = NOW()
WHERE id = {{ $json.params.note_id }};

-- Return the updated note with translations
SELECT
    n.id,
    n.object_id,
    n.note_type_id,
    n.subject_code,
    n.note_text_code,
    ts.text AS subject,
    tt.text AS note_text,
    n.is_pinned,
    n.is_active,
    n.created_at,
    n.updated_at,
    n.created_by
FROM object_notes n
LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $json.body.language_id }}
LEFT JOIN translations tt ON tt.code = n.note_text_code AND tt.language_id = {{ $json.body.language_id }}
WHERE n.id = {{ $json.params.note_id }};
```

---

### 45. Delete Note

**Endpoint**: `DELETE /api/v1/notes/{note_id}`

**Description**: Soft delete a note by setting is_active to false. Translations are preserved.

**Response**:
```json
{
  "success": true
}
```

**MySQL Query**:
```sql
UPDATE object_notes
SET is_active = 0
WHERE id = {{ $json.params.note_id }};

SELECT 1 as success;
```

---

### 46. Toggle Note Pin Status

**Endpoint**: `PATCH /api/v1/notes/{note_id}/pin`

**Description**: Toggle the pinned status of a note.

**Request Body**:
```json
{
  "is_pinned": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_pinned": true
  }
}
```

**MySQL Query**:
```sql
UPDATE object_notes
SET
    is_pinned = {{ $json.body.is_pinned }},
    updated_at = NOW()
WHERE id = {{ $json.params.note_id }};

SELECT id, is_pinned FROM object_notes WHERE id = {{ $json.params.note_id }};
```

---

## Invoice Endpoints

### Database Schema Reference

The `invoices` table uses a shared primary key pattern with the `objects` table:

```sql
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    transaction_id BIGINT COMMENT 'Associated transaction (if any)',
    invoice_number VARCHAR(50) NOT NULL COMMENT 'Unique invoice number',
    issue_date DATE NOT NULL COMMENT 'Invoice issue date',
    due_date DATE COMMENT 'Payment due date',
    payment_date DATE COMMENT 'Actual payment date',
    partner_id_from BIGINT COMMENT 'Partner/object issuing invoice',
    partner_id_to BIGINT COMMENT 'Partner/object receiving invoice',
    note VARCHAR(255) COMMENT 'Invoice notes',
    reference_number VARCHAR(100) COMMENT 'Reference number (PO, etc.)',
    is_mirror BOOLEAN COMMENT 'Whether this is a mirror/credit note',
    currency_id INT NOT NULL COMMENT 'Currency from currencies table',
    netto_amount DECIMAL(10,2) COMMENT 'Net amount (before tax)',
    tax DECIMAL(10,2) COMMENT 'Tax amount',
    final_amount DECIMAL(10,2) COMMENT 'Final amount (netto + tax)',
    is_paid BOOLEAN DEFAULT FALSE COMMENT 'Whether invoice has been paid',
    is_void BOOLEAN DEFAULT FALSE COMMENT 'Whether invoice is void',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id_from) REFERENCES objects(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id_to) REFERENCES objects(id) ON DELETE SET NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT
);
```

**Note**: The `invoices.id` column IS the `objects.id` (shared primary key pattern).

---

### 42. List Invoices

**Endpoint**: `GET /api/v1/invoices?page=1&per_page=20&partner_id={id}&is_paid={true|false}&is_void={true|false}&date_from={date}&date_to={date}`

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE ({{ $json.query.partner_id }} IS NULL OR i.partner_id_from = {{ $json.query.partner_id }} OR i.partner_id_to = {{ $json.query.partner_id }})
    AND ({{ $json.query.is_paid }} IS NULL OR i.is_paid = {{ $json.query.is_paid }})
    AND ({{ $json.query.is_void }} IS NULL OR i.is_void = {{ $json.query.is_void }})
    AND ({{ $json.query.date_from }} IS NULL OR i.issue_date >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR i.issue_date <= {{ $json.query.date_to }});

-- Get paginated results
SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.payment_date,
    i.partner_id_from,
    i.partner_id_to,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    i.note,
    i.reference_number,
    i.is_mirror,
    i.created_at,
    i.updated_at,
    o.object_status_id,
    o.object_type_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE ({{ $json.query.partner_id }} IS NULL OR i.partner_id_from = {{ $json.query.partner_id }} OR i.partner_id_to = {{ $json.query.partner_id }})
    AND ({{ $json.query.is_paid }} IS NULL OR i.is_paid = {{ $json.query.is_paid }})
    AND ({{ $json.query.is_void }} IS NULL OR i.is_void = {{ $json.query.is_void }})
    AND ({{ $json.query.date_from }} IS NULL OR i.issue_date >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR i.issue_date <= {{ $json.query.date_to }})
ORDER BY i.issue_date DESC, i.invoice_number DESC
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 43. Get Invoice by ID

**Endpoint**: `GET /api/v1/invoices/{id}`

**MySQL Query**:
```sql
SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.payment_date,
    i.partner_id_from,
    i.partner_id_to,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    i.note,
    i.reference_number,
    i.is_mirror,
    i.created_at,
    i.updated_at,
    o.object_status_id,
    o.object_type_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }};
```

---

### 44. Create Invoice

**Endpoint**: `POST /api/v1/invoices`

**Request Body**:
```json
{
  "object_status_id": 1,
  "transaction_id": 123,
  "invoice_number": "INV-2024-001",
  "issue_date": "2024-01-15",
  "due_date": "2024-02-15",
  "partner_id_from": 10,
  "partner_id_to": 20,
  "currency_id": 1,
  "netto_amount": 1000.00,
  "tax": 270.00,
  "final_amount": 1270.00,
  "note": "Payment terms: Net 30",
  "reference_number": "PO-12345"
}
```

**MySQL Query**:
```sql
START TRANSACTION;

-- Insert into objects table first (generates the shared ID)
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'invoice'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

-- Insert into invoices table using the same ID
INSERT INTO invoices (
    id,
    transaction_id,
    invoice_number,
    issue_date,
    due_date,
    partner_id_from,
    partner_id_to,
    currency_id,
    netto_amount,
    tax,
    final_amount,
    is_paid,
    is_void,
    note,
    reference_number
) VALUES (
    @object_id,
    {{ $json.body.transaction_id }},
    {{ $json.body.invoice_number }},
    {{ $json.body.issue_date }},
    {{ $json.body.due_date }},
    {{ $json.body.partner_id_from }},
    {{ $json.body.partner_id_to }},
    {{ $json.body.currency_id }},
    {{ $json.body.netto_amount }},
    {{ $json.body.tax }},
    {{ $json.body.final_amount }},
    0,
    0,
    {{ $json.body.note }},
    {{ $json.body.reference_number }}
);

COMMIT;

-- Return created invoice
SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.partner_id_from,
    i.partner_id_to,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    i.note,
    i.reference_number,
    i.created_at,
    i.updated_at,
    o.object_status_id,
    o.object_type_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE i.id = @object_id;
```

---

### 45. Update Invoice

**Endpoint**: `PUT /api/v1/invoices/{id}`

**MySQL Query**:
```sql
UPDATE invoices i
JOIN objects o ON o.id = i.id
SET
    i.transaction_id = COALESCE({{ $json.body.transaction_id }}, i.transaction_id),
    i.invoice_number = COALESCE({{ $json.body.invoice_number }}, i.invoice_number),
    i.issue_date = COALESCE({{ $json.body.issue_date }}, i.issue_date),
    i.due_date = COALESCE({{ $json.body.due_date }}, i.due_date),
    i.partner_id_from = COALESCE({{ $json.body.partner_id_from }}, i.partner_id_from),
    i.partner_id_to = COALESCE({{ $json.body.partner_id_to }}, i.partner_id_to),
    i.currency_id = COALESCE({{ $json.body.currency_id }}, i.currency_id),
    i.netto_amount = COALESCE({{ $json.body.netto_amount }}, i.netto_amount),
    i.tax = COALESCE({{ $json.body.tax }}, i.tax),
    i.final_amount = COALESCE({{ $json.body.final_amount }}, i.final_amount),
    i.note = COALESCE({{ $json.body.note }}, i.note),
    i.reference_number = COALESCE({{ $json.body.reference_number }}, i.reference_number),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE i.id = {{ $json.params.id }};

-- Return updated invoice
SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.partner_id_from,
    i.partner_id_to,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    i.note,
    i.reference_number,
    i.created_at,
    i.updated_at,
    o.object_status_id,
    o.object_type_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }};
```

---

### 46. Mark Invoice as Paid

**Endpoint**: `POST /api/v1/invoices/{id}/pay`

**Request Body**:
```json
{
  "payment_date": "2024-01-20"
}
```

**MySQL Query**:
```sql
UPDATE invoices
SET
    is_paid = 1,
    payment_date = COALESCE({{ $json.body.payment_date }}, CURDATE())
WHERE id = {{ $json.params.id }};

SELECT
    i.id,
    i.invoice_number,
    i.is_paid,
    i.payment_date,
    o.object_status_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }};
```

---

### 47. Void Invoice

**Endpoint**: `POST /api/v1/invoices/{id}/void`

**MySQL Query**:
```sql
UPDATE invoices
SET is_void = 1
WHERE id = {{ $json.params.id }};

SELECT
    i.id,
    i.invoice_number,
    i.is_void,
    o.object_status_id
FROM invoices i
JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }};
```

---

### 48. Delete Invoice

**Endpoint**: `DELETE /api/v1/invoices/{id}`

**Description**: Delete an invoice. This will cascade delete the invoice record.

**MySQL Query**:
```sql
-- Delete object (cascades to invoices table)
DELETE FROM objects
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Transaction Endpoints

### Database Schema Reference

The `transactions` table uses a shared primary key pattern with the `objects` table:

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    transaction_type_id INT NOT NULL COMMENT 'Type of transaction (SALE, PURCHASE, etc.)',
    transaction_date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction start date/time',
    transaction_date_end TIMESTAMP COMMENT 'Transaction end date/time (if applicable)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this transaction is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note VARCHAR(255) COMMENT 'Transaction note (references translations)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (note) REFERENCES translations(code) ON DELETE SET NULL
);
```

**Note**: The `transactions.id` column IS the `objects.id` (shared primary key pattern).

---

### 49. List Transactions

**Endpoint**: `GET /api/v1/transactions?page=1&per_page=20&transaction_type_id={type_id}&date_from={date}&date_to={date}`

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM transactions t
JOIN objects o ON o.id = t.id
WHERE t.is_active = 1
    AND ({{ $json.query.transaction_type_id }} IS NULL OR t.transaction_type_id = {{ $json.query.transaction_type_id }})
    AND ({{ $json.query.date_from }} IS NULL OR t.transaction_date_start >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR t.transaction_date_start <= {{ $json.query.date_to }});

-- Get paginated results
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    t.created_at,
    t.updated_at,
    o.object_status_id,
    o.object_type_id
FROM transactions t
JOIN objects o ON o.id = t.id
WHERE t.is_active = 1
    AND ({{ $json.query.transaction_type_id }} IS NULL OR t.transaction_type_id = {{ $json.query.transaction_type_id }})
    AND ({{ $json.query.date_from }} IS NULL OR t.transaction_date_start >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR t.transaction_date_start <= {{ $json.query.date_to }})
ORDER BY t.transaction_date_start DESC
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 50. Get Transaction by ID

**Endpoint**: `GET /api/v1/transactions/{id}`

**MySQL Query**:
```sql
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    t.created_at,
    t.updated_at,
    o.object_status_id,
    o.object_type_id
FROM transactions t
JOIN objects o ON o.id = t.id
WHERE t.id = {{ $json.params.id }};
```

---

### 51. Create Transaction

**Endpoint**: `POST /api/v1/transactions`

**Request Body**:
```json
{
  "object_status_id": 1,
  "transaction_type_id": 1,
  "transaction_date_start": "2024-01-15T10:00:00Z",
  "transaction_date_end": "2024-01-15T11:00:00Z",
  "note": "Transaction note"
}
```

**MySQL Query**:
```sql
START TRANSACTION;

-- Insert into objects table first (generates the shared ID)
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'transaction'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

-- Insert into transactions table using the same ID
INSERT INTO transactions (
    id,
    transaction_type_id,
    transaction_date_start,
    transaction_date_end,
    is_active,
    note
) VALUES (
    @object_id,
    {{ $json.body.transaction_type_id }},
    {{ $json.body.transaction_date_start }},
    {{ $json.body.transaction_date_end }},
    1,
    {{ $json.body.note }}
);

COMMIT;

-- Return created transaction
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    t.created_at,
    t.updated_at,
    o.object_status_id,
    o.object_type_id
FROM transactions t
JOIN objects o ON o.id = t.id
WHERE t.id = @object_id;
```

---

### 52. Update Transaction

**Endpoint**: `PUT /api/v1/transactions/{id}`

**MySQL Query**:
```sql
UPDATE transactions t
JOIN objects o ON o.id = t.id
SET
    t.transaction_type_id = COALESCE({{ $json.body.transaction_type_id }}, t.transaction_type_id),
    t.transaction_date_start = COALESCE({{ $json.body.transaction_date_start }}, t.transaction_date_start),
    t.transaction_date_end = COALESCE({{ $json.body.transaction_date_end }}, t.transaction_date_end),
    t.note = COALESCE({{ $json.body.note }}, t.note),
    t.is_active = COALESCE({{ $json.body.is_active }}, t.is_active),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE t.id = {{ $json.params.id }};

-- Return updated transaction
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    t.created_at,
    t.updated_at,
    o.object_status_id,
    o.object_type_id
FROM transactions t
JOIN objects o ON o.id = t.id
WHERE t.id = {{ $json.params.id }};
```

---

### 53. Delete Transaction

**Endpoint**: `DELETE /api/v1/transactions/{id}`

**Description**: Soft delete a transaction by setting is_active to false.

**MySQL Query**:
```sql
UPDATE transactions
SET is_active = 0
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

**Note**: For hard delete, use: `DELETE FROM objects WHERE id = {{ $json.params.id }};` (cascades to transactions table)

---

## Object Relation Endpoints

### 54. List Object Relations

**Endpoint**: `GET /api/v1/object-relations?page=1&per_page=20&object_from_id={id}&object_to_id={id}&object_relation_type_id={id}`

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM object_relations or_rel
WHERE or_rel.is_active = 1
    AND ({{ $json.query.object_from_id }} IS NULL OR or_rel.object_from_id = {{ $json.query.object_from_id }})
    AND ({{ $json.query.object_to_id }} IS NULL OR or_rel.object_to_id = {{ $json.query.object_to_id }})
    AND ({{ $json.query.object_relation_type_id }} IS NULL OR or_rel.object_relation_type_id = {{ $json.query.object_relation_type_id }});

-- Get paginated results
SELECT 
    or_rel.id,
    or_rel.object_from_id,
    or_rel.object_to_id,
    or_rel.object_relation_type_id,
    or_rel.note,
    or_rel.is_active,
    or_rel.created_at,
    or_rel.updated_at
FROM object_relations or_rel
WHERE or_rel.is_active = 1
    AND ({{ $json.query.object_from_id }} IS NULL OR or_rel.object_from_id = {{ $json.query.object_from_id }})
    AND ({{ $json.query.object_to_id }} IS NULL OR or_rel.object_to_id = {{ $json.query.object_to_id }})
    AND ({{ $json.query.object_relation_type_id }} IS NULL OR or_rel.object_relation_type_id = {{ $json.query.object_relation_type_id }})
ORDER BY or_rel.created_at DESC
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 55. Get Object Relations by Object ID

**Endpoint**: `GET /api/v1/objects/{object_id}/relations`

**MySQL Query**:
```sql
SELECT 
    or_rel.id,
    or_rel.object_from_id,
    or_rel.object_to_id,
    or_rel.object_relation_type_id,
    or_rel.note,
    or_rel.is_active,
    or_rel.created_at,
    or_rel.updated_at
FROM object_relations or_rel
WHERE or_rel.is_active = 1
    AND (or_rel.object_from_id = {{ $json.params.object_id }} OR or_rel.object_to_id = {{ $json.params.object_id }})
ORDER BY or_rel.created_at DESC;
```

---

### 56. Get Object Relation by ID

**Endpoint**: `GET /api/v1/object-relations/{id}`

**MySQL Query**:
```sql
SELECT 
    or_rel.*
FROM object_relations or_rel
WHERE or_rel.id = {{ $json.params.id }}
    AND or_rel.is_active = 1;
```

---

### 57. Create Object Relation

**Endpoint**: `POST /api/v1/object-relations`

**Request Body**:
```json
{
  "object_from_id": 10,
  "object_to_id": 20,
  "object_relation_type_id": 1,
  "note": "Employee relationship"
}
```

**MySQL Query**:
```sql
INSERT INTO object_relations (
    object_from_id,
    object_to_id,
    object_relation_type_id,
    note,
    is_active,
    created_at,
    updated_at
) VALUES (
    {{ $json.body.object_from_id }},
    {{ $json.body.object_to_id }},
    {{ $json.body.object_relation_type_id }},
    {{ $json.body.note }},
    1,
    NOW(),
    NOW()
);

SELECT * FROM object_relations WHERE id = LAST_INSERT_ID();
```

---

### 58. Update Object Relation

**Endpoint**: `PUT /api/v1/object-relations/{id}`

**MySQL Query**:
```sql
UPDATE object_relations
SET 
    object_from_id = COALESCE({{ $json.body.object_from_id }}, object_from_id),
    object_to_id = COALESCE({{ $json.body.object_to_id }}, object_to_id),
    object_relation_type_id = COALESCE({{ $json.body.object_relation_type_id }}, object_relation_type_id),
    note = COALESCE({{ $json.body.note }}, note),
    is_active = COALESCE({{ $json.body.is_active }}, is_active),
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_relations WHERE id = {{ $json.params.id }};
```

---

### 59. Delete Object Relation

**Endpoint**: `DELETE /api/v1/object-relations/{id}`

**MySQL Query**:
```sql
UPDATE object_relations
SET 
    is_active = 0,
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Object Audit Endpoints

### 60. List Object Audits

**Endpoint**: `GET /api/v1/object-audits?page=1&per_page=20&object_id={id}&audit_action_id={id}&created_by={id}&date_from={date}&date_to={date}`

**Description**: Retrieve all audit records with pagination and filtering options.

**Request Parameters**:
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `object_id` (optional): Filter by object ID
- `audit_action_id` (optional): Filter by audit action ID
- `created_by` (optional): Filter by user/object who created the audit
- `date_from` (optional): Filter audits from this date (ISO format)
- `date_to` (optional): Filter audits until this date (ISO format)
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): Sort order - 'asc' or 'desc' (default: desc)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 10,
      "audit_action_id": 5,
      "created_by": 2,
      "created_at": "2024-01-15T10:30:00Z",
      "old_values": {
        "first_name": "John",
        "last_name": "Doe"
      },
      "new_values": {
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "notes": "user_name_update"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM object_audits oa
WHERE 1=1
    AND ({{ $json.query.object_id }} IS NULL OR oa.object_id = {{ $json.query.object_id }})
    AND ({{ $json.query.audit_action_id }} IS NULL OR oa.audit_action_id = {{ $json.query.audit_action_id }})
    AND ({{ $json.query.created_by }} IS NULL OR oa.created_by = {{ $json.query.created_by }})
    AND ({{ $json.query.date_from }} IS NULL OR oa.created_at >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR oa.created_at <= {{ $json.query.date_to }});

-- Get paginated results
SELECT 
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
WHERE 1=1
    AND ({{ $json.query.object_id }} IS NULL OR oa.object_id = {{ $json.query.object_id }})
    AND ({{ $json.query.audit_action_id }} IS NULL OR oa.audit_action_id = {{ $json.query.audit_action_id }})
    AND ({{ $json.query.created_by }} IS NULL OR oa.created_by = {{ $json.query.created_by }})
    AND ({{ $json.query.date_from }} IS NULL OR oa.created_at >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR oa.created_at <= {{ $json.query.date_to }})
ORDER BY oa.created_at DESC
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 61. Get Object Audit by ID

**Endpoint**: `GET /api/v1/object-audits/{id}`

**Description**: Retrieve a single audit record by ID.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "object_id": 10,
    "audit_action_id": 5,
    "created_by": 2,
    "created_at": "2024-01-15T10:30:00Z",
    "old_values": {
      "first_name": "John",
      "last_name": "Doe"
    },
    "new_values": {
      "first_name": "Jane",
      "last_name": "Doe"
    },
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "notes": "user_name_update"
  }
}
```

**MySQL Query**:
```sql
SELECT 
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
WHERE oa.id = {{ $json.params.id }};
```

---

### 62. Get Object Audits by Object ID

**Endpoint**: `GET /api/v1/object-audits/object/{object_id}?page=1&per_page=20`

**Description**: Retrieve all audit records for a specific object.

**Request Parameters**:
- `object_id` (path): The object ID to get audits for
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `audit_action_id` (optional): Filter by audit action ID
- `date_from` (optional): Filter audits from this date (ISO format)
- `date_to` (optional): Filter audits until this date (ISO format)
- `sort` (optional): Sort field (default: created_at)
- `order` (optional): Sort order - 'asc' or 'desc' (default: desc)

**Response**: Same format as List Object Audits

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM object_audits oa
WHERE oa.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.audit_action_id }} IS NULL OR oa.audit_action_id = {{ $json.query.audit_action_id }})
    AND ({{ $json.query.date_from }} IS NULL OR oa.created_at >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR oa.created_at <= {{ $json.query.date_to }});

-- Get paginated results
SELECT 
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
WHERE oa.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.audit_action_id }} IS NULL OR oa.audit_action_id = {{ $json.query.audit_action_id }})
    AND ({{ $json.query.date_from }} IS NULL OR oa.created_at >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR oa.created_at <= {{ $json.query.date_to }})
ORDER BY oa.created_at DESC
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 63. Create Object Audit

**Endpoint**: `POST /api/v1/object-audits`

**Description**: Create a new audit record. Typically called automatically by the system when actions are performed, but can be created manually if needed.

**Request Body**:
```json
{
  "object_id": 10,
  "audit_action_id": 5,
  "created_by": 2,
  "old_values": {
    "first_name": "John",
    "last_name": "Doe"
  },
  "new_values": {
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "notes": "user_name_update"
}
```

**MySQL Query**:
```sql
INSERT INTO object_audits (
    object_id,
    audit_action_id,
    created_by,
    old_values,
    new_values,
    ip_address,
    user_agent,
    notes,
    created_at
) VALUES (
    {{ $json.body.object_id }},
    {{ $json.body.audit_action_id }},
    {{ $json.body.created_by }},
    {{ $json.body.old_values }},
    {{ $json.body.new_values }},
    {{ $json.body.ip_address }},
    {{ $json.body.user_agent }},
    {{ $json.body.notes }},
    NOW()
);

SET @audit_id = LAST_INSERT_ID();

SELECT 
    oa.id,
    oa.object_id,
    oa.audit_action_id,
    oa.created_by,
    oa.created_at,
    oa.old_values,
    oa.new_values,
    oa.ip_address,
    oa.user_agent,
    oa.notes
FROM object_audits oa
WHERE oa.id = @audit_id;
```

---

## Authentication Endpoints

### 64. Signup / Register

**Endpoint**: `POST /api/v1/auth/signup`

**Description**: Register a new user account. Creates a new user with active status and password.

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**MySQL Query**:
```sql
-- Start transaction
START TRANSACTION;

-- Check if username already exists
SELECT COUNT(*) as user_count
FROM users
WHERE username = {{ $json.body.username }};

-- If user_count > 0, return error and rollback
-- Otherwise, proceed with user creation

-- Insert into objects table first
INSERT INTO objects (
    object_type_id,
    object_status_id
) VALUES (
    (SELECT id FROM object_types WHERE code = 'user'),
    (SELECT id FROM object_statuses WHERE code = 'user_active')
);

SET @object_id = LAST_INSERT_ID();

-- Insert into users table
INSERT INTO users (
    id,
    username
) VALUES (
    @object_id,
    {{ $json.body.username }}
);

-- Insert into user_passwords table (password should be hashed before insertion)
INSERT INTO user_passwords (
    user_id,
    password_hash,
    is_active
) VALUES (
    @object_id,
    {{ $json.body.password }},  -- Should be hashed (bcrypt, argon2, etc.) before insertion
    TRUE
);

-- Commit transaction
COMMIT;

-- Return created user (without password)
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    o.created_at,
    o.updated_at
FROM users u
INNER JOIN objects o ON u.id = o.id
INNER JOIN object_statuses os ON o.object_status_id = os.id
WHERE u.id = @object_id;

-- Response should be:
-- {
--   "success": true,
--   "data": {
--     "id": 123,
--     "username": "johndoe",
--     "status_code": "user_active",
--     "created_at": "2024-01-15T10:00:00Z"
--   }
-- }
```

---

### 65. Login

**Endpoint**: `POST /api/v1/auth/login`

**Description**: Authenticate user and receive access token.

**Request Body**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**MySQL Query**:
```sql
-- Fetch user with active password
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    up.password_hash,
    up.is_active AS password_active
FROM users u
INNER JOIN objects o ON u.id = o.id
INNER JOIN object_statuses os ON o.object_status_id = os.id
INNER JOIN user_passwords up ON u.id = up.user_id
WHERE u.username = {{ $json.body.username }}
    AND os.code = 'user_active'
    AND up.is_active = TRUE;

-- Verify password (should be done in application code, not SQL)
-- Compare {{ $json.body.password }} with password_hash using bcrypt/argon2
-- If password matches, generate token and return:
-- {
--   "success": true,
--   "data": {
--     "token": "generated_jwt_token",
--     "user": {
--       "id": 123,
--       "username": "johndoe",
--       "status_code": "user_active"
--     }
--   }
-- }
```

---

### 66. Get Current User

**Endpoint**: `GET /api/v1/auth/me`

**Description**: Get the currently authenticated user's information using the token from the Authorization header. Validates the token and returns user data.

**Request Headers**:
```
Authorization: Bearer {token}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "username": "johndoe",
    "object_type_id": 3,
    "object_status_id": 1,
    "status_code": "user_active",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

**Response (Error - No Token)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authorization token provided"
  }
}
```

**Response (Error - Invalid Token)**:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**n8n Workflow Implementation**:

**Step 1: Webhook Node**
- **Method**: GET
- **Path**: `/api/v1/auth/me`
- **Response Mode**: Respond to Webhook (at the end)

**Step 2: Code Node - Extract and Validate Token**

Use code from `n8n_auth_me_code.js` or this simplified version:

```javascript
// Get input from webhook
const inputData = $input.all()[0].json;

// Extract Authorization header
const authHeader = inputData.headers?.authorization || 
                   inputData.headers?.Authorization || '';

// Extract token from "Bearer {token}" format
let token = '';
if (authHeader.startsWith('Bearer ')) {
  token = authHeader.substring(7);
} else if (authHeader) {
  token = authHeader;
}

if (!token) {
  return {
    json: {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'No authorization token provided'
      }
    }
  };
}

// Decode JWT token payload
try {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  // Decode payload (second part)
  const payload = parts[1];
  const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
  const decodedPayload = JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf-8'));
  
  // Extract user_id from token payload
  const userId = decodedPayload.user_id || 
                 decodedPayload.userId || 
                 decodedPayload.id || 
                 decodedPayload.sub;
  
  if (!userId) {
    return {
      json: {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token does not contain user_id'
        }
      }
    };
  }
  
  // Return user_id and token hash for validation
  const crypto = require('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  return {
    json: {
      user_id: userId,
      token_hash: tokenHash,
      token: token
    }
  };
  
} catch (error) {
  return {
    json: {
      success: false,
      error: {
        code: 'TOKEN_DECODE_ERROR',
        message: 'Failed to decode token: ' + error.message
      }
    }
  };
}
```

**Step 3: IF Node - Check for Errors**

- **Condition**: Check if `{{ $json.success }}` is `false`
- **If true**: Go to Error Response
- **If false**: Continue to Token Validation

**Step 4: MySQL Node - Validate Token (Optional - if using user_tokens table)**

```sql
-- Validate token is active and not expired
SELECT 
    ut.user_id,
    ut.is_active,
    ut.expires_at
FROM user_tokens ut
WHERE ut.token_hash = '{{ $json.token_hash }}'
    AND ut.is_active = TRUE
    AND ut.expires_at > NOW();
```

**Step 5: IF Node - Check Token Validation**

- **Condition**: Check if MySQL returned a row
- **If false**: Return error "Invalid or expired token"
- **If true**: Continue to Fetch User Data

**Step 6: MySQL Node - Fetch User Data**

```sql
-- Fetch current user with active status
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    o.created_at,
    o.updated_at
FROM users u
INNER JOIN objects o ON u.id = o.id
INNER JOIN object_statuses os ON o.object_status_id = os.id
WHERE u.id = {{ $json.user_id }}
    AND os.code = 'user_active';
```

**Step 7: IF Node - Check if User Found**

- **Condition**: Check if MySQL returned a row
- **If false**: Return error "User not found"
- **If true**: Continue to Format Response

**Step 8: MySQL Node - Update Last Used (Optional)**

```sql
-- Update last_used_at timestamp
UPDATE user_tokens
SET last_used_at = NOW()
WHERE token_hash = '{{ $('Code Node').item.json.token_hash }}'
    AND is_active = TRUE;
```

**Step 9: Code Node - Format Success Response**

```javascript
const userData = $input.all()[0].json;

return {
  json: {
    success: true,
    data: {
      id: userData.id,
      username: userData.username,
      object_type_id: userData.object_type_id,
      object_status_id: userData.object_status_id,
      status_code: userData.status_code,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    }
  }
};
```

**Step 10: Code Node - Format Error Response** (from error branches)

```javascript
const errorData = $input.all()[0].json;

return {
  json: {
    success: false,
    error: {
      code: errorData.error?.code || 'UNAUTHORIZED',
      message: errorData.error?.message || 'Authentication failed'
    }
  }
};
```

**Step 11: Respond to Webhook Node**

- **Response Code**: `{{ $json.success ? 200 : 401 }}`
- **Response Body**: `{{ $json }}`

**Complete Workflow Structure**:
```
Webhook (GET /auth/me)
  → Code Node (Extract user_id from token)
  → IF Node (Check for errors)
    ├─ [Error] → Format Error Response → Respond to Webhook
    └─ [Success] → MySQL Node (Validate token - optional)
      → IF Node (Token valid?)
        ├─ [Invalid] → Format Error Response → Respond to Webhook
        └─ [Valid] → MySQL Node (Fetch user data)
          → IF Node (User found?)
            ├─ [Not Found] → Format Error Response → Respond to Webhook
            └─ [Found] → MySQL Node (Update last_used_at - optional)
              → Format Success Response → Respond to Webhook
```

**Simplified Workflow** (without token validation table):
```
Webhook (GET /auth/me)
  → Code Node (Extract user_id from token)
  → IF Node (Check for errors)
    ├─ [Error] → Format Error Response → Respond to Webhook
    └─ [Success] → MySQL Node (Fetch user data)
      → IF Node (User found?)
        ├─ [Not Found] → Format Error Response → Respond to Webhook
        └─ [Found] → Format Success Response → Respond to Webhook
```

**Notes**:
- Token validation against `user_tokens` table is optional but recommended for security
- If you don't use `user_tokens` table, rely on JWT expiration only
- Always validate token format and extract user_id correctly
- Return appropriate HTTP status codes (200 for success, 401 for unauthorized)

---

### 67. Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Invalidate user session/token.

**MySQL Query**:
```sql
-- Typically handled by token invalidation (blacklist) in application
-- No database query needed, just return success
SELECT 1 as success;
```

---

### 68. Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

**Description**: Refresh access token using refresh token.

**Request Body**:
```json
{
  "refresh_token": "refresh_token_here"
}
```

**MySQL Query**:
```sql
-- Validate refresh token and generate new access token
-- Implementation depends on token storage strategy
SELECT 1 as success;
```

---

## Notes for n8n Implementation

1. **Variable Syntax**: Replace `{{ $json.query.param }}` with actual n8n expression syntax
2. **SQL Injection**: Always use parameterized queries or n8n's expression syntax
3. **Transactions**: Use transactions for operations that modify multiple tables
4. **Error Handling**: Return proper error responses on failures
5. **Pagination**: Always implement pagination for list endpoints
6. **Soft Deletes**: Use `is_active = 0` instead of hard deletes
7. **Timestamps**: Use `NOW()` for created_at and updated_at
8. **Validation**: Validate input data before executing queries

## Response Format

All endpoints should return responses in this format:

**Success (Single Item)**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Success (List)**:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

