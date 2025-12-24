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
11. [Authentication Endpoints](#authentication-endpoints)

---

## Lookup/Reference Data Endpoints

### 1. Get Languages

**Endpoint**: `GET /api/v1/languages`

**Description**: Retrieve all available languages in the system.

**Request**: No parameters

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "en",
      "is_active": true
    }
  ]
}
```

**MySQL Query**:
```sql
SELECT 
    id,
    code,
    is_active
FROM languages
WHERE is_active = 1
ORDER BY code;
```

---

### 2. Get Object Types

**Endpoint**: `GET /api/v1/object-types`

**Description**: Retrieve all object types (person, company, user, etc.).

**Request**: No parameters

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "person",
      "is_active": true
    }
  ]
}
```

**MySQL Query**:
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

---

### 3. Get Object Statuses

**Endpoint**: `GET /api/v1/object-statuses?object_type_id={id}`

**Description**: Retrieve statuses for objects, optionally filtered by object type.

**Request Parameters**:
- `object_type_id` (optional): Filter by object type

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "person_active",
      "is_active": true,
      "object_type_id": 1
    }
  ]
}
```

**MySQL Query**:
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

---

### 4. Get Sexes

**Endpoint**: `GET /api/v1/sexes`

**Description**: Retrieve all gender/sex options.

**Request**: No parameters

**MySQL Query**:
```sql
SELECT 
    s.id,
    s.code,
    s.is_active,
    t.text as name
FROM sexes s
LEFT JOIN translations t ON t.code = s.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE s.is_active = 1
ORDER BY s.code;
```

---

### 5. Get Salutations

**Endpoint**: `GET /api/v1/salutations`

**Description**: Retrieve all salutation options (Mr., Mrs., Dr., etc.).

**MySQL Query**:
```sql
SELECT 
    sal.id,
    sal.code,
    sal.is_active,
    t.text as name
FROM salutations sal
LEFT JOIN translations t ON t.code = sal.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE sal.is_active = 1
ORDER BY sal.code;
```

---

### 6. Get Product Categories

**Endpoint**: `GET /api/v1/product-categories`

**Description**: Retrieve all product categories.

**MySQL Query**:
```sql
SELECT 
    pc.id,
    pc.code,
    pc.is_active,
    t.text as name
FROM product_categories pc
LEFT JOIN translations t ON t.code = pc.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE pc.is_active = 1
ORDER BY pc.code;
```

---

### 7. Get Countries

**Endpoint**: `GET /api/v1/countries`

**Description**: Retrieve all countries.

**MySQL Query**:
```sql
SELECT 
    c.id,
    c.code,
    c.name,
    c.is_active
FROM countries c
WHERE c.is_active = 1
ORDER BY c.name;
```

---

### 8. Get Address Types

**Endpoint**: `GET /api/v1/address-types`

**Description**: Retrieve all address types (home, work, temporary, etc.).

**MySQL Query**:
```sql
SELECT 
    at.id,
    at.code,
    at.is_active,
    t.text as name
FROM address_types at
LEFT JOIN translations t ON t.code = at.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE at.is_active = 1
ORDER BY at.code;
```

---

### 9. Get Address Area Types

**Endpoint**: `GET /api/v1/address-area-types`

**Description**: Retrieve address area types (street, avenue, district, etc.).

**MySQL Query**:
```sql
SELECT 
    aat.id,
    aat.code,
    aat.is_active,
    t.text as name
FROM address_area_types aat
LEFT JOIN translations t ON t.code = aat.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE aat.is_active = 1
ORDER BY aat.code;
```

---

### 10. Get Contact Types

**Endpoint**: `GET /api/v1/contact-types`

**Description**: Retrieve all contact types (phone, email, mobile, etc.).

**MySQL Query**:
```sql
SELECT 
    ct.id,
    ct.code,
    ct.is_active,
    t.text as name
FROM contact_types ct
LEFT JOIN translations t ON t.code = ct.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE ct.is_active = 1
ORDER BY ct.code;
```

---

### 11. Get Transaction Types

**Endpoint**: `GET /api/v1/transaction-types`

**Description**: Retrieve all transaction types (SALE, PURCHASE, etc.).

**MySQL Query**:
```sql
SELECT 
    tt.id,
    tt.code,
    tt.is_active,
    t.text as name
