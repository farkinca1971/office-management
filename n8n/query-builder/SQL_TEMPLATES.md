# SQL Query Templates for n8n Workflows

Ready-to-use SQL templates for n8n MySQL nodes. Copy and paste directly into your workflows.

> **Note**: Replace `{{ $json.xxx }}` placeholders with your actual n8n expressions based on your workflow structure.

---

## Table of Contents

1. [Persons](#persons)
2. [Companies](#companies)
3. [Users](#users)
4. [Invoices](#invoices)
5. [Transactions](#transactions)
6. [Addresses](#addresses)
7. [Contacts](#contacts)
8. [Identifications](#identifications)
9. [Notes](#notes)
10. [Object Relations](#object-relations)
11. [Audits](#audits)
12. [Lookup Tables](#lookup-tables)
13. [Translations](#translations)

---

## Persons

### List Persons (Paginated)

**Count Query:**
```sql
SELECT COUNT(*) as total
FROM persons p
INNER JOIN objects o ON o.id = p.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
```

**Data Query:**
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
INNER JOIN objects o ON o.id = p.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR p.first_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR p.last_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
ORDER BY p.last_name ASC, p.first_name ASC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Get Person by ID

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
INNER JOIN objects o ON o.id = p.id
WHERE p.id = {{ $json.params.id }}
```

### Create Person

```sql
START TRANSACTION;

INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'person'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO persons (id, first_name, middle_name, last_name, mother_name, sex_id, salutation_id, birth_date)
VALUES (
    @object_id,
    {{ $json.body.first_name }},
    {{ $json.body.middle_name }},
    {{ $json.body.last_name }},
    {{ $json.body.mother_name }},
    {{ $json.body.sex_id }},
    {{ $json.body.salutation_id }},
    {{ $json.body.birth_date }}
);

COMMIT;

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
INNER JOIN objects o ON o.id = p.id
WHERE p.id = @object_id;
```

### Update Person

```sql
UPDATE persons p
INNER JOIN objects o ON o.id = p.id
SET
    p.first_name = COALESCE({{ $json.body.first_name }}, p.first_name),
    p.middle_name = COALESCE({{ $json.body.middle_name }}, p.middle_name),
    p.last_name = COALESCE({{ $json.body.last_name }}, p.last_name),
    p.mother_name = COALESCE({{ $json.body.mother_name }}, p.mother_name),
    p.sex_id = COALESCE({{ $json.body.sex_id }}, p.sex_id),
    p.salutation_id = COALESCE({{ $json.body.salutation_id }}, p.salutation_id),
    p.birth_date = COALESCE({{ $json.body.birth_date }}, p.birth_date),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE p.id = {{ $json.params.id }};

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
INNER JOIN objects o ON o.id = p.id
WHERE p.id = {{ $json.params.id }};
```

### Delete Person

```sql
DELETE FROM objects WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Companies

### List Companies (Paginated)

**Count Query:**
```sql
SELECT COUNT(*) as total
FROM companies c
INNER JOIN objects o ON o.id = c.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR c.company_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR c.company_id LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
```

**Data Query:**
```sql
SELECT
    c.id,
    c.company_id,
    c.company_name,
    o.object_status_id,
    o.object_type_id
FROM companies c
INNER JOIN objects o ON o.id = c.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR c.company_name LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR c.company_id LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
ORDER BY c.company_name ASC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Get Company by ID

```sql
SELECT
    c.id,
    c.company_id,
    c.company_name,
    o.object_status_id,
    o.object_type_id
FROM companies c
INNER JOIN objects o ON o.id = c.id
WHERE c.id = {{ $json.params.id }}
```

### Create Company

```sql
START TRANSACTION;

INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'company'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO companies (id, company_id, company_name)
VALUES (
    @object_id,
    {{ $json.body.company_id }},
    {{ $json.body.company_name }}
);

COMMIT;

SELECT
    c.id,
    c.company_id,
    c.company_name,
    o.object_status_id,
    o.object_type_id
FROM companies c
INNER JOIN objects o ON o.id = c.id
WHERE c.id = @object_id;
```

### Update Company

```sql
UPDATE companies c
INNER JOIN objects o ON o.id = c.id
SET
    c.company_id = COALESCE({{ $json.body.company_id }}, c.company_id),
    c.company_name = COALESCE({{ $json.body.company_name }}, c.company_name),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE c.id = {{ $json.params.id }};

SELECT
    c.id,
    c.company_id,
    c.company_name,
    o.object_status_id,
    o.object_type_id
FROM companies c
INNER JOIN objects o ON o.id = c.id
WHERE c.id = {{ $json.params.id }};
```

### Delete Company

```sql
DELETE FROM objects WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Users

### List Users (Paginated)

**Count Query:**
```sql
SELECT COUNT(*) as total
FROM users u
INNER JOIN objects o ON o.id = u.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR u.username LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
```

**Data Query:**
```sql
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
INNER JOIN objects o ON o.id = u.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR u.username LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
ORDER BY u.username ASC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Get User by ID

```sql
SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
INNER JOIN objects o ON o.id = u.id
WHERE u.id = {{ $json.params.id }}
```

### Create User

```sql
START TRANSACTION;

INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'user'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO users (id, username)
VALUES (@object_id, {{ $json.body.username }});

-- Password should be hashed before insertion!
INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (@object_id, {{ $json.body.password_hash }}, TRUE);

COMMIT;

SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
INNER JOIN objects o ON o.id = u.id
WHERE u.id = @object_id;
```

### Update User

```sql
UPDATE users u
INNER JOIN objects o ON o.id = u.id
SET
    u.username = COALESCE({{ $json.body.username }}, u.username),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE u.id = {{ $json.params.id }};

SELECT
    u.id,
    u.username,
    o.object_status_id,
    o.object_type_id
FROM users u
INNER JOIN objects o ON o.id = u.id
WHERE u.id = {{ $json.params.id }};
```

### Delete User

```sql
DELETE FROM objects WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Invoices

### List Invoices (Paginated)

**Count Query:**
```sql
SELECT COUNT(*) as total
FROM invoices i
INNER JOIN objects o ON o.id = i.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR i.invoice_number LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR i.reference_number LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
```

**Data Query:**
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
    i.note,
    i.reference_number,
    i.is_mirror,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    o.object_status_id,
    o.object_type_id
FROM invoices i
INNER JOIN objects o ON o.id = i.id
WHERE ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND (
    {{ $json.query.search }} IS NULL
    OR i.invoice_number LIKE CONCAT('%', {{ $json.query.search }}, '%')
    OR i.reference_number LIKE CONCAT('%', {{ $json.query.search }}, '%')
  )
ORDER BY i.issue_date DESC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Get Invoice by ID

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
    i.note,
    i.reference_number,
    i.is_mirror,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    o.object_status_id,
    o.object_type_id
FROM invoices i
INNER JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }}
```

### Create Invoice

```sql
START TRANSACTION;

INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'invoice'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO invoices (
    id, transaction_id, invoice_number, issue_date, due_date,
    partner_id_from, partner_id_to, currency_id, netto_amount,
    tax, final_amount, note, reference_number, is_mirror
)
VALUES (
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
    {{ $json.body.note }},
    {{ $json.body.reference_number }},
    {{ $json.body.is_mirror || false }}
);

COMMIT;

SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.payment_date,
    i.partner_id_from,
    i.partner_id_to,
    i.note,
    i.reference_number,
    i.is_mirror,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    o.object_status_id,
    o.object_type_id
FROM invoices i
INNER JOIN objects o ON o.id = i.id
WHERE i.id = @object_id;
```

### Update Invoice

```sql
UPDATE invoices i
INNER JOIN objects o ON o.id = i.id
SET
    i.invoice_number = COALESCE({{ $json.body.invoice_number }}, i.invoice_number),
    i.issue_date = COALESCE({{ $json.body.issue_date }}, i.issue_date),
    i.due_date = COALESCE({{ $json.body.due_date }}, i.due_date),
    i.payment_date = COALESCE({{ $json.body.payment_date }}, i.payment_date),
    i.partner_id_from = COALESCE({{ $json.body.partner_id_from }}, i.partner_id_from),
    i.partner_id_to = COALESCE({{ $json.body.partner_id_to }}, i.partner_id_to),
    i.currency_id = COALESCE({{ $json.body.currency_id }}, i.currency_id),
    i.netto_amount = COALESCE({{ $json.body.netto_amount }}, i.netto_amount),
    i.tax = COALESCE({{ $json.body.tax }}, i.tax),
    i.final_amount = COALESCE({{ $json.body.final_amount }}, i.final_amount),
    i.note = COALESCE({{ $json.body.note }}, i.note),
    i.reference_number = COALESCE({{ $json.body.reference_number }}, i.reference_number),
    i.is_paid = COALESCE({{ $json.body.is_paid }}, i.is_paid),
    i.is_void = COALESCE({{ $json.body.is_void }}, i.is_void),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE i.id = {{ $json.params.id }};

SELECT
    i.id,
    i.transaction_id,
    i.invoice_number,
    i.issue_date,
    i.due_date,
    i.payment_date,
    i.partner_id_from,
    i.partner_id_to,
    i.note,
    i.reference_number,
    i.is_mirror,
    i.currency_id,
    i.netto_amount,
    i.tax,
    i.final_amount,
    i.is_paid,
    i.is_void,
    o.object_status_id,
    o.object_type_id
FROM invoices i
INNER JOIN objects o ON o.id = i.id
WHERE i.id = {{ $json.params.id }};
```

### Delete Invoice

```sql
DELETE FROM objects WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Transactions

### List Transactions (Paginated)

**Count Query:**
```sql
SELECT COUNT(*) as total
FROM transactions t
INNER JOIN objects o ON o.id = t.id
WHERE t.is_active = 1
  AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND ({{ $json.query.transaction_type_id }} IS NULL OR t.transaction_type_id = {{ $json.query.transaction_type_id }})
```

**Data Query:**
```sql
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    o.object_status_id,
    o.object_type_id
FROM transactions t
INNER JOIN objects o ON o.id = t.id
WHERE t.is_active = 1
  AND ({{ $json.query.object_status_id }} IS NULL OR o.object_status_id = {{ $json.query.object_status_id }})
  AND ({{ $json.query.transaction_type_id }} IS NULL OR t.transaction_type_id = {{ $json.query.transaction_type_id }})
ORDER BY t.transaction_date_start DESC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Get Transaction by ID

```sql
SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    o.object_status_id,
    o.object_type_id
FROM transactions t
INNER JOIN objects o ON o.id = t.id
WHERE t.id = {{ $json.params.id }}
```

### Create Transaction

```sql
START TRANSACTION;

INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'transaction'),
    {{ $json.body.object_status_id }}
);

SET @object_id = LAST_INSERT_ID();

INSERT INTO transactions (id, transaction_type_id, transaction_date_start, transaction_date_end, note, is_active)
VALUES (
    @object_id,
    {{ $json.body.transaction_type_id }},
    COALESCE({{ $json.body.transaction_date_start }}, NOW()),
    {{ $json.body.transaction_date_end }},
    {{ $json.body.note }},
    TRUE
);

COMMIT;

SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    o.object_status_id,
    o.object_type_id
FROM transactions t
INNER JOIN objects o ON o.id = t.id
WHERE t.id = @object_id;
```

### Update Transaction

```sql
UPDATE transactions t
INNER JOIN objects o ON o.id = t.id
SET
    t.transaction_type_id = COALESCE({{ $json.body.transaction_type_id }}, t.transaction_type_id),
    t.transaction_date_start = COALESCE({{ $json.body.transaction_date_start }}, t.transaction_date_start),
    t.transaction_date_end = COALESCE({{ $json.body.transaction_date_end }}, t.transaction_date_end),
    t.note = COALESCE({{ $json.body.note }}, t.note),
    o.object_status_id = COALESCE({{ $json.body.object_status_id }}, o.object_status_id)
WHERE t.id = {{ $json.params.id }};

SELECT
    t.id,
    t.transaction_type_id,
    t.transaction_date_start,
    t.transaction_date_end,
    t.is_active,
    t.note,
    o.object_status_id,
    o.object_type_id
FROM transactions t
INNER JOIN objects o ON o.id = t.id
WHERE t.id = {{ $json.params.id }};
```

### Delete Transaction (Soft Delete)

```sql
UPDATE transactions
SET is_active = 0
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Addresses

### List Addresses for Object

```sql
SELECT
    a.id,
    a.object_id,
    a.address_type_id,
    a.street_address_1,
    a.street_address_2,
    a.address_area_type_id,
    a.city,
    a.state_province,
    a.postal_code,
    a.country_id,
    a.latitude,
    a.longitude,
    a.is_active,
    a.created_by,
    a.created_at,
    a.updated_at
FROM object_addresses a
WHERE a.object_id = {{ $json.params.object_id }}
  AND a.is_active = 1
ORDER BY a.created_at DESC
```

### Get Address by ID

```sql
SELECT
    a.id,
    a.object_id,
    a.address_type_id,
    a.street_address_1,
    a.street_address_2,
    a.address_area_type_id,
    a.city,
    a.state_province,
    a.postal_code,
    a.country_id,
    a.latitude,
    a.longitude,
    a.is_active,
    a.created_by,
    a.created_at,
    a.updated_at
FROM object_addresses a
WHERE a.id = {{ $json.params.id }}
```

### Create Address

```sql
INSERT INTO object_addresses (
    object_id, address_type_id, street_address_1, street_address_2,
    address_area_type_id, city, state_province, postal_code,
    country_id, latitude, longitude, is_active, created_by
)
VALUES (
    {{ $json.body.object_id }},
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
    TRUE,
    {{ $json.body.created_by }}
);

SELECT * FROM object_addresses WHERE id = LAST_INSERT_ID();
```

### Update Address (Old/New Pattern)

```sql
UPDATE object_addresses
SET
    address_type_id = {{ $json.body.address_type_id_new }},
    street_address_1 = {{ $json.body.street_address_1_new }},
    street_address_2 = {{ $json.body.street_address_2_new }},
    address_area_type_id = {{ $json.body.address_area_type_id_new }},
    city = {{ $json.body.city_new }},
    state_province = {{ $json.body.state_province_new }},
    postal_code = {{ $json.body.postal_code_new }},
    country_id = {{ $json.body.country_id_new }},
    is_active = {{ $json.body.is_active_new }},
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_addresses WHERE id = {{ $json.params.id }};
```

### Delete Address (Soft Delete)

```sql
UPDATE object_addresses
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Contacts

### List Contacts for Object

```sql
SELECT
    c.id,
    c.object_id,
    c.contact_type_id,
    c.contact_value,
    c.is_active,
    c.created_by,
    c.created_at,
    c.updated_at
FROM object_contacts c
WHERE c.object_id = {{ $json.params.object_id }}
  AND c.is_active = 1
ORDER BY c.created_at DESC
```

### Get Contact by ID

```sql
SELECT
    c.id,
    c.object_id,
    c.contact_type_id,
    c.contact_value,
    c.is_active,
    c.created_by,
    c.created_at,
    c.updated_at
FROM object_contacts c
WHERE c.id = {{ $json.params.id }}
```

### Create Contact

```sql
INSERT INTO object_contacts (object_id, contact_type_id, contact_value, is_active, created_by)
VALUES (
    {{ $json.body.object_id }},
    {{ $json.body.contact_type_id }},
    {{ $json.body.contact_value }},
    TRUE,
    {{ $json.body.created_by }}
);

SELECT * FROM object_contacts WHERE id = LAST_INSERT_ID();
```

### Update Contact (Old/New Pattern)

```sql
UPDATE object_contacts
SET
    contact_type_id = {{ $json.body.contact_type_id_new }},
    contact_value = {{ $json.body.contact_value_new }},
    is_active = {{ $json.body.is_active_new }},
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_contacts WHERE id = {{ $json.params.id }};
```

### Delete Contact (Soft Delete)

```sql
UPDATE object_contacts
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Identifications

### List Identifications for Object

```sql
SELECT
    i.id,
    i.object_id,
    i.identification_type_id,
    i.identification_value,
    i.is_active,
    i.created_by,
    i.created_at,
    i.updated_at
FROM object_identifications i
WHERE i.object_id = {{ $json.params.object_id }}
  AND i.is_active = 1
ORDER BY i.created_at DESC
```

### Get Identification by ID

```sql
SELECT
    i.id,
    i.object_id,
    i.identification_type_id,
    i.identification_value,
    i.is_active,
    i.created_by,
    i.created_at,
    i.updated_at
FROM object_identifications i
WHERE i.id = {{ $json.params.id }}
```

### Create Identification

```sql
INSERT INTO object_identifications (object_id, identification_type_id, identification_value, is_active, created_by)
VALUES (
    {{ $json.body.object_id }},
    {{ $json.body.identification_type_id }},
    {{ $json.body.identification_value }},
    TRUE,
    {{ $json.body.created_by }}
);

SELECT * FROM object_identifications WHERE id = LAST_INSERT_ID();
```

### Update Identification (Old/New Pattern)

```sql
UPDATE object_identifications
SET
    identification_type_id = {{ $json.body.identification_type_id_new }},
    identification_value = {{ $json.body.identification_value_new }},
    is_active = {{ $json.body.is_active_new }},
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_identifications WHERE id = {{ $json.params.id }};
```

### Delete Identification (Soft Delete)

```sql
UPDATE object_identifications
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Notes

### List Notes for Object (with Translations)

```sql
SELECT
    n.id,
    n.object_id,
    n.note_type_id,
    n.subject_code,
    n.note_text_code,
    ts.text as subject,
    tn.text as note_text,
    n.is_pinned,
    n.is_active,
    n.created_by,
    u.username as created_by_username,
    n.created_at,
    n.updated_at
FROM object_notes n
LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $json.headers['x-language-id'] || 1 }}
LEFT JOIN translations tn ON tn.code = n.note_text_code AND tn.language_id = {{ $json.headers['x-language-id'] || 1 }}
LEFT JOIN users u ON u.id = n.created_by
WHERE n.object_id = {{ $json.params.object_id }}
  AND n.is_active = 1
ORDER BY n.is_pinned DESC, n.created_at DESC
```

### Get Note by ID (with Translations)

```sql
SELECT
    n.id,
    n.object_id,
    n.note_type_id,
    n.subject_code,
    n.note_text_code,
    ts.text as subject,
    tn.text as note_text,
    n.is_pinned,
    n.is_active,
    n.created_by,
    u.username as created_by_username,
    n.created_at,
    n.updated_at
FROM object_notes n
LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = {{ $json.headers['x-language-id'] || 1 }}
LEFT JOIN translations tn ON tn.code = n.note_text_code AND tn.language_id = {{ $json.headers['x-language-id'] || 1 }}
LEFT JOIN users u ON u.id = n.created_by
WHERE n.id = {{ $json.params.id }}
```

### Create Note (with Translations)

```sql
-- Generate unique codes for translations
SET @subject_code = CONCAT('note_subject_', UUID_SHORT());
SET @text_code = CONCAT('note_text_', UUID_SHORT());

-- Insert subject translation (if provided)
INSERT INTO translations (code, language_id, text)
SELECT @subject_code, {{ $json.body.language_id }}, {{ $json.body.subject }}
WHERE {{ $json.body.subject }} IS NOT NULL AND {{ $json.body.subject }} != '';

-- Insert note text translation
INSERT INTO translations (code, language_id, text)
VALUES (@text_code, {{ $json.body.language_id }}, {{ $json.body.note_text }});

-- Insert the note
INSERT INTO object_notes (
    object_id, note_type_id, subject_code, note_text_code,
    is_pinned, is_active, created_by
)
VALUES (
    {{ $json.params.object_id }},
    {{ $json.body.note_type_id }},
    IF({{ $json.body.subject }} IS NOT NULL AND {{ $json.body.subject }} != '', @subject_code, NULL),
    @text_code,
    COALESCE({{ $json.body.is_pinned }}, FALSE),
    TRUE,
    {{ $json.body.created_by }}
);

SELECT * FROM object_notes WHERE id = LAST_INSERT_ID();
```

### Update Note (Old/New Pattern)

```sql
-- Update subject translation
UPDATE translations t
INNER JOIN object_notes n ON n.subject_code = t.code
SET t.text = {{ $json.body.subject_new }}
WHERE n.id = {{ $json.params.id }}
  AND t.language_id = {{ $json.body.language_id }};

-- Update note text translation
UPDATE translations t
INNER JOIN object_notes n ON n.note_text_code = t.code
SET t.text = {{ $json.body.note_text_new }}
WHERE n.id = {{ $json.params.id }}
  AND t.language_id = {{ $json.body.language_id }};

-- Update note metadata
UPDATE object_notes
SET
    note_type_id = {{ $json.body.note_type_id_new }},
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_notes WHERE id = {{ $json.params.id }};
```

### Toggle Note Pin

```sql
UPDATE object_notes
SET is_pinned = {{ $json.body.is_pinned }}, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_notes WHERE id = {{ $json.params.id }};
```

### Delete Note (Soft Delete)

```sql
UPDATE object_notes
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Object Relations

### List Relations for Object

```sql
SELECT
    r.id,
    r.object_from_id,
    r.object_to_id,
    r.object_relation_type_id,
    r.note,
    r.is_active,
    r.created_by,
    r.created_at,
    r.updated_at
FROM object_relations r
WHERE (r.object_from_id = {{ $json.params.object_id }} OR r.object_to_id = {{ $json.params.object_id }})
  AND r.is_active = 1
ORDER BY r.created_at DESC
```

### Get Relation by ID

```sql
SELECT
    r.id,
    r.object_from_id,
    r.object_to_id,
    r.object_relation_type_id,
    r.note,
    r.is_active,
    r.created_by,
    r.created_at,
    r.updated_at
FROM object_relations r
WHERE r.id = {{ $json.params.id }}
```

### Create Relation

```sql
INSERT INTO object_relations (object_from_id, object_to_id, object_relation_type_id, note, is_active, created_by)
VALUES (
    {{ $json.body.object_from_id }},
    {{ $json.body.object_to_id }},
    {{ $json.body.object_relation_type_id }},
    {{ $json.body.note }},
    TRUE,
    {{ $json.body.created_by }}
);

SELECT * FROM object_relations WHERE id = LAST_INSERT_ID();
```

### Update Relation

```sql
UPDATE object_relations
SET
    object_relation_type_id = COALESCE({{ $json.body.object_relation_type_id }}, object_relation_type_id),
    note = COALESCE({{ $json.body.note }}, note),
    updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT * FROM object_relations WHERE id = {{ $json.params.id }};
```

### Delete Relation (Soft Delete)

```sql
UPDATE object_relations
SET is_active = 0, updated_at = NOW()
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Audits

### List Audits for Object

```sql
SELECT
    a.id,
    a.object_id,
    a.audit_action_id,
    a.created_by,
    u.username as created_by_username,
    a.old_values,
    a.new_values,
    a.ip_address,
    a.user_agent,
    a.notes,
    a.created_at
FROM object_audits a
LEFT JOIN users u ON u.id = a.created_by
WHERE a.object_id = {{ $json.params.object_id }}
ORDER BY a.created_at DESC
LIMIT {{ $json.query.per_page || 20 }}
OFFSET {{ (($json.query.page || 1) - 1) * ($json.query.per_page || 20) }}
```

### Create Audit Entry

```sql
INSERT INTO object_audits (
    object_id, audit_action_id, created_by,
    old_values, new_values, ip_address, user_agent, notes
)
VALUES (
    {{ $json.body.object_id }},
    {{ $json.body.audit_action_id }},
    {{ $json.body.created_by }},
    {{ $json.body.old_values }},
    {{ $json.body.new_values }},
    {{ $json.body.ip_address }},
    {{ $json.body.user_agent }},
    {{ $json.body.notes }}
);

SELECT * FROM object_audits WHERE id = LAST_INSERT_ID();
```

---

## Lookup Tables

### List Lookup Items (with Translations)

Replace `{TABLE_NAME}` with: `languages`, `object_types`, `object_statuses`, `sexes`, `salutations`, `product_categories`, `countries`, `address_types`, `address_area_types`, `contact_types`, `identification_types`, `transaction_types`, `currencies`, `note_types`, `audit_actions`

```sql
SELECT
    lt.id,
    lt.code,
    lt.is_active,
    t.text as name
FROM {TABLE_NAME} lt
LEFT JOIN translations t ON t.code = lt.code AND t.language_id = {{ $json.query.language_id || 1 }}
WHERE lt.is_active = 1
ORDER BY lt.code
```

### List Object Statuses (Filtered by Object Type)

```sql
SELECT
    os.id,
    os.code,
    os.is_active,
    os.object_type_id,
    t.text as name
FROM object_statuses os
LEFT JOIN translations t ON t.code = os.code AND t.language_id = {{ $json.query.language_id || 1 }}
WHERE os.is_active = 1
  AND ({{ $json.query.object_type_id }} IS NULL OR os.object_type_id = {{ $json.query.object_type_id }})
ORDER BY os.code
```

### List Object Relation Types (with Parent/Child Filter)

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
LEFT JOIN translations t ON t.code = ort.code AND t.language_id = {{ $json.query.language_id || 1 }}
WHERE ort.is_active = 1
  AND ({{ $json.query.parent_object_type_id }} IS NULL OR ort.parent_object_type_id = {{ $json.query.parent_object_type_id }})
  AND ({{ $json.query.child_object_type_id }} IS NULL OR ort.child_object_type_id = {{ $json.query.child_object_type_id }})
ORDER BY ort.code
```

### Get Lookup Item by ID

```sql
SELECT * FROM {TABLE_NAME} WHERE id = {{ $json.params.id }}
```

### Create Lookup Item

```sql
INSERT INTO {TABLE_NAME} (code, is_active)
VALUES ({{ $json.body.code }}, COALESCE({{ $json.body.is_active }}, TRUE));

-- Create translation if text provided
INSERT INTO translations (code, language_id, text)
SELECT {{ $json.body.code }}, {{ $json.body.language_id }}, {{ $json.body.text }}
WHERE {{ $json.body.text }} IS NOT NULL;

SELECT * FROM {TABLE_NAME} WHERE id = LAST_INSERT_ID();
```

### Update Lookup Item

```sql
UPDATE {TABLE_NAME}
SET
    code = COALESCE({{ $json.body.code }}, code),
    is_active = COALESCE({{ $json.body.is_active }}, is_active)
WHERE id = {{ $json.params.id }};

-- Update translation if text provided
INSERT INTO translations (code, language_id, text)
SELECT
    (SELECT code FROM {TABLE_NAME} WHERE id = {{ $json.params.id }}),
    {{ $json.body.language_id }},
    {{ $json.body.text }}
ON DUPLICATE KEY UPDATE text = {{ $json.body.text }}
WHERE {{ $json.body.text }} IS NOT NULL;

SELECT * FROM {TABLE_NAME} WHERE id = {{ $json.params.id }};
```

### Delete Lookup Item (Soft Delete)

```sql
UPDATE {TABLE_NAME}
SET is_active = 0
WHERE id = {{ $json.params.id }};

SELECT 1 as success;
```

---

## Translations

### List Translations

```sql
SELECT code, language_id, text
FROM translations
WHERE ({{ $json.query.code }} IS NULL OR code = {{ $json.query.code }})
  AND ({{ $json.query.language_id }} IS NULL OR language_id = {{ $json.query.language_id }})
ORDER BY code, language_id
```

### Get Translation by Key

```sql
SELECT code, language_id, text
FROM translations
WHERE code = {{ $json.params.code }}
  AND language_id = {{ $json.params.language_id }}
```

### Create/Update Translation (Upsert)

```sql
INSERT INTO translations (code, language_id, text)
VALUES ({{ $json.body.code }}, {{ $json.body.language_id }}, {{ $json.body.text }})
ON DUPLICATE KEY UPDATE text = {{ $json.body.text }};

SELECT * FROM translations
WHERE code = {{ $json.body.code }} AND language_id = {{ $json.body.language_id }};
```

### Delete Translation

```sql
DELETE FROM translations
WHERE code = {{ $json.params.code }}
  AND language_id = {{ $json.params.language_id }};

SELECT 1 as success;
```

---

## Response Formatting (Code Node)

Use this in a Code node after MySQL to format responses:

### List Response

```javascript
const data = $input.all().map(item => item.json);
const total = $('MySQL Count').first().json.total;
const page = $('Set').first().json.query.page || 1;
const perPage = $('Set').first().json.query.per_page || 20;

return [{
  json: {
    success: true,
    data: data,
    pagination: {
      page: page,
      per_page: perPage,
      total: total,
      total_pages: Math.ceil(total / perPage)
    }
  }
}];
```

### Single Item Response

```javascript
const data = $input.first().json;

return [{
  json: {
    success: true,
    data: data
  }
}];
```

### Success Response (Delete, etc.)

```javascript
return [{
  json: {
    success: true,
    data: { success: true }
  }
}];
```

### Error Response

```javascript
return [{
  json: {
    success: false,
    error: {
      code: 'ERROR_CODE',
      message: 'Error message here'
    }
  }
}];
```
