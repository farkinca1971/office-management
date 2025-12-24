# Phase 1: Database & API Planning Analysis

## Executive Summary

This document provides a comprehensive analysis of the MySQL database schema for an Office Application system. The schema implements a polymorphic entity model with a base `objects` table, supporting multiple entity types (persons, companies, users, documents, files, products, employees) with shared attributes like addresses, contacts, and identifications. The system includes multi-language support via a translations table, financial transaction tracking (invoices, transactions), and audit capabilities.

---

## 1. High-Level Data Model Explanation

### 1.1 Architecture Pattern: Polymorphic Entity Model

The schema uses a **polymorphic entity pattern** where:
- A base `objects` table serves as the root entity for all business objects
- Specific entity tables (`persons`, `companies`, `users`, etc.) extend the base object via foreign key relationships
- All entities share common attributes: type, status, addresses, contacts, identifications
- This allows unified querying and relationship management across different entity types

### 1.2 Core Domain Entities

**Primary Entities:**
- **Persons**: Individual people with personal information (name, birth date, sex, salutation)
- **Companies**: Business entities with company identifiers
- **Users**: System users (linked to persons/companies via objects)
- **Employees**: Employees (linked to persons)
- **Documents**: Document entities with versioning support
- **Files**: File entities with versioning support
- **Products**: Product catalog items

**Supporting Entities:**
- **Invoices**: Financial invoices linked to transactions
- **Transactions**: Financial transaction records

**Lookup/Reference Data:**
- Multiple lookup tables for codes (languages, object_types, sexes, salutations, etc.)
- Multi-language translations system
- Audit actions for tracking changes

### 1.3 Key Relationships

1. **Object Hierarchy**: `objects` → `persons`/`companies`/`users`/etc. (1:1 via shared primary key)
2. **Addresses**: `objects` → `object_addresses` (1:many)
3. **Contacts**: `objects` → `object_contacts` (1:many)
4. **Identifications**: `objects` → `object_identifications` (1:many)
5. **Versioning**: `documents` → `document_versions`, `files` → `file_versions` (1:many)
6. **Financial**: `transactions` → `invoices` (1:many), `objects` → `invoices` (as partners)

---

## 2. Detailed Schema Analysis

### 2.1 Table Creation Order Issue: `translations`

**CRITICAL ISSUE**: The `translations` table **IS defined** in `install.sql` at line 321-330, but it's created **AFTER** tables that reference it, causing foreign key creation failures.