FROM transaction_types tt
LEFT JOIN translations t ON t.code = tt.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE tt.is_active = 1
ORDER BY tt.code;
```

---

### 12. Get Currencies

**Endpoint**: `GET /api/v1/currencies`

**Description**: Retrieve all currencies.

**MySQL Query**:
```sql
SELECT 
    c.id,
    c.code,
    c.is_active,
    t.text as name
FROM currencies c
LEFT JOIN translations t ON t.code = c.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE c.is_active = 1
ORDER BY c.code;
```

---

### 13. Get Object Relation Types

**Endpoint**: `GET /api/v1/object-relation-types`

**Description**: Retrieve all object relation types (employee, spouse, business_partner, etc.).

**MySQL Query**:
```sql
SELECT 
    ort.id,
    ort.code,
    ort.is_active,
    t.text as name
FROM object_relation_types ort
LEFT JOIN translations t ON t.code = ort.code 
    AND t.language_id = (SELECT id FROM languages WHERE code = 'en')
WHERE ort.is_active = 1
ORDER BY ort.code;
```

---

### 14. Get Translations

**Endpoint**: `GET /api/v1/translations?code={code}&language_id={id}`

**Description**: Retrieve translations, optionally filtered by code or language.

**Request Parameters**:
- `code` (optional): Filter by translation code
- `language_id` (optional): Filter by language ID

**MySQL Query**:
```sql
SELECT 
    t.code,
    t.language_id,
    l.code as language_code,
    t.text
FROM translations t
JOIN languages l ON l.id = t.language_id
WHERE 1=1
    AND ({{ $json.query.code }} IS NULL OR t.code = {{ $json.query.code }})
    AND ({{ $json.query.language_id }} IS NULL OR t.language_id = {{ $json.query.language_id }})
ORDER BY t.code, t.language_id;
```

---

## Person Endpoints

### 15. List Persons

**Endpoint**: `GET /api/v1/persons?page=1&per_page=20&object_status_id={id}&search={term}`

**Description**: Retrieve a paginated list of persons with optional filtering and search.

**Request Parameters**:
- `page` (default: 1): Page number
- `per_page` (default: 20): Items per page
- `object_status_id` (optional): Filter by status
- `search` (optional): Search term (searches first_name, last_name, email)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "object_id": 100,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
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
JOIN objects o ON o.id = p.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.email LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

-- Get paginated results
SELECT 
    p.id,
    p.object_id,
    p.first_name,
    p.last_name,
    p.middle_name,
    p.email,
    p.phone,
    p.birth_date,
    p.sex_id,
    p.salutation_id,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM persons p
JOIN objects o ON o.id = p.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        p.email LIKE CONCAT('%', {{ $json.query.search }}, '%')
    )
ORDER BY p.last_name, p.first_name
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 16. Get Person by ID

**Endpoint**: `GET /api/v1/persons/{id}`

**Description**: Retrieve a single person by ID.

**MySQL Query**:
```sql
SELECT 
    p.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM persons p
JOIN objects o ON o.id = p.object_id
WHERE p.id = {{ $json.params.id }}
    AND o.is_active = 1;
```

---

### 17. Create Person

**Endpoint**: `POST /api/v1/persons`

**Description**: Create a new person.

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "object_status_id": 1,
  "sex_id": 1,
  "salutation_id": 1
}
```

**MySQL Query**:
```sql
-- Start transaction
START TRANSACTION;

-- Insert into objects table
INSERT INTO objects (
    object_type_id,
    object_status_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM object_types WHERE code = 'person'),
    {{ $json.body.object_status_id }},
    1,
    NOW(),
    NOW()
);

SET @object_id = LAST_INSERT_ID();

-- Insert into persons table
INSERT INTO persons (
    object_id,
    first_name,
    last_name,
    middle_name,
    email,
    phone,
    birth_date,
    sex_id,
    salutation_id,
    created_at,
    updated_at
) VALUES (
    @object_id,
    {{ $json.body.first_name }},
    {{ $json.body.last_name }},
    {{ $json.body.middle_name }},
    {{ $json.body.email }},
    {{ $json.body.phone }},
    {{ $json.body.birth_date }},
    {{ $json.body.sex_id }},
    {{ $json.body.salutation_id }},
    NOW(),
    NOW()
);

SET @person_id = LAST_INSERT_ID();

-- Commit transaction
COMMIT;

-- Return created person
SELECT 
    p.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM persons p
JOIN objects o ON o.id = p.object_id
WHERE p.id = @person_id;
```

