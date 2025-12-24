-- ============================================================================
-- Office Application Database Schema
-- ============================================================================
-- File: 01_schema.sql
-- Purpose: Complete database structure definition
-- Usage: Execute this file first to create all tables
-- Dependencies: None (this file creates all tables)
-- ============================================================================

-- ============================================================================
-- SECTION 1: LOOKUP TABLES (No Dependencies)
-- ============================================================================
-- These tables store reference data and have no foreign key dependencies.
-- They must be created first as other tables reference them.

-- ----------------------------------------------------------------------------
-- Languages: Supported language codes (ISO language codes)
-- ----------------------------------------------------------------------------
-- Note: languages.code does NOT reference translations (circular dependency)
-- as translations.language_id references languages.id
CREATE TABLE languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'ISO language code (e.g., en, de, hu)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this language is currently active'
);

-- ----------------------------------------------------------------------------
-- Object Types: Classification of entity types in the system
-- ----------------------------------------------------------------------------
CREATE TABLE object_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Object type code (e.g., person, company, user)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this object type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Object Statuses: Status values for objects (active, inactive, archived, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE object_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Status code (e.g., active, inactive, archived)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this status is currently active',
    object_type_id INT NOT NULL COMMENT 'Object type this action applies to',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Object Relation Types: Types of relationships between objects
-- ----------------------------------------------------------------------------
-- Defines types of relationships that can exist between objects
-- Examples: employee (Company-Person), family_member (Person-Person), 
-- business_partner (Company-Company), etc.
CREATE TABLE object_relation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Relation type code (e.g., employee, family_member, business_partner)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this relation type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Sexes: Gender/sex options for persons
-- ----------------------------------------------------------------------------
CREATE TABLE sexes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Sex/gender code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this option is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Salutations: Title prefixes (Mr, Mrs, Dr, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE salutations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Salutation code (e.g., mr, mrs, dr)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this salutation is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Product Categories: Categories for product classification
-- ----------------------------------------------------------------------------
CREATE TABLE product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Product category code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this category is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Countries: Country codes (ISO 3-character codes)
-- ----------------------------------------------------------------------------
CREATE TABLE countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL COMMENT 'ISO 3-character country code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this country is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Address Types: Types of addresses (home, work, permanent, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE address_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Address type code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this address type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Address Area Types: Street/area type classifications (street, avenue, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE address_area_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Area type code (e.g., street, avenue, boulevard)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this area type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Contact Types: Types of contact methods (phone, email, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE contact_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Contact type code (e.g., phone, email, whatsapp)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this contact type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Transaction Types: Types of financial transactions
-- ----------------------------------------------------------------------------
CREATE TABLE transaction_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Transaction type code (e.g., SALE, PURCHASE, INVOICE)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this transaction type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Currencies: Currency codes (ISO 3-character codes)
-- ----------------------------------------------------------------------------
CREATE TABLE currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL COMMENT 'ISO 3-character currency code (e.g., USD, EUR, HUF)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this currency is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ============================================================================
-- SECTION 2: TRANSLATIONS TABLE
-- ============================================================================
-- This table must be created BEFORE tables that reference it via foreign keys.
-- It stores multi-language translations for various codes in the system.

-- ----------------------------------------------------------------------------
-- Translations: Multi-language text storage
-- ----------------------------------------------------------------------------
CREATE TABLE translations (
    code VARCHAR(100) NOT NULL COMMENT 'Translation code (references various lookup codes)',
    language_id INT NOT NULL COMMENT 'Language ID from languages table',
    text TEXT NOT NULL COMMENT 'Translated text in the specified language',
    PRIMARY KEY (code, language_id),
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_language_id (language_id),
    INDEX idx_code_language (code, language_id)
);

-- ============================================================================
-- SECTION 3: DEPENDENT LOOKUP TABLES
-- ============================================================================
-- These lookup tables have foreign key dependencies on other lookup tables.

-- ----------------------------------------------------------------------------
-- Audit Actions: Action codes for audit logging, scoped to object types
-- ----------------------------------------------------------------------------
CREATE TABLE audit_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Action code (e.g., CREATE_PERSON, UPDATE_COMPANY)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this action is currently active',
    object_type_id INT NOT NULL COMMENT 'Object type this action applies to',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id)
);

-- ----------------------------------------------------------------------------
-- Identification Types: Types of identification documents, scoped to object types
-- ----------------------------------------------------------------------------
CREATE TABLE identification_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Identification type code (e.g., passport, id_card)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this identification type is currently active',
    object_type_id INT NOT NULL COMMENT 'Object type this identification applies to',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id)
);