**References Found:**
- Line 154: `documents.document_type` → `translations(code)` ❌ (translations doesn't exist yet)
- Line 196: `products.product_name` → `translations(code)` ❌ (translations doesn't exist yet)
- Line 318: `transactions.note` → `translations(code)` ❌ (translations doesn't exist yet)
- Line 321: `translations` table is finally created ✅ (but too late!)

**Table Definition** (currently at line 321):
```sql
CREATE TABLE translations (
    code VARCHAR(100) NOT NULL,
    language_id INT NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (code, language_id),
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_language_id (language_id),
    INDEX idx_code_language (code, language_id)
);
```

**Impact**: Schema deployment will fail with foreign key constraint errors because MySQL tries to create foreign keys to a table that doesn't exist yet.

**Fix**: Move the `translations` table creation to **line 83** (after `currencies` table, before `audit_actions` table). See `TRANSLATIONS_TABLE_FIX.md` for detailed instructions.

---

### 2.2 Lookup Tables (No Dependencies)

These tables store reference data and are independent:

| Table | Purpose | Key Fields | Notes |
|-------|---------|------------|-------|
| `languages` | Supported languages | `code` (VARCHAR(30), UNIQUE) | ISO language codes |
| `object_types` | Entity type classification | `code` (VARCHAR(30), UNIQUE) | e.g., 'person', 'company', 'user' |
| `object_statuses` | Status values for objects | `code` (VARCHAR(30), UNIQUE) | **No seed data provided** |
| `object_relation_types` | Relationship types | `code` (VARCHAR(30), UNIQUE) | **Created but never used** |
| `sexes` | Gender/sex options | `code` (VARCHAR(30), UNIQUE) | Comprehensive list (17 options) |
| `salutations` | Title prefixes | `code` (VARCHAR(30), UNIQUE) | e.g., 'mr', 'mrs', 'dr' |
| `product_categories` | Product categorization | `code` (VARCHAR(30), UNIQUE) | **No seed data provided** |
| `countries` | Country codes | `code` (VARCHAR(3), UNIQUE) | ISO country codes (3-char) |
| `address_types` | Address classification | `code` (VARCHAR(50), UNIQUE) | e.g., 'home', 'work', 'permanent' |
| `address_area_types` | Street/area type | `code` (VARCHAR(30), UNIQUE) | e.g., 'street', 'avenue', 'boulevard' |
| `contact_types` | Contact method types | `code` (VARCHAR(30), UNIQUE) | e.g., 'phone', 'email', 'whatsapp' |
| `transaction_types` | Transaction classification | `code` (VARCHAR(30), UNIQUE) | e.g., 'SALE', 'PURCHASE', 'INVOICE' |
| `currencies` | Currency codes | `code` (VARCHAR(3), UNIQUE) | ISO currency codes |

**Issues Identified:**
1. `object_statuses` - No seed data provided; required for `objects` table
2. `object_relation_types` - Created but never referenced; consider removing or implementing
3. `product_categories` - No seed data provided; required for `products` table

---

### 2.3 Dependent Lookup Tables

| Table | Purpose | Dependencies | Notes |
|-------|---------|--------------|-------|
| `audit_actions` | Audit action codes | `object_types` | Links actions to object types |
| `identification_types` | ID document types | `object_types` | Different ID types per entity type |

---

### 2.4 Core Entity Tables

#### 2.4.1 `objects` (Base Entity Table)

```sql
CREATE TABLE objects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_type_id INT NOT NULL,
    object_status_id INT NOT NULL,
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (object_status_id) REFERENCES object_statuses(id) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id)
);
```

**Purpose**: Root table for all business entities. Uses shared primary key pattern with child tables.

**Design Notes:**
- `BIGINT` for ID allows for large-scale systems
- No timestamps; consider adding `created_at`, `updated_at` for audit
- No soft delete mechanism; consider `deleted_at` if needed

**Issues:**
- Requires `object_statuses` seed data (not provided)
- No audit trail fields (who created/updated)

---

#### 2.4.2 Entity Extension Tables

**`persons`**
```sql
CREATE TABLE persons (
    id BIGINT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    mother_name VARCHAR(100),
    sex_id INT,
    salutation_id INT,
    birth_date DATE,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (sex_id) REFERENCES sexes(id) ON DELETE RESTRICT,
    FOREIGN KEY (salutation_id) REFERENCES salutations(id) ON DELETE RESTRICT
);
```

**Design Notes:**
- Uses shared primary key (`id` = `objects.id`)
- `mother_name` suggests cultural requirements (e.g., Hungarian naming conventions)
- Optional `sex_id` and `salutation_id` allow flexibility
- No full name computed field; frontend must concatenate

**`companies`**
```sql
CREATE TABLE companies (
    id BIGINT PRIMARY KEY,
    company_id VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE
);
```

**Design Notes:**
- `company_id` likely refers to registration/tax ID (separate from primary key)
- No uniqueness constraint on `company_id`; consider adding if business rule requires

**`users`**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE
);
```

**Design Notes:**
- `username` is nullable; consider making NOT NULL if required
- No uniqueness constraint on `username`; should add UNIQUE if usernames must be unique
- Password stored separately in `user_passwords` table

**`user_passwords`**
```sql
CREATE TABLE user_passwords (
    user_id BIGINT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Design Notes:**
- Supports password history via `is_active` flag
- Timestamps for password lifecycle tracking
- `password_hash` length (255) should accommodate modern hashing algorithms (bcrypt, argon2)

**`employees`**
```sql
CREATE TABLE employees (
    id BIGINT PRIMARY KEY,
    person_id BIGINT NOT NULL,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);
```

**Design Notes:**
- Links employee entity to person entity
- Employee has its own object ID (for status, addresses, etc.)
- Person can potentially be linked to multiple employees (if rehiring is tracked)

**`documents`**
```sql
CREATE TABLE documents (
    id BIGINT PRIMARY KEY,
    document_type VARCHAR(100),
    document_name VARCHAR(30) UNIQUE NOT NULL,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type) REFERENCES translations(code) ON DELETE RESTRICT
);
```

**Issues:**
- `document_type` references `translations(code)` but translations table missing
- `document_name` UNIQUE constraint may be too restrictive (30 chars, globally unique)

**`document_versions`**
```sql
CREATE TABLE document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL,
    version_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    description VARCHAR(100) NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    UNIQUE KEY unique_document_version (document_id, version_number)
);
```

**Design Notes:**
- Good versioning pattern with unique constraint
- `created_by` allows audit trail
- No content storage; likely stored in file system or separate blob table

**`files`** and **`file_versions`**
- Similar pattern to documents
- `file_versions` includes `file_path`, `file_size` for physical file tracking

**`products`**
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    category_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_name) REFERENCES translations(code) ON DELETE RESTRICT
);
```

**Issues:**
- `product_name` references `translations(code)` but translations table missing
- `product_categories` has no seed data

---

### 2.5 Relationship Tables

#### 2.5.1 `object_addresses`

```sql
CREATE TABLE object_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL,
    address_type_id INT NOT NULL,
    street_address_1 VARCHAR(255) NOT NULL,
    street_address_2 VARCHAR(255),
    address_area_type_id INT,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country_id INT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (address_type_id) REFERENCES address_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_area_type_id) REFERENCES address_area_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_id (object_id),
    INDEX idx_address_type_id (address_type_id),
    INDEX idx_city (city),
    INDEX idx_is_active (is_active)
);
```

**Design Notes:**
- Well-indexed for common queries
- Supports geocoding (latitude/longitude)
- Soft delete via `is_active`
- Good audit fields (`created_by`, timestamps)

#### 2.5.2 `object_contacts`

Similar pattern to addresses:
- Multiple contact methods per object
- `is_active` for soft delete
- Indexed appropriately

#### 2.5.3 `object_identifications`

Similar pattern:
- Multiple ID documents per object
- Links to `identification_types` (which are scoped to object types)

---

### 2.6 Financial Tables

#### 2.6.1 `transactions`

```sql
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY,
    transaction_type_id INT NOT NULL,
    transaction_date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_date_end TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    note VARCHAR(255),
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (note) REFERENCES translations(code) ON DELETE SET NULL
);
```

**Issues:**
- `note` references `translations(code)` but translations table missing
- `transaction_date_end` suggests duration tracking (unusual for transactions)

#### 2.6.2 `invoices`

```sql
CREATE TABLE invoices (
    id BIGINT PRIMARY KEY,
    transaction_id BIGINT,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    payment_date DATE,
    partner_id_from BIGINT,
    partner_id_to BIGINT,
    note VARCHAR(255),
    reference_number VARCHAR(100),
    is_mirror BOOLEAN,
    currency_id INT NOT NULL,
    netto_amount DECIMAL(10,2),
    tax DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    is_paid BOOLEAN DEFAULT FALSE,
    is_void BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id_from) REFERENCES objects(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id_to) REFERENCES objects(id) ON DELETE SET NULL,
    FOREIGN KEY (currency_id) REFERENCES currencies(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_invoice_number (invoice_number),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_partner_id_from (partner_id_from),
    INDEX idx_partner_id_to (partner_id_to),
    INDEX idx_currency_id (currency_id),
    INDEX idx_issue_date (issue_date),
    INDEX idx_due_date (due_date),
    INDEX idx_is_paid (is_paid),
    INDEX idx_is_void (is_void)
);
```

**Design Notes:**
- Well-indexed for financial queries
- `is_mirror` suggests credit/debit note support
- `partner_id_from/to` allows flexible invoice direction
- `invoice_number` UNIQUE constraint ensures no duplicates
- `DECIMAL(10,2)` for amounts - consider if precision is sufficient for all currencies

**Potential Issues:**
- Circular dependency: `invoices.transaction_id` → `transactions.id`, but `transactions.id` → `objects.id` and `invoices.id` → `objects.id`. This is actually fine (both reference objects, not each other directly).

---

## 3. Schema Issues & Recommendations

### 3.1 Critical Issues

1. **Missing `translations` Table**
   - **Severity**: CRITICAL
   - **Impact**: Schema cannot be deployed
   - **Fix**: Add table definition (see section 2.1)

2. **Missing Seed Data**
   - `object_statuses`: Required for `objects` table
   - `product_categories`: Required for `products` table
   - **Impact**: Cannot create objects/products without seed data

3. **Foreign Key Data Type Mismatch**
   - `database_inserts.sql` line 1130: `INSERT INTO translations (code, language_id, value)` uses `value` column
   - But expected schema uses `text` column
   - **Impact**: Inserts will fail

### 3.2 Design Concerns

1. **Unused Table**: `object_relation_types`
   - Created but never referenced
   - **Recommendation**: Remove or implement object relationships

2. **Missing Constraints**:
   - `users.username` should be UNIQUE if business rule requires
   - `companies.company_id` should be UNIQUE if registration numbers must be unique

3. **No Audit Trail on `objects`**:
   - Consider adding `created_by`, `updated_by`, `created_at`, `updated_at`

4. **No Soft Delete on Core Entities**:
   - Consider `deleted_at` timestamp on `objects` table

5. **Translation Column Name Inconsistency**:
   - Schema expects `text`, inserts use `value` in some places

### 3.3 Performance Considerations

1. **Indexes**: Generally well-indexed, but consider:
   - Composite index on `object_addresses(object_id, is_active)` for active address queries
   - Composite index on `invoices(partner_id_to, is_paid, due_date)` for payment tracking

2. **Large Tables**: `objects` table will grow large; ensure proper partitioning strategy if needed

3. **Query Patterns**: Consider materialized views for common joins (e.g., person with addresses)

---

## 4. API Contract Definition

### 4.1 API Design Principles

- **RESTful Style**: Use HTTP methods appropriately (GET, POST, PUT, DELETE)
- **JSON Payloads**: All requests/responses in JSON
- **Consistent Error Format**: Standard error response structure
- **Pagination**: For list endpoints
- **Filtering/Sorting**: Query parameters for list endpoints

### 4.2 Base URL Structure

```
https://{n8n-webhook-base-url}/api/v1/{resource}
```

### 4.3 Standard Response Formats

#### Success Response (Single Resource)
```json
{
  "success": true,
  "data": {
    "id": 123,
    // ... resource fields
  }
}
```

#### Success Response (List)
```json
{
  "success": true,
  "data": [
    { /* resource 1 */ },
    { /* resource 2 */ }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Field 'first_name' is required",
    "details": {
      "field": "first_name",
      "reason": "required"
    }
  }
}
```

### 4.4 Endpoint Definitions

#### 4.4.1 Lookup/Reference Data Endpoints

**Get Languages**
```
GET /api/v1/languages
Response: List of languages with translations
```

**Get Object Types**
```
GET /api/v1/object-types
Response: List of object types
```

**Get Object Statuses**
```
GET /api/v1/object-statuses
Response: List of object statuses
```

**Get Contact Types**
```
GET /api/v1/contact-types
Response: List of contact types
```

**Get Address Types**
```
GET /api/v1/address-types
Response: List of address types
```

**Get Countries**
```
GET /api/v1/countries
Response: List of countries
```

**Get Currencies**
```
GET /api/v1/currencies
Response: List of currencies
```

**Get Transaction Types**
```
GET /api/v1/transaction-types
Response: List of transaction types
```

**Get Translations**
```
GET /api/v1/translations?code={code}&language_id={language_id}
Query Params:
  - code: Filter by translation code
  - language_id: Filter by language