---

### 18. Update Person

**Endpoint**: `PUT /api/v1/persons/{id}`

**Description**: Update an existing person.

**Request Body**: Partial update (only include fields to update)

**MySQL Query**:
```sql
-- Update persons table
UPDATE persons p
JOIN objects o ON o.id = p.object_id
SET 
    p.first_name = COALESCE({{ $json.body.first_name }}, p.first_name),
    p.last_name = COALESCE({{ $json.body.last_name }}, p.last_name),
    p.middle_name = COALESCE({{ $json.body.middle_name }}, p.middle_name),
    p.email = COALESCE({{ $json.body.email }}, p.email),
    p.phone = COALESCE({{ $json.body.phone }}, p.phone),
    p.birth_date = COALESCE({{ $json.body.birth_date }}, p.birth_date),
    p.sex_id = COALESCE({{ $json.body.sex_id }}, p.sex_id),
    p.salutation_id = COALESCE({{ $json.body.salutation_id }}, p.salutation_id),
    p.updated_at = NOW(),
    o.updated_at = NOW(),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE p.id = {{ $json.params.id }}
    AND o.is_active = 1;

-- Return updated person
SELECT 
    p.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM persons p
JOIN objects o ON o.id = p.object_id
WHERE p.id = {{ $json.params.id }};
```

---

### 19. Delete Person

**Endpoint**: `DELETE /api/v1/persons/{id}`

**Description**: Soft delete a person (sets is_active = 0).

**MySQL Query**:
```sql
-- Soft delete (set is_active = 0)
UPDATE objects o
JOIN persons p ON p.object_id = o.id
SET 
    o.is_active = 0,
    o.updated_at = NOW()
WHERE p.id = {{ $json.params.id }};

-- Return success
SELECT 1 as success;
```

---

## Company Endpoints

### 20. List Companies

**Endpoint**: `GET /api/v1/companies?page=1&per_page=20&object_status_id={id}&search={term}`

**Description**: Retrieve a paginated list of companies.

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM companies c
JOIN objects o ON o.id = c.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        c.company_name LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        c.company_id LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

-- Get paginated results
SELECT 
    c.id,
    c.object_id,
    c.company_name,
    c.company_id,
    c.tax_id,
    c.vat_number,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM companies c
JOIN objects o ON o.id = c.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
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

**MySQL Query**:
```sql
SELECT 
    c.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM companies c
JOIN objects o ON o.id = c.object_id
WHERE c.id = {{ $json.params.id }}
    AND o.is_active = 1;
```

---

### 22. Create Company

**Endpoint**: `POST /api/v1/companies`

**Request Body**:
```json
{
  "company_name": "Acme Corp",
  "company_id": "REG-12345",
  "tax_id": "TAX-123",
  "vat_number": "VAT-456",
  "object_status_id": 1
}
```

**MySQL Query**:
```sql
START TRANSACTION;

INSERT INTO objects (
    object_type_id,
    object_status_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM object_types WHERE code = 'company'),
    {{ $json.body.object_status_id }},
    1,
    NOW(),
    NOW()
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO companies (
    object_id,
    company_name,
    company_id,
    tax_id,
    vat_number,
    created_at,
    updated_at
) VALUES (
    @object_id,
    {{ $json.body.company_name }},
    {{ $json.body.company_id }},
    {{ $json.body.tax_id }},
    {{ $json.body.vat_number }},
    NOW(),
    NOW()
);

SET @company_id = LAST_INSERT_ID();

COMMIT;

SELECT 
    c.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM companies c
JOIN objects o ON o.id = c.object_id
WHERE c.id = @company_id;
```

---

### 23. Update Company

**Endpoint**: `PUT /api/v1/companies/{id}`

**MySQL Query**:
```sql
UPDATE companies c
JOIN objects o ON o.id = c.object_id
SET 
    c.company_name = COALESCE({{ $json.body.company_name }}, c.company_name),
    c.company_id = COALESCE({{ $json.body.company_id }}, c.company_id),
    c.tax_id = COALESCE({{ $json.body.tax_id }}, c.tax_id),
    c.vat_number = COALESCE({{ $json.body.vat_number }}, c.vat_number),
    c.updated_at = NOW(),
    o.updated_at = NOW(),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE c.id = {{ $json.params.id }}
    AND o.is_active = 1;

SELECT 
    c.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM companies c
JOIN objects o ON o.id = c.object_id
WHERE c.id = {{ $json.params.id }};
```