-- ============================================================================
-- SECTION 4: CORE ENTITY TABLES
-- ============================================================================
-- Base object table and entity extension tables using polymorphic pattern.

-- ----------------------------------------------------------------------------
-- Objects: Base table for all business entities (polymorphic pattern)
-- ----------------------------------------------------------------------------
-- All entities in the system extend this table via shared primary key.
-- This allows unified querying and relationship management.
CREATE TABLE objects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for all objects',
    object_type_id INT NOT NULL COMMENT 'Type of object (person, company, user, etc.)',
    object_status_id INT NOT NULL COMMENT 'Current status of the object',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (object_status_id) REFERENCES object_statuses(id) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id),
    INDEX idx_object_status_id (object_status_id)
);

-- ----------------------------------------------------------------------------
-- Persons: Individual people with personal information
-- ----------------------------------------------------------------------------
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
    FOREIGN KEY (salutation_id) REFERENCES salutations(id) ON DELETE RESTRICT,
    INDEX idx_last_name (last_name),
    INDEX idx_first_name (first_name)
);

-- ----------------------------------------------------------------------------
-- Companies: Business entities
-- ----------------------------------------------------------------------------
CREATE TABLE companies (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    company_id VARCHAR(255) NOT NULL COMMENT 'Company registration/tax ID (business identifier)',
    company_name VARCHAR(255) NOT NULL COMMENT 'Legal company name',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    INDEX idx_company_id (company_id),
    INDEX idx_company_name (company_name)
);

-- ----------------------------------------------------------------------------
-- Users: System users
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    username VARCHAR(255) COMMENT 'Username for login (should be unique)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    INDEX idx_username (username)
);

-- ----------------------------------------------------------------------------
-- User Passwords: Password storage with history support
-- ----------------------------------------------------------------------------
CREATE TABLE user_passwords (
    user_id BIGINT PRIMARY KEY COMMENT 'References users.id',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt, argon2, etc.)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this password is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When password was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When password was last updated',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- Documents: Document entities with versioning support
-- ----------------------------------------------------------------------------
CREATE TABLE documents (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    document_type VARCHAR(100) COMMENT 'Document type code (references translations)',
    document_name VARCHAR(30) UNIQUE NOT NULL COMMENT 'Unique document name/identifier',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_document_name (document_name)
);

-- ----------------------------------------------------------------------------
-- Document Versions: Version history for documents
-- ----------------------------------------------------------------------------
CREATE TABLE document_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id BIGINT NOT NULL COMMENT 'References documents.id',
    version_number INT NOT NULL COMMENT 'Version number (1, 2, 3, ...)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this version was created',
    created_by BIGINT COMMENT 'User/object who created this version',
    description VARCHAR(100) NOT NULL COMMENT 'Description of changes in this version',
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    UNIQUE KEY unique_document_version (document_id, version_number),
    INDEX idx_document_id (document_id),
    INDEX idx_created_at (created_at)
);

-- ----------------------------------------------------------------------------
-- Files: File entities with versioning support
-- ----------------------------------------------------------------------------
CREATE TABLE files (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    file_name VARCHAR(255) NOT NULL COMMENT 'File name',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    INDEX idx_file_name (file_name)
);

-- ----------------------------------------------------------------------------
-- File Versions: Version history for files
-- ----------------------------------------------------------------------------
CREATE TABLE file_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id BIGINT NOT NULL COMMENT 'References files.id',
    version_number INT NOT NULL COMMENT 'Version number (1, 2, 3, ...)',
    file_name VARCHAR(255) NOT NULL COMMENT 'File name for this version',
    file_size INT COMMENT 'File size in bytes',
    file_path TEXT COMMENT 'Path to physical file (file system or storage service)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When this version was created',
    created_by BIGINT COMMENT 'User/object who created this version',
    description VARCHAR(100) NOT NULL COMMENT 'Description of changes in this version',
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    UNIQUE KEY unique_file_version (file_id, version_number),
    INDEX idx_file_id (file_id),
    INDEX idx_created_at (created_at)
);

-- ----------------------------------------------------------------------------
-- Products: Product catalog items
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    category_id INT NOT NULL COMMENT 'Product category from product_categories',
    product_name VARCHAR(100) NOT NULL COMMENT 'Product name code (references translations)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (product_name) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_category_id (category_id)
);

-- ----------------------------------------------------------------------------
-- Employees: Employee entities (linked to persons)
-- ----------------------------------------------------------------------------
CREATE TABLE employees (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    person_id BIGINT NOT NULL COMMENT 'References persons.id',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_person_id (person_id)
);