Response: List of translations
```

---

#### 4.4.2 Person Endpoints

**Create Person**
```
POST /api/v1/persons
Request Body:
{
  "object_type_id": 1,
  "object_status_id": 1,
  "first_name": "John",
  "middle_name": "Michael",
  "last_name": "Doe",
  "mother_name": "Jane",
  "sex_id": 1,
  "salutation_id": 1,
  "birth_date": "1990-01-15"
}
Response: Created person object with full details
```

**Get Person**
```
GET /api/v1/persons/{id}
Response: Person with addresses, contacts, identifications
```

**Update Person**
```
PUT /api/v1/persons/{id}
Request Body: Partial update (only fields to change)
Response: Updated person object
```

**Delete Person**
```
DELETE /api/v1/persons/{id}
Response: { "success": true, "message": "Person deleted" }
```

**List Persons**
```
GET /api/v1/persons?page=1&per_page=20&search={search}&object_status_id={status_id}
Query Params:
  - page: Page number (default: 1)
  - per_page: Items per page (default: 20, max: 100)
  - search: Search in name fields
  - object_status_id: Filter by status
Response: Paginated list of persons
```

---

#### 4.4.3 Company Endpoints

**Create Company**
```
POST /api/v1/companies
Request Body:
{
  "object_type_id": 2,
  "object_status_id": 1,
  "company_id": "REG-12345",
  "company_name": "Acme Corp"
}
Response: Created company object
```

**Get Company**
```
GET /api/v1/companies/{id}
Response: Company with addresses, contacts, identifications
```

**Update Company**
```
PUT /api/v1/companies/{id}
Request Body: Partial update
Response: Updated company object
```

**Delete Company**
```
DELETE /api/v1/companies/{id}
Response: Success confirmation
```

**List Companies**
```
GET /api/v1/companies?page=1&per_page=20&search={search}
Response: Paginated list of companies
```

---

#### 4.4.4 User Endpoints

**Create User**
```
POST /api/v1/users
Request Body:
{
  "object_type_id": 3,
  "object_status_id": 1,
  "username": "johndoe",
  "password": "securepassword123"
}
Response: Created user object (password hash not returned)
```

**Get User**
```
GET /api/v1/users/{id}
Response: User object (no password info)
```

**Update User**
```
PUT /api/v1/users/{id}
Request Body: Partial update (username, etc.)
Response: Updated user object
```

**Change Password**
```
POST /api/v1/users/{id}/password
Request Body:
{
  "current_password": "oldpass",
  "new_password": "newpass"
}
Response: Success confirmation
```

**Delete User**
```
DELETE /api/v1/users/{id}
Response: Success confirmation
```

**List Users**
```
GET /api/v1/users?page=1&per_page=20&search={search}
Response: Paginated list of users
```

---

#### 4.4.5 Address Endpoints

**Add Address to Object**
```
POST /api/v1/objects/{object_id}/addresses
Request Body:
{
  "address_type_id": 1,
  "street_address_1": "123 Main St",
  "street_address_2": "Apt 4B",
  "address_area_type_id": 1,
  "city": "New York",
  "state_province": "NY",
  "postal_code": "10001",
  "country_id": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}