---

### 24. Delete Company

**Endpoint**: `DELETE /api/v1/companies/{id}`

**MySQL Query**:
```sql
UPDATE objects o
JOIN companies c ON c.object_id = o.id
SET 
    o.is_active = 0,
    o.updated_at = NOW()
WHERE c.id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## User Endpoints

### 25. List Users

**Endpoint**: `GET /api/v1/users?page=1&per_page=20&object_status_id={id}&search={term}`

**MySQL Query**:
```sql
SELECT COUNT(*) as total
FROM users u
JOIN objects o ON o.id = u.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        u.username LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        u.email LIKE CONCAT('%', {{ $json.query.search }}, '%')
    );

SELECT 
    u.id,
    u.object_id,
    u.username,
    u.email,
    u.is_active as user_active,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM users u
JOIN objects o ON o.id = u.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
    AND (
        {{ $json.query.search }} IS NULL OR
        u.username LIKE CONCAT('%', {{ $json.query.search }}, '%') OR
        u.email LIKE CONCAT('%', {{ $json.query.search }}, '%')
    )
ORDER BY u.username
LIMIT {{ $json.query.per_page }}
OFFSET {{ ($json.query.page - 1) * $json.query.per_page }};
```

---

### 26. Get User by ID

**Endpoint**: `GET /api/v1/users/{id}`

**MySQL Query**:
```sql
SELECT 
    u.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM users u
JOIN objects o ON o.id = u.object_id
WHERE u.id = {{ $json.params.id }}
    AND o.is_active = 1;
```

---

### 27. Create User

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "hashed_password",
  "object_status_id": 1
}
```

**MySQL Query**:
```sql
START TRANSACTION;

INSERT INTO objects (
    object_type_id,
    object_status_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM object_types WHERE code = 'user'),
    {{ $json.body.object_status_id }},
    1,
    NOW(),
    NOW()
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO users (
    object_id,
    username,
    email,
    password_hash,
    is_active,
    created_at,
    updated_at
) VALUES (
    @object_id,
    {{ $json.body.username }},
    {{ $json.body.email }},
    {{ $json.body.password }}, -- Should be hashed before insertion
    1,
    NOW(),
    NOW()
);

SET @user_id = LAST_INSERT_ID();

COMMIT;

SELECT 
    u.id,
    u.object_id,
    u.username,
    u.email,
    u.is_active as user_active,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM users u
JOIN objects o ON o.id = u.object_id
WHERE u.id = @user_id;
```

---

### 28. Update User

**Endpoint**: `PUT /api/v1/users/{id}`

**MySQL Query**:
```sql
UPDATE users u
JOIN objects o ON o.id = u.object_id
SET 
    u.username = COALESCE({{ $json.body.username }}, u.username),
    u.email = COALESCE({{ $json.body.email }}, u.email),
    u.password_hash = COALESCE({{ $json.body.password }}, u.password_hash),
    u.is_active = COALESCE({{ $json.body.is_active }}, u.is_active),
    u.updated_at = NOW(),
    o.updated_at = NOW(),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE u.id = {{ $json.params.id }}
    AND o.is_active = 1;

SELECT 
    u.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM users u
JOIN objects o ON o.id = u.object_id
WHERE u.id = {{ $json.params.id }};
```

---

### 29. Delete User

**Endpoint**: `DELETE /api/v1/users/{id}`

**MySQL Query**:
```sql
UPDATE objects o
JOIN users u ON u.object_id = o.id
SET 
    o.is_active = 0,
    o.updated_at = NOW()
WHERE u.id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Address Endpoints

### 30. Get Object Addresses

**Endpoint**: `GET /api/v1/objects/{object_id}/addresses?is_active={true|false}`

**Description**: Retrieve all addresses for a specific object.

**MySQL Query**:
```sql
SELECT 
    a.id,
    a.object_id,
    a.address_type_id,
    a.country_id,
    a.address_area_type_id,
    a.postal_code,
    a.city,
    a.street,
    a.house_number,
    a.is_active,
    a.created_at,
    a.updated_at