-- ============================================================================
-- SECTION 5: RELATIONSHIP TABLES
-- ============================================================================
-- Tables that link objects to addresses, contacts, and identifications.

-- ----------------------------------------------------------------------------
-- Object Addresses: Addresses associated with objects
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When address was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When address was last updated',
    created_by BIGINT COMMENT 'User/object who created this address',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (address_type_id) REFERENCES address_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_area_type_id) REFERENCES address_area_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_id (object_id),
    INDEX idx_address_type_id (address_type_id),
    INDEX idx_city (city),
    INDEX idx_is_active (is_active),
    INDEX idx_object_active (object_id, is_active)
);

-- ----------------------------------------------------------------------------
-- Object Contacts: Contact methods associated with objects
-- ----------------------------------------------------------------------------
CREATE TABLE object_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id',
    contact_type_id INT NOT NULL COMMENT 'Type of contact (phone, email, etc.)',
    contact_value VARCHAR(255) NOT NULL COMMENT 'Contact value (phone number, email address, etc.)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this contact is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When contact was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When contact was last updated',
    created_by BIGINT COMMENT 'User/object who created this contact',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_type_id) REFERENCES contact_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_id (object_id),
    INDEX idx_contact_type_id (contact_type_id),
    INDEX idx_is_active (is_active),
    INDEX idx_object_active (object_id, is_active)
);

-- ----------------------------------------------------------------------------
-- Object Identifications: Identification documents associated with objects
-- ----------------------------------------------------------------------------
CREATE TABLE object_identifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id',
    identification_type_id INT NOT NULL COMMENT 'Type of identification document',
    identification_value VARCHAR(255) NOT NULL COMMENT 'Identification number/value',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this identification is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When identification was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When identification was last updated',
    created_by BIGINT COMMENT 'User/object who created this identification',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (identification_type_id) REFERENCES identification_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_id (object_id),
    INDEX idx_identification_type_id (identification_type_id),
    INDEX idx_is_active (is_active),
    INDEX idx_object_active (object_id, is_active)
);

-- ----------------------------------------------------------------------------
-- Object Relations: Relationships between objects
-- ----------------------------------------------------------------------------
-- Defines relationships between objects (e.g., Company-Person = employee,
-- Person-Person = family connection, Company-Company = business connection)
CREATE TABLE object_relations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_from_id BIGINT NOT NULL COMMENT 'Source object (e.g., Company in Company-Person relationship)',
    object_to_id BIGINT NOT NULL COMMENT 'Target object (e.g., Person in Company-Person relationship)',
    object_relation_type_id INT NOT NULL COMMENT 'Type of relationship from object_relation_types',
    note VARCHAR(255) COMMENT 'Additional notes about the relationship',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this relationship is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When relationship was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When relationship was last updated',
    created_by BIGINT COMMENT 'User/object who created this relationship',
    FOREIGN KEY (object_from_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (object_to_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (object_relation_type_id) REFERENCES object_relation_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_from_id (object_from_id),
    INDEX idx_object_to_id (object_to_id),
    INDEX idx_object_relation_type_id (object_relation_type_id),
    INDEX idx_is_active (is_active),
    INDEX idx_from_to (object_from_id, object_to_id),
    INDEX idx_to_from (object_to_id, object_from_id)
);

-- ============================================================================
-- SECTION 6: FINANCIAL TABLES
-- ============================================================================
-- Tables for financial transactions and invoices.

-- ----------------------------------------------------------------------------
-- Transactions: Financial transaction records
-- ----------------------------------------------------------------------------
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    transaction_type_id INT NOT NULL COMMENT 'Type of transaction (SALE, PURCHASE, etc.)',
    transaction_date_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Transaction start date/time',
    transaction_date_end TIMESTAMP COMMENT 'Transaction end date/time (if applicable)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this transaction is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When transaction was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When transaction was last updated',
    note VARCHAR(255) COMMENT 'Transaction note (references translations)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (note) REFERENCES translations(code) ON DELETE SET NULL,
    INDEX idx_transaction_type_id (transaction_type_id),
    INDEX idx_transaction_date_start (transaction_date_start),
    INDEX idx_is_active (is_active)
);

-- ----------------------------------------------------------------------------
-- Invoices: Invoice records linked to transactions
-- ----------------------------------------------------------------------------
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When invoice was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When invoice was last updated',
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
    INDEX idx_is_void (is_void),
    INDEX idx_partner_paid_due (partner_id_to, is_paid, due_date)
);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