Response: Created address object
```

**Update Address**
```
PUT /api/v1/addresses/{address_id}
Request Body: Partial update
Response: Updated address object
```

**Delete Address (Soft Delete)**
```
DELETE /api/v1/addresses/{address_id}
Response: Success confirmation (sets is_active = false)
```

**Get Object Addresses**
```
GET /api/v1/objects/{object_id}/addresses?is_active={true|false}
Query Params:
  - is_active: Filter by active status (default: true)
Response: List of addresses for object
```

---

#### 4.4.6 Contact Endpoints

**Add Contact to Object**
```
POST /api/v1/objects/{object_id}/contacts
Request Body:
{
  "contact_type_id": 3,
  "contact_value": "john.doe@example.com"
}
Response: Created contact object
```

**Update Contact**
```
PUT /api/v1/contacts/{contact_id}
Request Body: Partial update
Response: Updated contact object
```

**Delete Contact (Soft Delete)**
```
DELETE /api/v1/contacts/{contact_id}
Response: Success confirmation
```

**Get Object Contacts**
```
GET /api/v1/objects/{object_id}/contacts?is_active={true|false}&contact_type_id={type_id}
Response: List of contacts for object
```

---

#### 4.4.7 Identification Endpoints

**Add Identification to Object**
```
POST /api/v1/objects/{object_id}/identifications
Request Body:
{
  "identification_type_id": 1,
  "identification_value": "P123456789"
}
Response: Created identification object
```

**Update Identification**
```
PUT /api/v1/identifications/{identification_id}
Request Body: Partial update
Response: Updated identification object
```

**Delete Identification (Soft Delete)**
```
DELETE /api/v1/identifications/{identification_id}
Response: Success confirmation
```

**Get Object Identifications**
```
GET /api/v1/objects/{object_id}/identifications?is_active={true|false}
Response: List of identifications for object
```

---

#### 4.4.8 Invoice Endpoints

**Create Invoice**
```
POST /api/v1/invoices
Request Body:
{
  "object_type_id": 6, // Assuming invoice has object type
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
Response: Created invoice object
```

**Get Invoice**
```
GET /api/v1/invoices/{id}
Response: Invoice with full details
```

**Update Invoice**
```
PUT /api/v1/invoices/{id}
Request Body: Partial update
Response: Updated invoice object
```

**Mark Invoice as Paid**
```
POST /api/v1/invoices/{id}/pay
Request Body:
{
  "payment_date": "2024-01-20"
}
Response: Updated invoice (is_paid = true)
```

**Void Invoice**
```
POST /api/v1/invoices/{id}/void
Response: Updated invoice (is_void = true)
```

**List Invoices**
```
GET /api/v1/invoices?page=1&per_page=20&partner_id={id}&is_paid={true|false}&is_void={true|false}&date_from={date}&date_to={date}
Query Params:
  - partner_id: Filter by partner (from or to)
  - is_paid: Filter by payment status
  - is_void: Filter by void status
  - date_from: Filter invoices from date
  - date_to: Filter invoices to date
Response: Paginated list of invoices
```

---

#### 4.4.9 Transaction Endpoints

**Create Transaction**
```
POST /api/v1/transactions
Request Body:
{
  "object_type_id": 7, // Assuming transaction has object type
  "object_status_id": 1,
  "transaction_type_id": 1,
  "transaction_date_start": "2024-01-15T10:00:00Z",
  "transaction_date_end": "2024-01-15T11:00:00Z",
  "note": "Transaction note"
}
Response: Created transaction object
```

**Get Transaction**
```
GET /api/v1/transactions/{id}
Response: Transaction with related invoices
```

**Update Transaction**
```
PUT /api/v1/transactions/{id}
Request Body: Partial update
Response: Updated transaction object
```

**Delete Transaction**
```
DELETE /api/v1/transactions/{id}
Response: Success confirmation
```

**List Transactions**
```
GET /api/v1/transactions?page=1&per_page=20&transaction_type_id={type_id}&date_from={date}&date_to={date}
Response: Paginated list of transactions
```

---

### 4.5 Error Handling Strategy

#### HTTP Status Codes
- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Validation errors, malformed requests
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Unique constraint violation (e.g., duplicate invoice number)
- `422 Unprocessable Entity`: Business rule violations
- `500 Internal Server Error`: Server errors

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  }
}
```

#### Common Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Unique constraint violation
- `FOREIGN_KEY_CONSTRAINT`: Referenced resource doesn't exist
- `BUSINESS_RULE_VIOLATION`: Business logic error
- `AUTHENTICATION_REQUIRED`: User not authenticated
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions

---

### 4.6 Authentication & Authorization

**Note**: Authentication strategy not defined in schema. Recommendations:

1. **API Key Authentication** (for n8n webhooks):
   - Header: `X-API-Key: {key}`
   - Validate in n8n workflow before processing

2. **Session-Based Authentication** (for frontend):
   - Login endpoint: `POST /api/v1/auth/login`
   - Returns session token
   - Include token in `Authorization: Bearer {token}` header

3. **Authorization**:
   - User roles/permissions table not in schema
   - Consider adding `user_roles` and `permissions` tables
   - Or handle authorization in n8n workflows

---

## 5. Open Questions & Clarifications Needed

### 5.1 Critical Questions

1. **Translations Table Schema**:
   - Confirm column name: `text` or `value`?
   - Should `code` be VARCHAR(100) or larger?

2. **Object Statuses**:
   - What are the valid status codes? (e.g., 'active', 'inactive', 'archived', 'deleted')
   - Should we implement soft delete via status or `deleted_at` timestamp?

3. **Product Categories**:
   - What are the initial product category codes?
   - Or should categories be user-defined?

4. **Object Relations**:
   - Is `object_relation_types` table needed? If so, what relationships should be tracked?
   - Should we implement a generic `object_relations` table?

5. **User Authentication**:
   - What authentication mechanism should be used?
   - Should we add user roles/permissions tables?

6. **Invoice-Transaction Relationship**:
   - Can an invoice exist without a transaction?
   - Can a transaction have multiple invoices?
   - What is the business logic?

7. **Username Uniqueness**:
   - Should `users.username` be UNIQUE?
   - Can usernames be changed?

8. **Company ID Uniqueness**:
   - Should `companies.company_id` be UNIQUE?
   - What is the business rule for company registration numbers?

### 5.2 Design Questions

1. **Audit Trail**:
   - Should we add `created_by`, `updated_by` to `objects` table?
   - Do we need a separate `audit_log` table for change tracking?

2. **Soft Delete**:
   - Should we add `deleted_at` to `objects` table?
   - Or rely on `object_status_id` for soft delete?

3. **File Storage**:
   - Where are files physically stored? (File system, S3, etc.)
   - Should `file_versions.file_path` be absolute or relative?

4. **Document Content**:
   - Where is document content stored?
   - Should we add a `document_content` table or use file references?

5. **Multi-tenancy**:
   - Is this a multi-tenant system?
   - Should we add `tenant_id` or `organization_id` to tables?

6. **Localization**:
   - How should dates/times be handled? (UTC storage?)
   - Should currency amounts support more decimal places for some currencies?

---

## 6. Recommendations Summary

### 6.1 Immediate Actions Required

1. ✅ **Add `translations` table** to schema
2. ✅ **Add seed data** for `object_statuses` and `product_categories`
3. ✅ **Fix column name inconsistency** in `database_inserts.sql` (value vs text)
4. ✅ **Add UNIQUE constraint** on `users.username` if required
5. ✅ **Add UNIQUE constraint** on `companies.company_id` if required

### 6.2 Enhancements to Consider

1. Add audit fields (`created_by`, `updated_by`) to `objects` table
2. Add `deleted_at` timestamp for soft delete
3. Implement `object_relations` table if relationships needed
4. Add user roles/permissions tables for authorization
5. Consider adding indexes for common query patterns
6. Add validation rules documentation for n8n workflows

### 6.3 API Implementation Notes for n8n

1. **Validation**: Implement validation in n8n workflows before database operations
2. **Error Handling**: Return consistent error format
3. **Transaction Management**: Use database transactions for multi-step operations
4. **Pagination**: Implement pagination for all list endpoints
5. **Filtering**: Support filtering by common fields
6. **Authentication**: Validate API keys/tokens in workflow start node

---

## 7. Next Steps

1. **Review this document** and provide answers to open questions
2. **Confirm missing table definitions** and seed data requirements
3. **Approve API contract** or request modifications
4. **Provide n8n webhook base URL** for frontend configuration
5. **Clarify authentication/authorization** requirements

Once Phase 1 is approved, we will proceed to Phase 2: Frontend Implementation.

---

**Document Version**: 1.0  
**Date**: 2024  
**Status**: Awaiting Approval