FROM addresses a
WHERE a.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR a.is_active = {{ $json.query.is_active }})
ORDER BY a.created_at DESC;
```

---

### 31. Add Address to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/addresses`

**Request Body**:
```json
{
  "address_type_id": 1,
  "country_id": 1,
  "address_area_type_id": 1,
  "postal_code": "12345",
  "city": "New York",
  "street": "Main Street",
  "house_number": "123"
}
```

**MySQL Query**:
```sql
INSERT INTO addresses (
    object_id,
    address_type_id,
    country_id,
    address_area_type_id,
    postal_code,
    city,
    street,
    house_number,
    is_active,
    created_at,
    updated_at
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.address_type_id }},
    {{ $json.body.country_id }},
    {{ $json.body.address_area_type_id }},
    {{ $json.body.postal_code }},
    {{ $json.body.city }},
    {{ $json.body.street }},
    {{ $json.body.house_number }},
    1,
    NOW(),
    NOW()
);

SELECT * FROM addresses WHERE id = LAST_INSERT_ID();
```

---

### 32. Update Address

**Endpoint**: `PUT /api/v1/addresses/{address_id}`

**MySQL Query**:
```sql
UPDATE addresses
SET 
    address_type_id = COALESCE({{ $json.body.address_type_id }}, address_type_id),
    country_id = COALESCE({{ $json.body.country_id }}, country_id),
    address_area_type_id = COALESCE({{ $json.body.address_area_type_id }}, address_area_type_id),
    postal_code = COALESCE({{ $json.body.postal_code }}, postal_code),
    city = COALESCE({{ $json.body.city }}, city),
    street = COALESCE({{ $json.body.street }}, street),
    house_number = COALESCE({{ $json.body.house_number }}, house_number),
    is_active = COALESCE({{ $json.body.is_active }}, is_active),
    updated_at = NOW()
WHERE id = {{ $json.params.address_id }};

SELECT * FROM addresses WHERE id = {{ $json.params.address_id }};
```

---

### 33. Delete Address

**Endpoint**: `DELETE /api/v1/addresses/{address_id}`

**MySQL Query**:
```sql
UPDATE addresses
SET 
    is_active = 0,
    updated_at = NOW()
WHERE id = {{ $json.params.address_id }};

SELECT 1 as success;
```

---

## Contact Endpoints

### 34. Get Object Contacts

**Endpoint**: `GET /api/v1/objects/{object_id}/contacts?is_active={true|false}&contact_type_id={type_id}`

**MySQL Query**:
```sql
SELECT 
    c.id,
    c.object_id,
    c.contact_type_id,
    c.contact_value,
    c.is_active,
    c.created_at,
    c.updated_at
FROM contacts c
WHERE c.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR c.is_active = {{ $json.query.is_active }})
    AND ({{ $json.query.contact_type_id }} IS NULL OR c.contact_type_id = {{ $json.query.contact_type_id }})
ORDER BY c.created_at DESC;
```

---

### 35. Add Contact to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/contacts`

**Request Body**:
```json
{
  "contact_type_id": 1,
  "contact_value": "john@example.com"
}
```

**MySQL Query**:
```sql
INSERT INTO contacts (
    object_id,
    contact_type_id,
    contact_value,
    is_active,
    created_at,
    updated_at
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.contact_type_id }},
    {{ $json.body.contact_value }},
    1,
    NOW(),
    NOW()
);

SELECT * FROM contacts WHERE id = LAST_INSERT_ID();
```

---

### 36. Update Contact

**Endpoint**: `PUT /api/v1/contacts/{contact_id}`

**MySQL Query**:
```sql
UPDATE contacts
SET 
    contact_type_id = COALESCE({{ $json.body.contact_type_id }}, contact_type_id),
    contact_value = COALESCE({{ $json.body.contact_value }}, contact_value),
    is_active = COALESCE({{ $json.body.is_active }}, is_active),
    updated_at = NOW()
WHERE id = {{ $json.params.contact_id }};

SELECT * FROM contacts WHERE id = {{ $json.params.contact_id }};
```

---

### 37. Delete Contact

**Endpoint**: `DELETE /api/v1/contacts/{contact_id}`

**MySQL Query**:
```sql
UPDATE contacts
SET 
    is_active = 0,
    updated_at = NOW()
WHERE id = {{ $json.params.contact_id }};

SELECT 1 as success;
```

---

## Identification Endpoints

### 38. Get Object Identifications

**Endpoint**: `GET /api/v1/objects/{object_id}/identifications?is_active={true|false}`

**MySQL Query**:
```sql
SELECT 
    i.id,
    i.object_id,
    i.identification_type_id,
    i.identification_value,
    i.is_active,
    i.created_at,
    i.updated_at
FROM identifications i
WHERE i.object_id = {{ $json.params.object_id }}
    AND ({{ $json.query.is_active }} IS NULL OR i.is_active = {{ $json.query.is_active }})
ORDER BY i.created_at DESC;
```

---

### 39. Add Identification to Object

**Endpoint**: `POST /api/v1/objects/{object_id}/identifications`

**Request Body**:
```json
{
  "identification_type_id": 1,
  "identification_value": "P123456789"
}
```

**MySQL Query**:
```sql
INSERT INTO identifications (
    object_id,
    identification_type_id,
    identification_value,
    is_active,
    created_at,
    updated_at
) VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.identification_type_id }},
    {{ $json.body.identification_value }},
    1,
    NOW(),
    NOW()
);

SELECT * FROM identifications WHERE id = LAST_INSERT_ID();
```

---

### 40. Update Identification

**Endpoint**: `PUT /api/v1/identifications/{identification_id}`

**MySQL Query**:
```sql
UPDATE identifications
SET 
    identification_type_id = COALESCE({{ $json.body.identification_type_id }}, identification_type_id),
    identification_value = COALESCE({{ $json.body.identification_value }}, identification_value),
    is_active = COALESCE({{ $json.body.is_active }}, is_active),
    updated_at = NOW()
WHERE id = {{ $json.params.identification_id }};

SELECT * FROM identifications WHERE id = {{ $json.params.identification_id }};
```

---

### 41. Delete Identification

**Endpoint**: `DELETE /api/v1/identifications/{identification_id}`

**MySQL Query**:
```sql
UPDATE identifications
SET 
    is_active = 0,
    updated_at = NOW()
WHERE id = {{ $json.params.identification_id }};

SELECT 1 as success;
```

---

## Invoice Endpoints

### 42. List Invoices

**Endpoint**: `GET /api/v1/invoices?page=1&per_page=20&partner_id={id}&is_paid={true|false}&is_void={true|false}&date_from={date}&date_to={date}`

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.partner_id }} IS NULL OR i.partner_id_from = {{ $json.query.partner_id }} OR i.partner_id_to = {{ $json.query.partner_id }})
    AND ({{ $json.query.is_paid }} IS NULL OR i.is_paid = {{ $json.query.is_paid }})
    AND ({{ $json.query.is_void }} IS NULL OR i.is_void = {{ $json.query.is_void }})
    AND ({{ $json.query.date_from }} IS NULL OR i.issue_date >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR i.issue_date <= {{ $json.query.date_to }});

-- Get paginated results
SELECT 
    i.id,
    i.object_id,
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
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.partner_id }} IS NULL OR i.partner_id_from = {{ $json.query.partner_id }} OR i.partner_id_to = {{ $json.query.partner_id }})
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
    i.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE i.id = {{ $json.params.id }}
    AND o.is_active = 1;
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

INSERT INTO objects (
    object_type_id,
    object_status_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM object_types WHERE code = 'document'),
    {{ $json.body.object_status_id }},
    1,
    NOW(),
    NOW()
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO invoices (
    object_id,
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
    reference_number,
    created_at,
    updated_at
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
    {{ $json.body.reference_number }},
    NOW(),
    NOW()
);

SET @invoice_id = LAST_INSERT_ID();

COMMIT;

SELECT 
    i.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE i.id = @invoice_id;
```

---

### 45. Update Invoice

**Endpoint**: `PUT /api/v1/invoices/{id}`

**MySQL Query**:
```sql
UPDATE invoices i
JOIN objects o ON o.id = i.object_id
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
    i.updated_at = NOW(),
    o.updated_at = NOW(),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE i.id = {{ $json.params.id }}
    AND o.is_active = 1;

SELECT 
    i.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
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
    payment_date = COALESCE({{ $json.body.payment_date }}, NOW()),
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 
    i.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE i.id = {{ $json.params.id }};
```

---

### 47. Void Invoice

**Endpoint**: `POST /api/v1/invoices/{id}/void`

**MySQL Query**:
```sql
UPDATE invoices
SET 
    is_void = 1,
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 
    i.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM invoices i
JOIN objects o ON o.id = i.object_id
WHERE i.id = {{ $json.params.id }};
```

---

### 48. Delete Invoice

**Endpoint**: `DELETE /api/v1/invoices/{id}`

**MySQL Query**:
```sql
UPDATE objects o
JOIN invoices i ON i.object_id = o.id
SET 
    o.is_active = 0,
    o.updated_at = NOW()
WHERE i.id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Transaction Endpoints

### 49. List Transactions

**Endpoint**: `GET /api/v1/transactions?page=1&per_page=20&transaction_type_id={type_id}&date_from={date}&date_to={date}`

**MySQL Query**:
```sql
-- Count total
SELECT COUNT(*) as total
FROM transactions t
JOIN objects o ON o.id = t.object_id
WHERE o.is_active = 1
    AND ({{ $json.query.transaction_type_id }} IS NULL OR t.transaction_type_id = {{ $json.query.transaction_type_id }})
    AND ({{ $json.query.date_from }} IS NULL OR t.transaction_date_start >= {{ $json.query.date_from }})
    AND ({{ $json.query.date_to }} IS NULL OR t.transaction_date_start <= {{ $json.query.date_to }});

-- Get paginated results
SELECT 
    t.id,
    t.object_id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.note,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM transactions t
JOIN objects o ON o.id = t.object_id
WHERE o.is_active = 1
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
    t.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM transactions t
JOIN objects o ON o.id = t.object_id
WHERE t.id = {{ $json.params.id }}
    AND o.is_active = 1;
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

INSERT INTO objects (
    object_type_id,
    object_status_id,
    is_active,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM object_types WHERE code = 'transaction'),
    {{ $json.body.object_status_id }},
    1,
    NOW(),
    NOW()
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO transactions (
    object_id,
    transaction_type_id,
    transaction_date_start,
    transaction_date_end,
    note,
    created_at,
    updated_at
) VALUES (
    @object_id,
    {{ $json.body.transaction_type_id }},
    {{ $json.body.transaction_date_start }},
    {{ $json.body.transaction_date_end }},
    {{ $json.body.note }},
    NOW(),
    NOW()
);

SET @transaction_id = LAST_INSERT_ID();

COMMIT;

SELECT 
    t.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM transactions t
JOIN objects o ON o.id = t.object_id
WHERE t.id = @transaction_id;
```

---

### 52. Update Transaction

**Endpoint**: `PUT /api/v1/transactions/{id}`

**MySQL Query**:
```sql
UPDATE transactions t
JOIN objects o ON o.id = t.object_id
SET 
    t.transaction_type_id = COALESCE({{ $json.body.transaction_type_id }}, t.transaction_type_id),
    t.transaction_date_start = COALESCE({{ $json.body.transaction_date_start }}, t.transaction_date_start),
    t.transaction_date_end = COALESCE({{ $json.body.transaction_date_end }}, t.transaction_date_end),
    t.note = COALESCE({{ $json.body.note }}, t.note),
    t.updated_at = NOW(),
    o.updated_at = NOW(),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE t.id = {{ $json.params.id }}
    AND o.is_active = 1;

SELECT 
    t.*,
    o.object_status_id,
    o.created_at,
    o.updated_at
FROM transactions t
JOIN objects o ON o.id = t.object_id
WHERE t.id = {{ $json.params.id }};
```

---

### 53. Delete Transaction

**Endpoint**: `DELETE /api/v1/transactions/{id}`

**MySQL Query**:
```sql
UPDATE objects o
JOIN transactions t ON t.object_id = o.id
SET 
    o.is_active = 0,
    o.updated_at = NOW()
WHERE t.id = {{ $json.params.id }};

SELECT 1 as success;
```

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

## Authentication Endpoints

### 60. Signup / Register

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

### 61. Login

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

### 62. Get Current User

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

### 63. Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Invalidate user session/token.

**MySQL Query**:
```sql
-- Typically handled by token invalidation (blacklist) in application
-- No database query needed, just return success
SELECT 1 as success;
```

---

### 64. Refresh Token

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

