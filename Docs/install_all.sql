-- ============================================================================
-- Office Application Database - Complete Installation Script
-- ============================================================================
-- File: install_all.sql
-- Purpose: Complete database installation (schema + seed data) in one file
-- Usage: mysql -u username -p database_name < install_all.sql
-- Dependencies: None - this file contains everything needed
-- ============================================================================
-- 
-- This script:
-- 1. Disables foreign key checks temporarily to allow flexible table creation order
-- 2. Creates all tables (schema)
-- 3. Re-enables foreign key checks
-- 4. Inserts all seed data
-- ============================================================================

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- PART 1: DATABASE SCHEMA
-- ============================================================================

-- ============================================================================
-- SECTION 1: FOUNDATION TABLES (No Dependencies)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Languages: Supported language codes (ISO language codes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'ISO language code (e.g., en, de, hu)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this language is currently active'
);

-- ============================================================================
-- SECTION 2: TRANSLATIONS TABLE (Must be created early)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Translations: Multi-language text storage
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS translations (
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
-- SECTION 3: LOOKUP TABLES (Reference translations)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Object Types: Classification of entity types in the system
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Object type code (e.g., person, company, user)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this object type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Object Statuses: Status values for objects (active, inactive, archived, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_statuses (
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
CREATE TABLE IF NOT EXISTS object_relation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Relation type code (e.g., employee, family_member, business_partner)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this relation type is currently active',
    object_type_id INT COMMENT 'Primary object type this relation applies to (NULL = applies to all types)',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id)
);

-- ----------------------------------------------------------------------------
-- Sexes: Gender/sex options for persons
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sexes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Sex/gender code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this option is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Salutations: Title prefixes (Mr, Mrs, Dr, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salutations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Salutation code (e.g., mr, mrs, dr)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this salutation is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Product Categories: Categories for product classification
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Product category code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this category is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Countries: Country codes (ISO 3-character codes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS countries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL COMMENT 'ISO 3-character country code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this country is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Address Types: Types of addresses (home, work, permanent, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS address_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Address type code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this address type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Address Area Types: Street/area type classifications (street, avenue, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS address_area_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Area type code (e.g., street, avenue, boulevard)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this area type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Contact Types: Types of contact methods (phone, email, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Contact type code (e.g., phone, email, whatsapp)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this contact type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Transaction Types: Types of financial transactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Transaction type code (e.g., SALE, PURCHASE, INVOICE)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this transaction type is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ----------------------------------------------------------------------------
-- Currencies: Currency codes (ISO 3-character codes)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL COMMENT 'ISO 3-character currency code (e.g., USD, EUR, HUF)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this currency is currently active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT
);

-- ============================================================================
-- SECTION 4: DEPENDENT LOOKUP TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Audit Actions: Action codes for audit logging, scoped to object types
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_actions (
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
CREATE TABLE IF NOT EXISTS identification_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Identification type code (e.g., passport, id_card)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this identification type is currently active',
    object_type_id INT NOT NULL COMMENT 'Object type this identification applies to',
    FOREIGN KEY (object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_object_type_id (object_type_id)
);

-- ============================================================================
-- SECTION 5: CORE ENTITY TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Objects: Base table for all business entities (polymorphic pattern)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS objects (
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
CREATE TABLE IF NOT EXISTS persons (
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
CREATE TABLE IF NOT EXISTS companies (
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
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    username VARCHAR(255) COMMENT 'Username for login (should be unique)',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    INDEX idx_username (username)
);

-- ----------------------------------------------------------------------------
-- User Passwords: Password storage with history support
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_passwords (
    user_id BIGINT PRIMARY KEY COMMENT 'References users.id',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password (bcrypt, argon2, etc.)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this password is currently active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When password was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When password was last updated',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- User Tokens: JWT token storage and management
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique token record ID',
    user_id BIGINT NOT NULL COMMENT 'References users.id',
    token_hash VARCHAR(255) NOT NULL COMMENT 'Hashed token (for blacklisting/revocation)',
    token_type VARCHAR(50) NOT NULL DEFAULT 'access' COMMENT 'Token type: access, refresh, api_key',
    device_info VARCHAR(255) COMMENT 'Device/browser information (optional)',
    ip_address VARCHAR(45) COMMENT 'IP address where token was issued (IPv4 or IPv6)',
    user_agent TEXT COMMENT 'User agent string from request',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this token is active (not revoked)',
    expires_at TIMESTAMP NOT NULL COMMENT 'Token expiration timestamp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When token was created/issued',
    last_used_at TIMESTAMP NULL COMMENT 'Last time token was used (for activity tracking)',
    revoked_at TIMESTAMP NULL COMMENT 'When token was revoked (if applicable)',
    revoked_reason VARCHAR(255) COMMENT 'Reason for revocation (logout, security, etc.)',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Stores JWT tokens for authentication and session management';

-- ----------------------------------------------------------------------------
-- Token Blacklist: Simple blacklist for revoked tokens (alternative approach)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS token_blacklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique blacklist record ID',
    token_hash VARCHAR(255) NOT NULL UNIQUE COMMENT 'Hashed token to blacklist',
    user_id BIGINT COMMENT 'User ID for faster cleanup (optional)',
    expires_at TIMESTAMP NOT NULL COMMENT 'When token expires (for cleanup)',
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When token was blacklisted',
    reason VARCHAR(255) COMMENT 'Reason for blacklisting (logout, security, etc.)',
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Blacklist for revoked/expired tokens';

-- ----------------------------------------------------------------------------
-- Documents: Document entities with versioning support
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
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
CREATE TABLE IF NOT EXISTS document_versions (
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
CREATE TABLE IF NOT EXISTS files (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    file_name VARCHAR(255) NOT NULL COMMENT 'File name',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    INDEX idx_file_name (file_name)
);

-- ----------------------------------------------------------------------------
-- File Versions: Version history for files
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS file_versions (
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
CREATE TABLE IF NOT EXISTS products (
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
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT PRIMARY KEY COMMENT 'References objects.id (shared primary key)',
    person_id BIGINT NOT NULL COMMENT 'References persons.id',
    FOREIGN KEY (id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
    INDEX idx_person_id (person_id)
);

-- ============================================================================
-- SECTION 6: RELATIONSHIP TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Object Addresses: Addresses associated with objects
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS object_addresses (
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
CREATE TABLE IF NOT EXISTS object_contacts (
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
CREATE TABLE IF NOT EXISTS object_identifications (
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
CREATE TABLE IF NOT EXISTS object_relations (
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
-- SECTION 7: FINANCIAL TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Transactions: Financial transaction records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE TABLE IF NOT EXISTS invoices (
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

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- PART 2: SEED DATA
-- ============================================================================
-- ============================================================================
-- SECTION 1: LANGUAGES
-- ============================================================================

-- Insert language codes (ISO language codes)
INSERT INTO languages (code, is_active) VALUES 
('en', TRUE),  -- English
('de', TRUE),  -- German
('hu', TRUE),  -- Hungarian
('fr', TRUE),  -- French
('es', TRUE),  -- Spanish
('it', TRUE),  -- Italian
('pt', TRUE),  -- Portuguese
('ru', TRUE),  -- Russian
('ja', TRUE),  -- Japanese
('ko', TRUE),  -- Korean
('zh', TRUE),  -- Chinese
('ar', TRUE),  -- Arabic
('tr', TRUE),  -- Turkish
('pl', TRUE),  -- Polish
('nl', TRUE),  -- Dutch
('sv', TRUE),  -- Swedish
('da', TRUE),  -- Danish
('no', TRUE),  -- Norwegian
('fi', TRUE),  -- Finnish
('el', TRUE);  -- Greek

-- Insert translations for language names (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('en', (SELECT id FROM languages WHERE code = 'en'), 'English'),
('de', (SELECT id FROM languages WHERE code = 'en'), 'German'),
('hu', (SELECT id FROM languages WHERE code = 'en'), 'Hungarian'),
('fr', (SELECT id FROM languages WHERE code = 'en'), 'French'),
('es', (SELECT id FROM languages WHERE code = 'en'), 'Spanish'),
('it', (SELECT id FROM languages WHERE code = 'en'), 'Italian'),
('pt', (SELECT id FROM languages WHERE code = 'en'), 'Portuguese'),
('ru', (SELECT id FROM languages WHERE code = 'en'), 'Russian'),
('ja', (SELECT id FROM languages WHERE code = 'en'), 'Japanese'),
('ko', (SELECT id FROM languages WHERE code = 'en'), 'Korean'),
('zh', (SELECT id FROM languages WHERE code = 'en'), 'Chinese'),
('ar', (SELECT id FROM languages WHERE code = 'en'), 'Arabic'),
('tr', (SELECT id FROM languages WHERE code = 'en'), 'Turkish'),
('pl', (SELECT id FROM languages WHERE code = 'en'), 'Polish'),
('nl', (SELECT id FROM languages WHERE code = 'en'), 'Dutch'),
('sv', (SELECT id FROM languages WHERE code = 'en'), 'Swedish'),
('da', (SELECT id FROM languages WHERE code = 'en'), 'Danish'),
('no', (SELECT id FROM languages WHERE code = 'en'), 'Norwegian'),
('fi', (SELECT id FROM languages WHERE code = 'en'), 'Finnish'),
('el', (SELECT id FROM languages WHERE code = 'en'), 'Greek'),

-- German translations
('en', (SELECT id FROM languages WHERE code = 'de'), 'Englisch'),
('de', (SELECT id FROM languages WHERE code = 'de'), 'Deutsch'),
('hu', (SELECT id FROM languages WHERE code = 'de'), 'Ungarisch'),
('fr', (SELECT id FROM languages WHERE code = 'de'), 'Französisch'),
('es', (SELECT id FROM languages WHERE code = 'de'), 'Spanisch'),
('it', (SELECT id FROM languages WHERE code = 'de'), 'Italienisch'),
('pt', (SELECT id FROM languages WHERE code = 'de'), 'Portugiesisch'),
('ru', (SELECT id FROM languages WHERE code = 'de'), 'Russisch'),
('ja', (SELECT id FROM languages WHERE code = 'de'), 'Japanisch'),
('ko', (SELECT id FROM languages WHERE code = 'de'), 'Koreanisch'),
('zh', (SELECT id FROM languages WHERE code = 'de'), 'Chinesisch'),
('ar', (SELECT id FROM languages WHERE code = 'de'), 'Arabisch'),
('tr', (SELECT id FROM languages WHERE code = 'de'), 'Türkisch'),
('pl', (SELECT id FROM languages WHERE code = 'de'), 'Polnisch'),
('nl', (SELECT id FROM languages WHERE code = 'de'), 'Niederländisch'),
('sv', (SELECT id FROM languages WHERE code = 'de'), 'Schwedisch'),
('da', (SELECT id FROM languages WHERE code = 'de'), 'Dänisch'),
('no', (SELECT id FROM languages WHERE code = 'de'), 'Norwegisch'),
('fi', (SELECT id FROM languages WHERE code = 'de'), 'Finnisch'),
('el', (SELECT id FROM languages WHERE code = 'de'), 'Griechisch'),

-- Hungarian translations
('en', (SELECT id FROM languages WHERE code = 'hu'), 'Angol'),
('de', (SELECT id FROM languages WHERE code = 'hu'), 'Német'),
('hu', (SELECT id FROM languages WHERE code = 'hu'), 'Magyar'),
('fr', (SELECT id FROM languages WHERE code = 'hu'), 'Francia'),
('es', (SELECT id FROM languages WHERE code = 'hu'), 'Spanyol'),
('it', (SELECT id FROM languages WHERE code = 'hu'), 'Olasz'),
('pt', (SELECT id FROM languages WHERE code = 'hu'), 'Portugál'),
('ru', (SELECT id FROM languages WHERE code = 'hu'), 'Orosz'),
('ja', (SELECT id FROM languages WHERE code = 'hu'), 'Japán'),
('ko', (SELECT id FROM languages WHERE code = 'hu'), 'Koreai'),
('zh', (SELECT id FROM languages WHERE code = 'hu'), 'Kínai'),
('ar', (SELECT id FROM languages WHERE code = 'hu'), 'Arab'),
('tr', (SELECT id FROM languages WHERE code = 'hu'), 'Török'),
('pl', (SELECT id FROM languages WHERE code = 'hu'), 'Lengyel'),
('nl', (SELECT id FROM languages WHERE code = 'hu'), 'Holland'),
('sv', (SELECT id FROM languages WHERE code = 'hu'), 'Svéd'),
('da', (SELECT id FROM languages WHERE code = 'hu'), 'Dán'),
('no', (SELECT id FROM languages WHERE code = 'hu'), 'Norvég'),
('fi', (SELECT id FROM languages WHERE code = 'hu'), 'Finn'),
('el', (SELECT id FROM languages WHERE code = 'hu'), 'Görög');

-- ============================================================================
-- SECTION 2: OBJECT TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before object_types
-- because object_types.code has a foreign key to translations(code)
-- Then object_types must be inserted BEFORE object_statuses
-- (object_statuses references object_types)

-- Insert translations for object_types FIRST (before inserting object_types)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('person', (SELECT id FROM languages WHERE code = 'en'), 'Person'),
('company', (SELECT id FROM languages WHERE code = 'en'), 'Company'),
('user', (SELECT id FROM languages WHERE code = 'en'), 'User'),
('document', (SELECT id FROM languages WHERE code = 'en'), 'Document'),
('file', (SELECT id FROM languages WHERE code = 'en'), 'File'),
('employee', (SELECT id FROM languages WHERE code = 'en'), 'Employee'),

-- German translations
('person', (SELECT id FROM languages WHERE code = 'de'), 'Person'),
('company', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen'),
('user', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer'),
('document', (SELECT id FROM languages WHERE code = 'de'), 'Dokument'),
('file', (SELECT id FROM languages WHERE code = 'de'), 'Datei'),
('employee', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter'),

-- Hungarian translations
('person', (SELECT id FROM languages WHERE code = 'hu'), 'Személy'),
('company', (SELECT id FROM languages WHERE code = 'hu'), 'Cég'),
('user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó'),
('document', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum'),
('file', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl'),
('employee', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó');

-- Now insert object_types (translations already exist)
INSERT INTO object_types (code, is_active) VALUES 
('person', TRUE),
('company', TRUE),
('user', TRUE),
('document', TRUE),
('file', TRUE),
('employee', TRUE);

-- ============================================================================
-- SECTION 3: OBJECT STATUSES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before object_statuses
-- because object_statuses.code has a foreign key to translations(code)
-- These statuses are required for the objects table
-- Statuses are now scoped to object types (each status belongs to a specific object type)

-- Insert translations for object_statuses FIRST (before inserting object_statuses)
INSERT INTO translations (code, language_id, text) VALUES
-- Person status translations
('person_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('person_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('person_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('person_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('person_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('person_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('person_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('person_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('person_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('person_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('person_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('person_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('person_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('person_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('person_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Company status translations
('company_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('company_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('company_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('company_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('company_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('company_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('company_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('company_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('company_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('company_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('company_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('company_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('company_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('company_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('company_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('company_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('company_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('company_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- User status translations
('user_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('user_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('user_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('user_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('user_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('user_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('user_locked', (SELECT id FROM languages WHERE code = 'en'), 'Locked'),
('user_locked', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('user_locked', (SELECT id FROM languages WHERE code = 'hu'), 'Zárolva'),
('user_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('user_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('user_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('user_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('user_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('user_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('user_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('user_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('user_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Document status translations
('document_draft', (SELECT id FROM languages WHERE code = 'en'), 'Draft'),
('document_draft', (SELECT id FROM languages WHERE code = 'de'), 'Entwurf'),
('document_draft', (SELECT id FROM languages WHERE code = 'hu'), 'Piszklap'),
('document_published', (SELECT id FROM languages WHERE code = 'en'), 'Published'),
('document_published', (SELECT id FROM languages WHERE code = 'de'), 'Veröffentlicht'),
('document_published', (SELECT id FROM languages WHERE code = 'hu'), 'Közzétéve'),
('document_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('document_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('document_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('document_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('document_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('document_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'en'), 'Pending Review'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehende Überprüfung'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'hu'), 'Áttekintésre vár'),

-- File status translations
('file_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('file_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('file_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('file_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('file_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('file_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('file_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('file_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('file_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('file_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('file_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('file_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Employee status translations
('employee_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('employee_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('employee_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'en'), 'On Leave'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'de'), 'Im Urlaub'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'hu'), 'Szabadságon'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'en'), 'Terminated'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'de'), 'Gekündigt'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'hu'), 'Felmondva'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('employee_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('employee_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('employee_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben');

-- Now insert object_statuses (translations already exist)
INSERT INTO object_statuses (code, is_active, object_type_id) VALUES 
-- Person statuses
('person_active', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_archived', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_pending', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

-- Company statuses
('company_active', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_archived', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_pending', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

-- User statuses
('user_active', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_locked', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_pending', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

-- Document statuses
('document_draft', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_published', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_archived', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_pending_review', TRUE, (SELECT id FROM object_types WHERE code = 'document')),

-- File statuses
('file_active', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_archived', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_pending', TRUE, (SELECT id FROM object_types WHERE code = 'file')),

-- Employee statuses
('employee_active', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_on_leave', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_terminated', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_pending', TRUE, (SELECT id FROM object_types WHERE code = 'employee'));

-- ============================================================================
-- SECTION 4: SEXES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before sexes
-- because sexes.code has a foreign key to translations(code)

-- Insert translations for sexes FIRST (before inserting sexes)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('male', (SELECT id FROM languages WHERE code = 'en'), 'Male'),
('female', (SELECT id FROM languages WHERE code = 'en'), 'Female'),
('non-binary', (SELECT id FROM languages WHERE code = 'en'), 'Non-binary'),
('other', (SELECT id FROM languages WHERE code = 'en'), 'Other'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'en'), 'Prefer not to say'),
('transgender-male', (SELECT id FROM languages WHERE code = 'en'), 'Transgender Male'),
('transgender-female', (SELECT id FROM languages WHERE code = 'en'), 'Transgender Female'),
('agender', (SELECT id FROM languages WHERE code = 'en'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'en'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'en'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'en'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'en'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'en'), 'Non-conforming'),
('queer', (SELECT id FROM languages WHERE code = 'en'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'en'), 'Questioning'),
('fluid', (SELECT id FROM languages WHERE code = 'en'), 'Fluid'),
('undisclosed', (SELECT id FROM languages WHERE code = 'en'), 'Undisclosed'),

-- German translations
('male', (SELECT id FROM languages WHERE code = 'de'), 'Männlich'),
('female', (SELECT id FROM languages WHERE code = 'de'), 'Weiblich'),
('non-binary', (SELECT id FROM languages WHERE code = 'de'), 'Nicht-binär'),
('other', (SELECT id FROM languages WHERE code = 'de'), 'Andere'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'de'), 'Bevorzuge nicht zu sagen'),
('transgender-male', (SELECT id FROM languages WHERE code = 'de'), 'Transgender-Männlich'),
('transgender-female', (SELECT id FROM languages WHERE code = 'de'), 'Transgender-Weiblich'),
('agender', (SELECT id FROM languages WHERE code = 'de'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'de'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'de'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'de'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'de'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'de'), 'Nicht-konform'),
('queer', (SELECT id FROM languages WHERE code = 'de'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'de'), 'Fragend'),
('fluid', (SELECT id FROM languages WHERE code = 'de'), 'Fließend'),
('undisclosed', (SELECT id FROM languages WHERE code = 'de'), 'Nicht offengelegt'),

-- Hungarian translations
('male', (SELECT id FROM languages WHERE code = 'hu'), 'Férfi'),
('female', (SELECT id FROM languages WHERE code = 'hu'), 'Nő'),
('non-binary', (SELECT id FROM languages WHERE code = 'hu'), 'Nem bináris'),
('other', (SELECT id FROM languages WHERE code = 'hu'), 'Egyéb'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'hu'), 'Nem szeretném megmondani'),
('transgender-male', (SELECT id FROM languages WHERE code = 'hu'), 'Transznemű férfi'),
('transgender-female', (SELECT id FROM languages WHERE code = 'hu'), 'Transznemű nő'),
('agender', (SELECT id FROM languages WHERE code = 'hu'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'hu'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'hu'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'hu'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'hu'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'hu'), 'Nem megfelelő'),
('queer', (SELECT id FROM languages WHERE code = 'hu'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'hu'), 'Kérdő'),
('fluid', (SELECT id FROM languages WHERE code = 'hu'), 'Folyamatos'),
('undisclosed', (SELECT id FROM languages WHERE code = 'hu'), 'Meghatározatlan');

-- Now insert sexes (translations already exist)
INSERT INTO sexes (code, is_active) VALUES 
('male', TRUE),
('female', TRUE),
('non-binary', TRUE),
('other', TRUE),
('prefer-not-to-say', TRUE),
('transgender-male', TRUE),
('transgender-female', TRUE),
('agender', TRUE),
('bigender', TRUE),
('genderfluid', TRUE),
('pangender', TRUE),
('two-spirit', TRUE),
('non-conforming', TRUE),
('queer', TRUE),
('questioning', TRUE),
('fluid', TRUE),
('undisclosed', TRUE);

-- ============================================================================
-- SECTION 5: SALUTATIONS
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before salutations
-- because salutations.code has a foreign key to translations(code)

-- Insert translations for salutations FIRST (before inserting salutations)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('mr', (SELECT id FROM languages WHERE code = 'en'), 'Mr'),
('mrs', (SELECT id FROM languages WHERE code = 'en'), 'Mrs'),
('ms', (SELECT id FROM languages WHERE code = 'en'), 'Ms'),
('miss', (SELECT id FROM languages WHERE code = 'en'), 'Miss'),
('dr', (SELECT id FROM languages WHERE code = 'en'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'en'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'en'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'en'), 'Hon'),
('Sir', (SELECT id FROM languages WHERE code = 'en'), 'Sir'),
('Lady', (SELECT id FROM languages WHERE code = 'en'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'en'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'en'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'en'), 'Master'),
('Mistress', (SELECT id FROM languages WHERE code = 'en'), 'Mistress'),
('Captain', (SELECT id FROM languages WHERE code = 'en'), 'Captain'),
('Colonel', (SELECT id FROM languages WHERE code = 'en'), 'Colonel'),
('General', (SELECT id FROM languages WHERE code = 'en'), 'General'),
('Admiral', (SELECT id FROM languages WHERE code = 'en'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'en'), 'Senator'),
('Governor', (SELECT id FROM languages WHERE code = 'en'), 'Governor'),
('senior', (SELECT id FROM languages WHERE code = 'en'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'en'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'en'), 'Widow'),

-- German translations
('mr', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('mrs', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('ms', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('miss', (SELECT id FROM languages WHERE code = 'de'), 'Fräulein'),
('dr', (SELECT id FROM languages WHERE code = 'de'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'de'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'de'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'de'), 'Ehrwürdig'),
('Sir', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('Lady', (SELECT id FROM languages WHERE code = 'de'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'de'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'de'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('Mistress', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('Captain', (SELECT id FROM languages WHERE code = 'de'), 'Kapitän'),
('Colonel', (SELECT id FROM languages WHERE code = 'de'), 'Colonel'),
('General', (SELECT id FROM languages WHERE code = 'de'), 'General'),
('Admiral', (SELECT id FROM languages WHERE code = 'de'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'de'), 'Senator'),
('Governor', (SELECT id FROM languages WHERE code = 'de'), 'Gouverneur'),
('senior', (SELECT id FROM languages WHERE code = 'de'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'de'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'de'), 'Witwe'),

-- Hungarian translations
('mr', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('mrs', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('ms', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('miss', (SELECT id FROM languages WHERE code = 'hu'), 'Kisasszony'),
('dr', (SELECT id FROM languages WHERE code = 'hu'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'hu'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'hu'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'hu'), 'Tiszteletteljes'),
('Sir', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('Lady', (SELECT id FROM languages WHERE code = 'hu'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'hu'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'hu'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('Mistress', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('Captain', (SELECT id FROM languages WHERE code = 'hu'), 'Kapitány'),
('Colonel', (SELECT id FROM languages WHERE code = 'hu'), 'Kolonel'),
('General', (SELECT id FROM languages WHERE code = 'hu'), 'Generál'),
('Admiral', (SELECT id FROM languages WHERE code = 'hu'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'hu'), 'Senátor'),
('Governor', (SELECT id FROM languages WHERE code = 'hu'), 'Gubernátor'),
('senior', (SELECT id FROM languages WHERE code = 'hu'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'hu'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'hu'), 'Veledő');

-- Now insert salutations (translations already exist)
INSERT INTO salutations (code, is_active) VALUES 
('mr', TRUE),
('mrs', TRUE),
('ms', TRUE),
('miss', TRUE),
('dr', TRUE),
('prof', TRUE),
('rev', TRUE),
('hon', TRUE),
('Sir', TRUE),
('Lady', TRUE),
('Lord', TRUE),
('Dame', TRUE),
('Master', TRUE),
('Mistress', TRUE),
('Captain', TRUE),
('Colonel', TRUE),
('General', TRUE),
('Admiral', TRUE),
('Senator', TRUE),
('Governor', TRUE),
('senior', TRUE),
('junior', TRUE),
('özvegy', TRUE);

-- ============================================================================
-- SECTION 6: PRODUCT CATEGORIES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before product_categories
-- because product_categories.code has a foreign key to translations(code)
-- These categories are required for the products table

-- Insert translations for product_categories FIRST (before inserting product_categories)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('electronics', (SELECT id FROM languages WHERE code = 'en'), 'Electronics'),
('clothing', (SELECT id FROM languages WHERE code = 'en'), 'Clothing'),
('food', (SELECT id FROM languages WHERE code = 'en'), 'Food'),
('books', (SELECT id FROM languages WHERE code = 'en'), 'Books'),
('furniture', (SELECT id FROM languages WHERE code = 'en'), 'Furniture'),
('toys', (SELECT id FROM languages WHERE code = 'en'), 'Toys'),
('sports', (SELECT id FROM languages WHERE code = 'en'), 'Sports'),
('beauty', (SELECT id FROM languages WHERE code = 'en'), 'Beauty'),
('automotive', (SELECT id FROM languages WHERE code = 'en'), 'Automotive'),
('home_garden', (SELECT id FROM languages WHERE code = 'en'), 'Home & Garden'),

-- German translations
('electronics', (SELECT id FROM languages WHERE code = 'de'), 'Elektronik'),
('clothing', (SELECT id FROM languages WHERE code = 'de'), 'Kleidung'),
('food', (SELECT id FROM languages WHERE code = 'de'), 'Lebensmittel'),
('books', (SELECT id FROM languages WHERE code = 'de'), 'Bücher'),
('furniture', (SELECT id FROM languages WHERE code = 'de'), 'Möbel'),
('toys', (SELECT id FROM languages WHERE code = 'de'), 'Spielzeug'),
('sports', (SELECT id FROM languages WHERE code = 'de'), 'Sport'),
('beauty', (SELECT id FROM languages WHERE code = 'de'), 'Schönheit'),
('automotive', (SELECT id FROM languages WHERE code = 'de'), 'Automobil'),
('home_garden', (SELECT id FROM languages WHERE code = 'de'), 'Haus & Garten'),

-- Hungarian translations
('electronics', (SELECT id FROM languages WHERE code = 'hu'), 'Elektronika'),
('clothing', (SELECT id FROM languages WHERE code = 'hu'), 'Ruházat'),
('food', (SELECT id FROM languages WHERE code = 'hu'), 'Élelmiszer'),
('books', (SELECT id FROM languages WHERE code = 'hu'), 'Könyvek'),
('furniture', (SELECT id FROM languages WHERE code = 'hu'), 'Bútor'),
('toys', (SELECT id FROM languages WHERE code = 'hu'), 'Játékok'),
('sports', (SELECT id FROM languages WHERE code = 'hu'), 'Sport'),
('beauty', (SELECT id FROM languages WHERE code = 'hu'), 'Szépség'),
('automotive', (SELECT id FROM languages WHERE code = 'hu'), 'Autóipar'),
('home_garden', (SELECT id FROM languages WHERE code = 'hu'), 'Otthon és kert');

-- Now insert product_categories (translations already exist)
INSERT INTO product_categories (code, is_active) VALUES 
('electronics', TRUE),
('clothing', TRUE),
('food', TRUE),
('books', TRUE),
('furniture', TRUE),
('toys', TRUE),
('sports', TRUE),
('beauty', TRUE),
('automotive', TRUE),
('home_garden', TRUE);

-- ============================================================================
-- SECTION 7: ADDRESS AREA TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before address_area_types
-- because address_area_types.code has a foreign key to translations(code)

-- Insert translations for address_area_types FIRST (before inserting address_area_types)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('street', (SELECT id FROM languages WHERE code = 'en'), 'Street'),
('avenue', (SELECT id FROM languages WHERE code = 'en'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'en'), 'Road'),
('lane', (SELECT id FROM languages WHERE code = 'en'), 'Lane'),
('court', (SELECT id FROM languages WHERE code = 'en'), 'Court'),
('place', (SELECT id FROM languages WHERE code = 'en'), 'Place'),
('square', (SELECT id FROM languages WHERE code = 'en'), 'Square'),
('boulevard', (SELECT id FROM languages WHERE code = 'en'), 'Boulevard'),
('drive', (SELECT id FROM languages WHERE code = 'en'), 'Drive'),
('circle', (SELECT id FROM languages WHERE code = 'en'), 'Circle'),
('way', (SELECT id FROM languages WHERE code = 'en'), 'Way'),
('trail', (SELECT id FROM languages WHERE code = 'en'), 'Trail'),
('parkway', (SELECT id FROM languages WHERE code = 'en'), 'Parkway'),
('highway', (SELECT id FROM languages WHERE code = 'en'), 'Highway'),
('expressway', (SELECT id FROM languages WHERE code = 'en'), 'Expressway'),
('alley', (SELECT id FROM languages WHERE code = 'en'), 'Alley'),
('crescent', (SELECT id FROM languages WHERE code = 'en'), 'Crescent'),
('loop', (SELECT id FROM languages WHERE code = 'en'), 'Loop'),
('terrace', (SELECT id FROM languages WHERE code = 'en'), 'Terrace'),
('row', (SELECT id FROM languages WHERE code = 'en'), 'Row'),
('block', (SELECT id FROM languages WHERE code = 'en'), 'Block'),
('quarter', (SELECT id FROM languages WHERE code = 'en'), 'Quarter'),
('district', (SELECT id FROM languages WHERE code = 'en'), 'District'),
('neighborhood', (SELECT id FROM languages WHERE code = 'en'), 'Neighborhood'),
('zone', (SELECT id FROM languages WHERE code = 'en'), 'Zone'),
('area', (SELECT id FROM languages WHERE code = 'en'), 'Area'),
('region', (SELECT id FROM languages WHERE code = 'en'), 'Region'),
('county', (SELECT id FROM languages WHERE code = 'en'), 'County'),
('state', (SELECT id FROM languages WHERE code = 'en'), 'State'),
('province', (SELECT id FROM languages WHERE code = 'en'), 'Province'),
('territory', (SELECT id FROM languages WHERE code = 'en'), 'Territory'),
('country', (SELECT id FROM languages WHERE code = 'en'), 'Country'),

-- German translations
('street', (SELECT id FROM languages WHERE code = 'de'), 'Straße'),
('avenue', (SELECT id FROM languages WHERE code = 'de'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'de'), 'Straße'),
('lane', (SELECT id FROM languages WHERE code = 'de'), 'Gasse'),
('court', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('place', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('square', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('boulevard', (SELECT id FROM languages WHERE code = 'de'), 'Boulevard'),
('drive', (SELECT id FROM languages WHERE code = 'de'), 'Drive'),
('circle', (SELECT id FROM languages WHERE code = 'de'), 'Kreis'),
('way', (SELECT id FROM languages WHERE code = 'de'), 'Weg'),
('trail', (SELECT id FROM languages WHERE code = 'de'), 'Pfad'),
('parkway', (SELECT id FROM languages WHERE code = 'de'), 'Parkway'),
('highway', (SELECT id FROM languages WHERE code = 'de'), 'Autobahn'),
('expressway', (SELECT id FROM languages WHERE code = 'de'), 'Schnellstraße'),
('alley', (SELECT id FROM languages WHERE code = 'de'), 'Gasse'),
('crescent', (SELECT id FROM languages WHERE code = 'de'), 'Kreuzung'),
('loop', (SELECT id FROM languages WHERE code = 'de'), 'Schleife'),
('terrace', (SELECT id FROM languages WHERE code = 'de'), 'Terrasse'),
('row', (SELECT id FROM languages WHERE code = 'de'), 'Reihe'),
('block', (SELECT id FROM languages WHERE code = 'de'), 'Block'),
('quarter', (SELECT id FROM languages WHERE code = 'de'), 'Viertel'),
('district', (SELECT id FROM languages WHERE code = 'de'), 'Bezirk'),
('neighborhood', (SELECT id FROM languages WHERE code = 'de'), 'Nachbarschaft'),
('zone', (SELECT id FROM languages WHERE code = 'de'), 'Zone'),
('area', (SELECT id FROM languages WHERE code = 'de'), 'Gebiet'),
('region', (SELECT id FROM languages WHERE code = 'de'), 'Region'),
('county', (SELECT id FROM languages WHERE code = 'de'), 'Kreis'),
('state', (SELECT id FROM languages WHERE code = 'de'), 'Bundesland'),
('province', (SELECT id FROM languages WHERE code = 'de'), 'Provinz'),
('territory', (SELECT id FROM languages WHERE code = 'de'), 'Gebiet'),
('country', (SELECT id FROM languages WHERE code = 'de'), 'Land'),

-- Hungarian translations
('street', (SELECT id FROM languages WHERE code = 'hu'), 'Utca'),
('avenue', (SELECT id FROM languages WHERE code = 'hu'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'hu'), 'Út'),
('lane', (SELECT id FROM languages WHERE code = 'hu'), 'Kis utca'),
('court', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('place', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('square', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('boulevard', (SELECT id FROM languages WHERE code = 'hu'), 'Bulvar'),
('drive', (SELECT id FROM languages WHERE code = 'hu'), 'Főút'),
('circle', (SELECT id FROM languages WHERE code = 'hu'), 'Körút'),
('way', (SELECT id FROM languages WHERE code = 'hu'), 'Út'),
('trail', (SELECT id FROM languages WHERE code = 'hu'), 'Sétaút'),
('parkway', (SELECT id FROM languages WHERE code = 'hu'), 'Park út'),
('highway', (SELECT id FROM languages WHERE code = 'hu'), 'Autópálya'),
('expressway', (SELECT id FROM languages WHERE code = 'hu'), 'Közföldi út'),
('alley', (SELECT id FROM languages WHERE code = 'hu'), 'Kis utca'),
('crescent', (SELECT id FROM languages WHERE code = 'hu'), 'Félgörbe'),
('loop', (SELECT id FROM languages WHERE code = 'hu'), 'Körút'),
('terrace', (SELECT id FROM languages WHERE code = 'hu'), 'Terrács'),
('row', (SELECT id FROM languages WHERE code = 'hu'), 'Sor'),
('block', (SELECT id FROM languages WHERE code = 'hu'), 'Blokk'),
('quarter', (SELECT id FROM languages WHERE code = 'hu'), 'Negyed'),
('district', (SELECT id FROM languages WHERE code = 'hu'), 'Kistérség'),
('neighborhood', (SELECT id FROM languages WHERE code = 'hu'), 'Környék'),
('zone', (SELECT id FROM languages WHERE code = 'hu'), 'Zóna'),
('area', (SELECT id FROM languages WHERE code = 'hu'), 'Terület'),
('region', (SELECT id FROM languages WHERE code = 'hu'), 'Régió'),
('county', (SELECT id FROM languages WHERE code = 'hu'), 'Megye'),
('state', (SELECT id FROM languages WHERE code = 'hu'), 'Állam'),
('province', (SELECT id FROM languages WHERE code = 'hu'), 'Tartomány'),
('territory', (SELECT id FROM languages WHERE code = 'hu'), 'Terület'),
('country', (SELECT id FROM languages WHERE code = 'hu'), 'Ország');

-- Now insert address_area_types (translations already exist)
INSERT INTO address_area_types (code, is_active) VALUES 
('street', TRUE),
('avenue', TRUE),
('road', TRUE),
('lane', TRUE),
('court', TRUE),
('place', TRUE),
('square', TRUE),
('boulevard', TRUE),
('drive', TRUE),
('circle', TRUE),
('way', TRUE),
('trail', TRUE),
('parkway', TRUE),
('highway', TRUE),
('expressway', TRUE),
('alley', TRUE),
('crescent', TRUE),
('loop', TRUE),
('terrace', TRUE),
('row', TRUE),
('block', TRUE),
('quarter', TRUE),
('district', TRUE),
('neighborhood', TRUE),
('zone', TRUE),
('area', TRUE),
('region', TRUE),
('county', TRUE),
('state', TRUE),
('province', TRUE),
('territory', TRUE),
('country', TRUE);

-- ============================================================================
-- SECTION 8: ADDRESS TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before address_types
-- because address_types.code has a foreign key to translations(code)

-- Insert translations for address_types FIRST (before inserting address_types)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('temporary', (SELECT id FROM languages WHERE code = 'en'), 'Temporary'),
('mailing', (SELECT id FROM languages WHERE code = 'en'), 'Mailing'),
('permanent', (SELECT id FROM languages WHERE code = 'en'), 'Permanent'),
('home', (SELECT id FROM languages WHERE code = 'en'), 'Home'),
('work', (SELECT id FROM languages WHERE code = 'en'), 'Work'),
('business', (SELECT id FROM languages WHERE code = 'en'), 'Business'),
('residential', (SELECT id FROM languages WHERE code = 'en'), 'Residential'),
('commercial', (SELECT id FROM languages WHERE code = 'en'), 'Commercial'),
('office', (SELECT id FROM languages WHERE code = 'en'), 'Office'),
('warehouse', (SELECT id FROM languages WHERE code = 'en'), 'Warehouse'),
('factory', (SELECT id FROM languages WHERE code = 'en'), 'Factory'),
('retail', (SELECT id FROM languages WHERE code = 'en'), 'Retail'),
('hotel', (SELECT id FROM languages WHERE code = 'en'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'en'), 'Hospital'),
('school', (SELECT id FROM languages WHERE code = 'en'), 'School'),
('university', (SELECT id FROM languages WHERE code = 'en'), 'University'),
('library', (SELECT id FROM languages WHERE code = 'en'), 'Library'),
('church', (SELECT id FROM languages WHERE code = 'en'), 'Church'),
('bank', (SELECT id FROM languages WHERE code = 'en'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'en'), 'Post Office'),

-- German translations
('temporary', (SELECT id FROM languages WHERE code = 'de'), 'Temporär'),
('mailing', (SELECT id FROM languages WHERE code = 'de'), 'Post'),
('permanent', (SELECT id FROM languages WHERE code = 'de'), 'Dauerhaft'),
('home', (SELECT id FROM languages WHERE code = 'de'), 'Zuhause'),
('work', (SELECT id FROM languages WHERE code = 'de'), 'Arbeit'),
('business', (SELECT id FROM languages WHERE code = 'de'), 'Geschäft'),
('residential', (SELECT id FROM languages WHERE code = 'de'), 'Wohnung'),
('commercial', (SELECT id FROM languages WHERE code = 'de'), 'Gewerbe'),
('office', (SELECT id FROM languages WHERE code = 'de'), 'Büro'),
('warehouse', (SELECT id FROM languages WHERE code = 'de'), 'Lager'),
('factory', (SELECT id FROM languages WHERE code = 'de'), 'Fabrik'),
('retail', (SELECT id FROM languages WHERE code = 'de'), 'Einzelhandel'),
('hotel', (SELECT id FROM languages WHERE code = 'de'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'de'), 'Krankenhaus'),
('school', (SELECT id FROM languages WHERE code = 'de'), 'Schule'),
('university', (SELECT id FROM languages WHERE code = 'de'), 'Universität'),
('library', (SELECT id FROM languages WHERE code = 'de'), 'Bibliothek'),
('church', (SELECT id FROM languages WHERE code = 'de'), 'Kirche'),
('bank', (SELECT id FROM languages WHERE code = 'de'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'de'), 'Postamt'),

-- Hungarian translations
('temporary', (SELECT id FROM languages WHERE code = 'hu'), 'Átmeneti'),
('mailing', (SELECT id FROM languages WHERE code = 'hu'), 'Levélküldési'),
('permanent', (SELECT id FROM languages WHERE code = 'hu'), 'Állandó'),
('home', (SELECT id FROM languages WHERE code = 'hu'), 'Otthon'),
('work', (SELECT id FROM languages WHERE code = 'hu'), 'Munkahely'),
('business', (SELECT id FROM languages WHERE code = 'hu'), 'Üzlet'),
('residential', (SELECT id FROM languages WHERE code = 'hu'), 'Lakó'),
('commercial', (SELECT id FROM languages WHERE code = 'hu'), 'Kereskedelmi'),
('office', (SELECT id FROM languages WHERE code = 'hu'), 'Iroda'),
('warehouse', (SELECT id FROM languages WHERE code = 'hu'), 'Raktár'),
('factory', (SELECT id FROM languages WHERE code = 'hu'), 'Gyár'),
('retail', (SELECT id FROM languages WHERE code = 'hu'), 'Kiskereskedelmi'),
('hotel', (SELECT id FROM languages WHERE code = 'hu'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'hu'), 'Kórház'),
('school', (SELECT id FROM languages WHERE code = 'hu'), 'Iskola'),
('university', (SELECT id FROM languages WHERE code = 'hu'), 'Egyetem'),
('library', (SELECT id FROM languages WHERE code = 'hu'), 'Könyvtár'),
('church', (SELECT id FROM languages WHERE code = 'hu'), 'Egyház'),
('bank', (SELECT id FROM languages WHERE code = 'hu'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'hu'), 'Posta');

-- Now insert address_types (translations already exist)
INSERT INTO address_types (code, is_active) VALUES 
('temporary', TRUE),
('mailing', TRUE),
('permanent', TRUE),
('home', TRUE),
('work', TRUE),
('business', TRUE),
('residential', TRUE),
('commercial', TRUE),
('office', TRUE),
('warehouse', TRUE),
('factory', TRUE),
('retail', TRUE),
('hotel', TRUE),
('hospital', TRUE),
('school', TRUE),
('university', TRUE),
('library', TRUE),
('church', TRUE),
('bank', TRUE),
('post_office', TRUE);

-- ============================================================================
-- SECTION 9: CONTACT TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before contact_types
-- because contact_types.code has a foreign key to translations(code)

-- Insert translations for contact_types FIRST (before inserting contact_types)
INSERT INTO translations (code, language_id, text) VALUES
-- Phone translations
('phone', (SELECT id FROM languages WHERE code = 'en'), 'Phone'),
('phone', (SELECT id FROM languages WHERE code = 'de'), 'Telefon'),
('phone', (SELECT id FROM languages WHERE code = 'hu'), 'Telefon'),

-- Mobile translations
('mobile', (SELECT id FROM languages WHERE code = 'en'), 'Mobile'),
('mobile', (SELECT id FROM languages WHERE code = 'de'), 'Mobil'),
('mobile', (SELECT id FROM languages WHERE code = 'hu'), 'Mobiltelefon'),

-- Email translations
('email', (SELECT id FROM languages WHERE code = 'en'), 'Email'),
('email', (SELECT id FROM languages WHERE code = 'de'), 'E-Mail'),
('email', (SELECT id FROM languages WHERE code = 'hu'), 'E-mail'),

-- Fax translations
('fax', (SELECT id FROM languages WHERE code = 'en'), 'Fax'),
('fax', (SELECT id FROM languages WHERE code = 'de'), 'Fax'),
('fax', (SELECT id FROM languages WHERE code = 'hu'), 'Fax'),

-- Mail translations
('mail', (SELECT id FROM languages WHERE code = 'en'), 'Mail'),
('mail', (SELECT id FROM languages WHERE code = 'de'), 'Post'),
('mail', (SELECT id FROM languages WHERE code = 'hu'), 'Posta'),

-- Letter translations
('letter', (SELECT id FROM languages WHERE code = 'en'), 'Letter'),
('letter', (SELECT id FROM languages WHERE code = 'de'), 'Brief'),
('letter', (SELECT id FROM languages WHERE code = 'hu'), 'Levelet'),

-- Telegram translations
('telegram', (SELECT id FROM languages WHERE code = 'en'), 'Telegram'),
('telegram', (SELECT id FROM languages WHERE code = 'de'), 'Telegram'),
('telegram', (SELECT id FROM languages WHERE code = 'hu'), 'Telegram'),

-- WhatsApp translations
('whatsapp', (SELECT id FROM languages WHERE code = 'en'), 'WhatsApp'),
('whatsapp', (SELECT id FROM languages WHERE code = 'de'), 'WhatsApp'),
('whatsapp', (SELECT id FROM languages WHERE code = 'hu'), 'WhatsApp'),

-- Viber translations
('viber', (SELECT id FROM languages WHERE code = 'en'), 'Viber'),
('viber', (SELECT id FROM languages WHERE code = 'de'), 'Viber'),
('viber', (SELECT id FROM languages WHERE code = 'hu'), 'Viber'),

-- Skype translations
('skype', (SELECT id FROM languages WHERE code = 'en'), 'Skype'),
('skype', (SELECT id FROM languages WHERE code = 'de'), 'Skype'),
('skype', (SELECT id FROM languages WHERE code = 'hu'), 'Skype'),

-- LinkedIn translations
('linkedin', (SELECT id FROM languages WHERE code = 'en'), 'LinkedIn'),
('linkedin', (SELECT id FROM languages WHERE code = 'de'), 'LinkedIn'),
('linkedin', (SELECT id FROM languages WHERE code = 'hu'), 'LinkedIn'),

-- Twitter translations
('twitter', (SELECT id FROM languages WHERE code = 'en'), 'Twitter'),
('twitter', (SELECT id FROM languages WHERE code = 'de'), 'Twitter'),
('twitter', (SELECT id FROM languages WHERE code = 'hu'), 'Twitter'),

-- Facebook translations
('facebook', (SELECT id FROM languages WHERE code = 'en'), 'Facebook'),
('facebook', (SELECT id FROM languages WHERE code = 'de'), 'Facebook'),
('facebook', (SELECT id FROM languages WHERE code = 'hu'), 'Facebook'),

-- Instagram translations
('instagram', (SELECT id FROM languages WHERE code = 'en'), 'Instagram'),
('instagram', (SELECT id FROM languages WHERE code = 'de'), 'Instagram'),
('instagram', (SELECT id FROM languages WHERE code = 'hu'), 'Instagram'),

-- XING translations
('xing', (SELECT id FROM languages WHERE code = 'en'), 'XING'),
('xing', (SELECT id FROM languages WHERE code = 'de'), 'XING'),
('xing', (SELECT id FROM languages WHERE code = 'hu'), 'XING'),

-- YouTube translations
('youtube', (SELECT id FROM languages WHERE code = 'en'), 'YouTube'),
('youtube', (SELECT id FROM languages WHERE code = 'de'), 'YouTube'),
('youtube', (SELECT id FROM languages WHERE code = 'hu'), 'YouTube'),

-- Website translations
('website', (SELECT id FROM languages WHERE code = 'en'), 'Website'),
('website', (SELECT id FROM languages WHERE code = 'de'), 'Website'),
('website', (SELECT id FROM languages WHERE code = 'hu'), 'Weboldal'),

-- RSS translations
('rss', (SELECT id FROM languages WHERE code = 'en'), 'RSS'),
('rss', (SELECT id FROM languages WHERE code = 'de'), 'RSS'),
('rss', (SELECT id FROM languages WHERE code = 'hu'), 'RSS'),

-- Newsletter translations
('newsletter', (SELECT id FROM languages WHERE code = 'en'), 'Newsletter'),
('newsletter', (SELECT id FROM languages WHERE code = 'de'), 'Newsletter'),
('newsletter', (SELECT id FROM languages WHERE code = 'hu'), 'Hírlevél'),

-- Callback translations
('callback', (SELECT id FROM languages WHERE code = 'en'), 'Callback'),
('callback', (SELECT id FROM languages WHERE code = 'de'), 'Rückruf'),
('callback', (SELECT id FROM languages WHERE code = 'hu'), 'Visszahívás'),

-- Emergency translations
('emergency', (SELECT id FROM languages WHERE code = 'en'), 'Emergency'),
('emergency', (SELECT id FROM languages WHERE code = 'de'), 'Notruf'),
('emergency', (SELECT id FROM languages WHERE code = 'hu'), 'Sürgős'),

-- NOTE: 'office', 'home', 'work' translations already exist from address_types section

-- Direct translations
('direct', (SELECT id FROM languages WHERE code = 'en'), 'Direct'),
('direct', (SELECT id FROM languages WHERE code = 'de'), 'Direkt'),
('direct', (SELECT id FROM languages WHERE code = 'hu'), 'Direkt'),

-- Secretary translations
('secretary', (SELECT id FROM languages WHERE code = 'en'), 'Secretary'),
('secretary', (SELECT id FROM languages WHERE code = 'de'), 'Assistent'),
('secretary', (SELECT id FROM languages WHERE code = 'hu'), 'Titkár'),

-- Reception translations
('reception', (SELECT id FROM languages WHERE code = 'en'), 'Reception'),
('reception', (SELECT id FROM languages WHERE code = 'de'), 'Rezeption'),
('reception', (SELECT id FROM languages WHERE code = 'hu'), 'Fogadó'),

-- Assistant translations
('assistant', (SELECT id FROM languages WHERE code = 'en'), 'Assistant'),
('assistant', (SELECT id FROM languages WHERE code = 'de'), 'Assistent'),
('assistant', (SELECT id FROM languages WHERE code = 'hu'), 'Asszisztens'),

-- Technical translations
('technical', (SELECT id FROM languages WHERE code = 'en'), 'Technical'),
('technical', (SELECT id FROM languages WHERE code = 'de'), 'Technisch'),
('technical', (SELECT id FROM languages WHERE code = 'hu'), 'Technikai'),

-- Customer service translations
('customer_service', (SELECT id FROM languages WHERE code = 'en'), 'Customer Service'),
('customer_service', (SELECT id FROM languages WHERE code = 'de'), 'Kundendienst'),
('customer_service', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfélszolgálat'),

-- Sales translations
('sales', (SELECT id FROM languages WHERE code = 'en'), 'Sales'),
('sales', (SELECT id FROM languages WHERE code = 'de'), 'Vertrieb'),
('sales', (SELECT id FROM languages WHERE code = 'hu'), 'Eladás'),

-- Support translations
('support', (SELECT id FROM languages WHERE code = 'en'), 'Support'),
('support', (SELECT id FROM languages WHERE code = 'de'), 'Support'),
('support', (SELECT id FROM languages WHERE code = 'hu'), 'Támogatás'),

-- HR translations
('hr', (SELECT id FROM languages WHERE code = 'en'), 'HR'),
('hr', (SELECT id FROM languages WHERE code = 'de'), 'HR'),
('hr', (SELECT id FROM languages WHERE code = 'hu'), 'HR'),

-- Finance translations
('finance', (SELECT id FROM languages WHERE code = 'en'), 'Finance'),
('finance', (SELECT id FROM languages WHERE code = 'de'), 'Finanzen'),
('finance', (SELECT id FROM languages WHERE code = 'hu'), 'Pénzügyek'),

-- Legal translations
('legal', (SELECT id FROM languages WHERE code = 'en'), 'Legal'),
('legal', (SELECT id FROM languages WHERE code = 'de'), 'Rechtlich'),
('legal', (SELECT id FROM languages WHERE code = 'hu'), 'Jogi'),

-- Project management translations
('project_management', (SELECT id FROM languages WHERE code = 'en'), 'Project Management'),
('project_management', (SELECT id FROM languages WHERE code = 'de'), 'Projektmanagement'),
('project_management', (SELECT id FROM languages WHERE code = 'hu'), 'Projektmenedzsment'),

-- Delivery translations
('delivery', (SELECT id FROM languages WHERE code = 'en'), 'Delivery'),
('delivery', (SELECT id FROM languages WHERE code = 'de'), 'Lieferung'),
('delivery', (SELECT id FROM languages WHERE code = 'hu'), 'Szállítás'),

-- Pickup translations
('pickup', (SELECT id FROM languages WHERE code = 'en'), 'Pickup'),
('pickup', (SELECT id FROM languages WHERE code = 'de'), 'Abholung'),
('pickup', (SELECT id FROM languages WHERE code = 'hu'), 'Elvétel'),

-- Pickup point translations
('pickup_point', (SELECT id FROM languages WHERE code = 'en'), 'Pickup Point'),
('pickup_point', (SELECT id FROM languages WHERE code = 'de'), 'Abholpunkt'),
('pickup_point', (SELECT id FROM languages WHERE code = 'hu'), 'Elvételi pont'),

-- Drop off translations
('drop_off', (SELECT id FROM languages WHERE code = 'en'), 'Drop Off'),
('drop_off', (SELECT id FROM languages WHERE code = 'de'), 'Abgabe'),
('drop_off', (SELECT id FROM languages WHERE code = 'hu'), 'Letét'),

-- Collection translations
('collection', (SELECT id FROM languages WHERE code = 'en'), 'Collection'),
('collection', (SELECT id FROM languages WHERE code = 'de'), 'Sammlung'),
('collection', (SELECT id FROM languages WHERE code = 'hu'), 'Gyűjtés'),

-- Distribution translations
('distribution', (SELECT id FROM languages WHERE code = 'en'), 'Distribution'),
('distribution', (SELECT id FROM languages WHERE code = 'de'), 'Verteilung'),
('distribution', (SELECT id FROM languages WHERE code = 'hu'), 'Elosztás');

-- NOTE: 'warehouse', 'factory' translations already exist from address_types section

-- Now insert contact_types (translations already exist)
INSERT INTO contact_types (code, is_active) VALUES 
('phone', TRUE),
('mobile', TRUE),
('email', TRUE),
('fax', TRUE),
('mail', TRUE),
('letter', TRUE),
('telegram', TRUE),
('whatsapp', TRUE),
('viber', TRUE),
('skype', TRUE),
('linkedin', TRUE),
('twitter', TRUE),
('facebook', TRUE),
('instagram', TRUE),
('xing', TRUE),
('youtube', TRUE),
('website', TRUE),
('rss', TRUE),
('newsletter', TRUE),
('callback', TRUE),
('emergency', TRUE),
('office', TRUE),
('home', TRUE),
('work', TRUE),
('direct', TRUE),
('secretary', TRUE),
('reception', TRUE),
('assistant', TRUE),
('technical', TRUE),
('customer_service', TRUE),
('sales', TRUE),
('support', TRUE),
('hr', TRUE),
('finance', TRUE),
('legal', TRUE),
('project_management', TRUE),
('delivery', TRUE),
('pickup', TRUE),
('pickup_point', TRUE),
('drop_off', TRUE),
('collection', TRUE),
('distribution', TRUE),
('warehouse', TRUE),
('factory', TRUE);

-- ============================================================================
-- SECTION 10: AUDIT ACTIONS
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before audit_actions
-- because audit_actions.code has a foreign key to translations(code)

-- Insert translations for audit actions FIRST (before inserting audit_actions)
INSERT INTO translations (code, language_id, text) VALUES
-- Person actions
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Create Person'),
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person erstellen'),
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy létrehozása'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Update Person'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person aktualisieren'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy módosítása'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Delete Person'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person löschen'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy törlése'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Archive Person'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person archivieren'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy archiválása'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Restore Person'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person wiederherstellen'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy visszaállítása'),

-- Company actions
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Create Company'),
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen erstellen'),
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég létrehozása'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Update Company'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen aktualisieren'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég módosítása'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Delete Company'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen löschen'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég törlése'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Deactivate Company'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen deaktivieren'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég deaktiválása'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Reactivate Company'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen reaktivieren'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég reaktiválása'),

-- User actions
('CREATE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Create User'),
('CREATE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellen'),
('CREATE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó létrehozása'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Update User'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer aktualisieren'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó módosítása'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Delete User'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer löschen'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó törlése'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'en'), 'Lock User'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer sperren'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó zárolása'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'en'), 'Unlock User'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer entsperren'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó feloldása'),

-- Document actions
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Create Document'),
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument erstellen'),
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum létrehozása'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Update Document'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument aktualisieren'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum módosítása'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Delete Document'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument löschen'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum törlése'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Publish Document'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument veröffentlichen'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum közzététele'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Save as Draft'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Als Entwurf speichern'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Piszklapot mentés'),

-- File actions
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Create File'),
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei erstellen'),
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl létrehozása'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Update File'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei aktualisieren'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl módosítása'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Delete File'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei löschen'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl törlése'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Create Version'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Version erstellen'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Verzió létrehozása'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Restore File'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei wiederherstellen'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl visszaállítása'),

-- Employee actions
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Create Employee'),
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter erstellen'),
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó létrehozása'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Update Employee'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter aktualisieren'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó módosítása'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Delete Employee'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter löschen'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó törlése'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Transfer Employee'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter transferieren'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó áthelyezése'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Reinstate Employee'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter wieder einstellen'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó visszahelyezése');

-- Now insert audit_actions (translations already exist)
INSERT INTO audit_actions (code, is_active, object_type_id) VALUES 
('CREATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('UPDATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('DELETE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('ARCHIVE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('RESTORE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

('CREATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('UPDATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DELETE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DEACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('REACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

('CREATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UPDATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('DELETE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UNLOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

('CREATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('UPDATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DELETE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('PUBLISH_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DRAFT_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),

('CREATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('UPDATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('DELETE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('VERSION_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('RESTORE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),

('CREATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('UPDATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('DELETE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('TRANSFER_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('REINSTATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee'));

-- ============================================================================
-- SECTION 11: IDENTIFICATION TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before identification_types
-- because identification_types.code has a foreign key to translations(code)

-- Insert translations for identification_types FIRST (before inserting identification_types)
INSERT INTO translations (code, language_id, text) VALUES
-- Person identification documents
('passport', (SELECT id FROM languages WHERE code = 'en'), 'Passport'),
('passport', (SELECT id FROM languages WHERE code = 'de'), 'Pass'),
('passport', (SELECT id FROM languages WHERE code = 'hu'), 'Útlevél'),
('id_card', (SELECT id FROM languages WHERE code = 'en'), 'ID Card'),
('id_card', (SELECT id FROM languages WHERE code = 'de'), 'Ausweis'),
('id_card', (SELECT id FROM languages WHERE code = 'hu'), 'Személyi igazolvány'),
('driver_license', (SELECT id FROM languages WHERE code = 'en'), 'Driver License'),
('driver_license', (SELECT id FROM languages WHERE code = 'de'), 'Führerschein'),
('driver_license', (SELECT id FROM languages WHERE code = 'hu'), 'Jogosítvány'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'en'), 'Birth Certificate'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'de'), 'Geburtsurkunde'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'hu'), 'Születési anyakönyvi kivonat'),
('national_id', (SELECT id FROM languages WHERE code = 'en'), 'National ID'),
('national_id', (SELECT id FROM languages WHERE code = 'de'), 'Personalausweis'),
('national_id', (SELECT id FROM languages WHERE code = 'hu'), 'Nemzeti azonosító'),
('residence_permit', (SELECT id FROM languages WHERE code = 'en'), 'Residence Permit'),
('residence_permit', (SELECT id FROM languages WHERE code = 'de'), 'Aufenthaltserlaubnis'),
('residence_permit', (SELECT id FROM languages WHERE code = 'hu'), 'Tartózkodási engedély'),
('social_security_number', (SELECT id FROM languages WHERE code = 'en'), 'Social Security Number'),
('social_security_number', (SELECT id FROM languages WHERE code = 'de'), 'Sozialversicherungsnummer'),
('social_security_number', (SELECT id FROM languages WHERE code = 'hu'), 'TAJ szám'),
('tax_number', (SELECT id FROM languages WHERE code = 'en'), 'Tax Number'),
('tax_number', (SELECT id FROM languages WHERE code = 'de'), 'Steueridentifikationsnummer'),
('tax_number', (SELECT id FROM languages WHERE code = 'hu'), 'Adóazonosító jel'),

-- Company identification documents
('company_registration_number', (SELECT id FROM languages WHERE code = 'en'), 'Company Registration Number'),
('company_registration_number', (SELECT id FROM languages WHERE code = 'de'), 'Firmenregistrierungsnummer'),
('company_registration_number', (SELECT id FROM languages WHERE code = 'hu'), 'Cégjegyzékszám'),
('tax_id', (SELECT id FROM languages WHERE code = 'en'), 'Tax ID'),
('tax_id', (SELECT id FROM languages WHERE code = 'de'), 'Steuer-ID'),
('tax_id', (SELECT id FROM languages WHERE code = 'hu'), 'Adószám'),
('vat_number', (SELECT id FROM languages WHERE code = 'en'), 'VAT Number'),
('vat_number', (SELECT id FROM languages WHERE code = 'de'), 'Umsatzsteuer-Identifikationsnummer'),
('vat_number', (SELECT id FROM languages WHERE code = 'hu'), 'Közösségi adószám'),
('business_license', (SELECT id FROM languages WHERE code = 'en'), 'Business License'),
('business_license', (SELECT id FROM languages WHERE code = 'de'), 'Gewerbeschein'),
('business_license', (SELECT id FROM languages WHERE code = 'hu'), 'Működési engedély'),

-- Employee identification documents
('employee_id', (SELECT id FROM languages WHERE code = 'en'), 'Employee ID'),
('employee_id', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter-ID'),
('employee_id', (SELECT id FROM languages WHERE code = 'hu'), 'Munkavállalói azonosító'),
('staff_number', (SELECT id FROM languages WHERE code = 'en'), 'Staff Number'),
('staff_number', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiternummer'),
('staff_number', (SELECT id FROM languages WHERE code = 'hu'), 'Törzsszám'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'en'), 'Social Insurance Number'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'de'), 'Sozialversicherungsnummer'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'hu'), 'TB szám'),
('pension_number', (SELECT id FROM languages WHERE code = 'en'), 'Pension Number'),
('pension_number', (SELECT id FROM languages WHERE code = 'de'), 'Rentenversicherungsnummer'),
('pension_number', (SELECT id FROM languages WHERE code = 'hu'), 'Nyugdíjszám'),

-- User identification documents
('user_username', (SELECT id FROM languages WHERE code = 'en'), 'Username'),
('user_username', (SELECT id FROM languages WHERE code = 'de'), 'Benutzername'),
('user_username', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználónév'),
('user_email', (SELECT id FROM languages WHERE code = 'en'), 'User Email'),
('user_email', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer-E-Mail'),
('user_email', (SELECT id FROM languages WHERE code = 'hu'), 'E-mail cím'),

-- Document and File identification documents
('document_number', (SELECT id FROM languages WHERE code = 'en'), 'Document Number'),
('document_number', (SELECT id FROM languages WHERE code = 'de'), 'Dokumentnummer'),
('document_number', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum szám'),
('file_number', (SELECT id FROM languages WHERE code = 'en'), 'File Number'),
('file_number', (SELECT id FROM languages WHERE code = 'de'), 'Dateinummer'),
('file_number', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl szám');

-- Now insert identification_types (translations already exist)
INSERT INTO identification_types (code, is_active, object_type_id) VALUES 
-- Person identification types
('passport', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('id_card', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('driver_license', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('birth_certificate', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('national_id', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('residence_permit', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('social_security_number', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('tax_number', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

-- Company identification types
('company_registration_number', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('tax_id', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('vat_number', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('business_license', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

-- Employee identification types
('employee_id', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('staff_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('social_insurance_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('pension_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),

-- User identification types
('user_username', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_email', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

-- Document and File identification types
('document_number', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('file_number', TRUE, (SELECT id FROM object_types WHERE code = 'file'));

-- ============================================================================
-- SECTION 12: CURRENCIES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before currencies
-- because currencies.code has a foreign key to translations(code)

-- Insert translations for currencies FIRST (before inserting currencies)
INSERT INTO translations (code, language_id, text) VALUES 
('HUF', (SELECT id FROM languages WHERE code = 'hu'), 'Forint'),
('HUF', (SELECT id FROM languages WHERE code = 'en'), 'Hungarian Forint'),
('HUF', (SELECT id FROM languages WHERE code = 'de'), 'Ungarischer Forint'),
('USD', (SELECT id FROM languages WHERE code = 'hu'), 'US-dollár'),
('USD', (SELECT id FROM languages WHERE code = 'en'), 'US Dollar'),
('USD', (SELECT id FROM languages WHERE code = 'de'), 'US-Dollar'),
('EUR', (SELECT id FROM languages WHERE code = 'hu'), 'Euro'),
('EUR', (SELECT id FROM languages WHERE code = 'en'), 'Euro'),
('EUR', (SELECT id FROM languages WHERE code = 'de'), 'Euro'),
('GBP', (SELECT id FROM languages WHERE code = 'hu'), 'Angol font'),
('GBP', (SELECT id FROM languages WHERE code = 'en'), 'British Pound'),
('GBP', (SELECT id FROM languages WHERE code = 'de'), 'Britisches Pfund'),
('CAD', (SELECT id FROM languages WHERE code = 'hu'), 'Canadai dollár'),
('CAD', (SELECT id FROM languages WHERE code = 'en'), 'Canadian Dollar'),
('CAD', (SELECT id FROM languages WHERE code = 'de'), 'Kanadischer Dollar'),
('JPY', (SELECT id FROM languages WHERE code = 'hu'), 'Jen'),
('JPY', (SELECT id FROM languages WHERE code = 'en'), 'Japanese Yen'),
('JPY', (SELECT id FROM languages WHERE code = 'de'), 'Japanischer Yen'),
('AUD', (SELECT id FROM languages WHERE code = 'hu'), 'Ausztrál dollár'),
('AUD', (SELECT id FROM languages WHERE code = 'en'), 'Australian Dollar'),
('AUD', (SELECT id FROM languages WHERE code = 'de'), 'Australischer Dollar'),
('CHF', (SELECT id FROM languages WHERE code = 'hu'), 'SVF frank'),
('CHF', (SELECT id FROM languages WHERE code = 'en'), 'Swiss Franc'),
('CHF', (SELECT id FROM languages WHERE code = 'de'), 'Schweizer Franken'),
('CNY', (SELECT id FROM languages WHERE code = 'hu'), 'Kínai jüan'),
('CNY', (SELECT id FROM languages WHERE code = 'en'), 'Chinese Yuan'),
('CNY', (SELECT id FROM languages WHERE code = 'de'), 'Chinesischer Yuan'),
('SEK', (SELECT id FROM languages WHERE code = 'hu'), 'Svéd korona'),
('SEK', (SELECT id FROM languages WHERE code = 'en'), 'Swedish Krona'),
('SEK', (SELECT id FROM languages WHERE code = 'de'), 'Schwedische Krone'),
('NZD', (SELECT id FROM languages WHERE code = 'hu'), 'Új-zélandi dollár'),
('NZD', (SELECT id FROM languages WHERE code = 'en'), 'New Zealand Dollar'),
('NZD', (SELECT id FROM languages WHERE code = 'de'), 'Neuseeland-Dollar'),
('MXN', (SELECT id FROM languages WHERE code = 'hu'), 'Mexikói peso'),
('MXN', (SELECT id FROM languages WHERE code = 'en'), 'Mexican Peso'),
('MXN', (SELECT id FROM languages WHERE code = 'de'), 'Mexikanischer Peson'),
('SGD', (SELECT id FROM languages WHERE code = 'hu'), 'Szingapúri dollár'),
('SGD', (SELECT id FROM languages WHERE code = 'en'), 'Singapore Dollar'),
('SGD', (SELECT id FROM languages WHERE code = 'de'), 'Singapur-Dollar'),
('NOK', (SELECT id FROM languages WHERE code = 'hu'), 'Norvég korona'),
('NOK', (SELECT id FROM languages WHERE code = 'en'), 'Norwegian Krone'),
('NOK', (SELECT id FROM languages WHERE code = 'de'), 'Norwegische Krone'),
('KRW', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-koreai won'),
('KRW', (SELECT id FROM languages WHERE code = 'en'), 'South Korean Won'),
('KRW', (SELECT id FROM languages WHERE code = 'de'), 'Südkoreanischer Won'),
('TRY', (SELECT id FROM languages WHERE code = 'hu'), 'Török lira'),
('TRY', (SELECT id FROM languages WHERE code = 'en'), 'Turkish Lira'),
('TRY', (SELECT id FROM languages WHERE code = 'de'), 'Türkische Lira'),
('RUB', (SELECT id FROM languages WHERE code = 'hu'), 'Orosz rubel'),
('RUB', (SELECT id FROM languages WHERE code = 'en'), 'Russian Ruble'),
('RUB', (SELECT id FROM languages WHERE code = 'de'), 'Russischer Rubel'),
('BRL', (SELECT id FROM languages WHERE code = 'hu'), 'Brazil jelzés'),
('BRL', (SELECT id FROM languages WHERE code = 'en'), 'Brazilian Real'),
('BRL', (SELECT id FROM languages WHERE code = 'de'), 'Brasilianischer Real'),
('ZAR', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-afrikai rand'),
('ZAR', (SELECT id FROM languages WHERE code = 'en'), 'South African Rand'),
('ZAR', (SELECT id FROM languages WHERE code = 'de'), 'Südafrikanischer Rand'),
('INR', (SELECT id FROM languages WHERE code = 'hu'), 'Indiai rúpia'),
('INR', (SELECT id FROM languages WHERE code = 'en'), 'Indian Rupee'),
('INR', (SELECT id FROM languages WHERE code = 'de'), 'Indische Rupie');

-- Now insert currencies (translations already exist)
INSERT INTO currencies (code, is_active) VALUES 
('HUF', TRUE),  -- Hungarian Forint
('USD', TRUE),  -- US Dollar
('EUR', TRUE),  -- Euro
('GBP', TRUE),  -- British Pound
('CAD', TRUE),  -- Canadian Dollar
('JPY', TRUE),  -- Japanese Yen
('AUD', TRUE),  -- Australian Dollar
('CHF', TRUE),  -- Swiss Franc
('CNY', TRUE),  -- Chinese Yuan
('SEK', TRUE),  -- Swedish Krona
('NZD', TRUE),  -- New Zealand Dollar
('MXN', TRUE),  -- Mexican Peso
('SGD', TRUE),  -- Singapore Dollar
('NOK', TRUE),  -- Norwegian Krone
('KRW', TRUE),  -- South Korean Won
('TRY', TRUE),  -- Turkish Lira
('RUB', TRUE),  -- Russian Ruble
('BRL', TRUE),  -- Brazilian Real
('ZAR', TRUE),  -- South African Rand
('INR', TRUE);  -- Indian Rupee

-- ============================================================================
-- SECTION 12.5: COUNTRIES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before countries
-- because countries.code has a foreign key to translations(code)

-- Insert translations for countries FIRST (before inserting countries)
INSERT INTO translations (code, language_id, text) VALUES 
-- Major countries - English, German, Hungarian translations
('USA', (SELECT id FROM languages WHERE code = 'en'), 'United States'),
('USA', (SELECT id FROM languages WHERE code = 'de'), 'Vereinigte Staaten'),
('USA', (SELECT id FROM languages WHERE code = 'hu'), 'Egyesült Államok'),

('GBR', (SELECT id FROM languages WHERE code = 'en'), 'United Kingdom'),
('GBR', (SELECT id FROM languages WHERE code = 'de'), 'Vereinigtes Königreich'),
('GBR', (SELECT id FROM languages WHERE code = 'hu'), 'Egyesült Királyság'),

('DEU', (SELECT id FROM languages WHERE code = 'en'), 'Germany'),
('DEU', (SELECT id FROM languages WHERE code = 'de'), 'Deutschland'),
('DEU', (SELECT id FROM languages WHERE code = 'hu'), 'Németország'),

('FRA', (SELECT id FROM languages WHERE code = 'en'), 'France'),
('FRA', (SELECT id FROM languages WHERE code = 'de'), 'Frankreich'),
('FRA', (SELECT id FROM languages WHERE code = 'hu'), 'Franciaország'),

('ITA', (SELECT id FROM languages WHERE code = 'en'), 'Italy'),
('ITA', (SELECT id FROM languages WHERE code = 'de'), 'Italien'),
('ITA', (SELECT id FROM languages WHERE code = 'hu'), 'Olaszország'),

('ESP', (SELECT id FROM languages WHERE code = 'en'), 'Spain'),
('ESP', (SELECT id FROM languages WHERE code = 'de'), 'Spanien'),
('ESP', (SELECT id FROM languages WHERE code = 'hu'), 'Spanyolország'),

('NLD', (SELECT id FROM languages WHERE code = 'en'), 'Netherlands'),
('NLD', (SELECT id FROM languages WHERE code = 'de'), 'Niederlande'),
('NLD', (SELECT id FROM languages WHERE code = 'hu'), 'Hollandia'),

('BEL', (SELECT id FROM languages WHERE code = 'en'), 'Belgium'),
('BEL', (SELECT id FROM languages WHERE code = 'de'), 'Belgien'),
('BEL', (SELECT id FROM languages WHERE code = 'hu'), 'Belgium'),

('AUT', (SELECT id FROM languages WHERE code = 'en'), 'Austria'),
('AUT', (SELECT id FROM languages WHERE code = 'de'), 'Österreich'),
('AUT', (SELECT id FROM languages WHERE code = 'hu'), 'Ausztria'),

('CHE', (SELECT id FROM languages WHERE code = 'en'), 'Switzerland'),
('CHE', (SELECT id FROM languages WHERE code = 'de'), 'Schweiz'),
('CHE', (SELECT id FROM languages WHERE code = 'hu'), 'Svájc'),

('SWE', (SELECT id FROM languages WHERE code = 'en'), 'Sweden'),
('SWE', (SELECT id FROM languages WHERE code = 'de'), 'Schweden'),
('SWE', (SELECT id FROM languages WHERE code = 'hu'), 'Svédország'),

('NOR', (SELECT id FROM languages WHERE code = 'en'), 'Norway'),
('NOR', (SELECT id FROM languages WHERE code = 'de'), 'Norwegen'),
('NOR', (SELECT id FROM languages WHERE code = 'hu'), 'Norvégia'),

('DNK', (SELECT id FROM languages WHERE code = 'en'), 'Denmark'),
('DNK', (SELECT id FROM languages WHERE code = 'de'), 'Dänemark'),
('DNK', (SELECT id FROM languages WHERE code = 'hu'), 'Dánia'),

('FIN', (SELECT id FROM languages WHERE code = 'en'), 'Finland'),
('FIN', (SELECT id FROM languages WHERE code = 'de'), 'Finnland'),
('FIN', (SELECT id FROM languages WHERE code = 'hu'), 'Finnország'),

('POL', (SELECT id FROM languages WHERE code = 'en'), 'Poland'),
('POL', (SELECT id FROM languages WHERE code = 'de'), 'Polen'),
('POL', (SELECT id FROM languages WHERE code = 'hu'), 'Lengyelország'),

('CZE', (SELECT id FROM languages WHERE code = 'en'), 'Czech Republic'),
('CZE', (SELECT id FROM languages WHERE code = 'de'), 'Tschechische Republik'),
('CZE', (SELECT id FROM languages WHERE code = 'hu'), 'Csehország'),

('SVK', (SELECT id FROM languages WHERE code = 'en'), 'Slovakia'),
('SVK', (SELECT id FROM languages WHERE code = 'de'), 'Slowakei'),
('SVK', (SELECT id FROM languages WHERE code = 'hu'), 'Szlovákia'),

('HUN', (SELECT id FROM languages WHERE code = 'en'), 'Hungary'),
('HUN', (SELECT id FROM languages WHERE code = 'de'), 'Ungarn'),
('HUN', (SELECT id FROM languages WHERE code = 'hu'), 'Magyarország'),

('ROU', (SELECT id FROM languages WHERE code = 'en'), 'Romania'),
('ROU', (SELECT id FROM languages WHERE code = 'de'), 'Rumänien'),
('ROU', (SELECT id FROM languages WHERE code = 'hu'), 'Románia'),

('BGR', (SELECT id FROM languages WHERE code = 'en'), 'Bulgaria'),
('BGR', (SELECT id FROM languages WHERE code = 'de'), 'Bulgarien'),
('BGR', (SELECT id FROM languages WHERE code = 'hu'), 'Bulgária'),

('GRC', (SELECT id FROM languages WHERE code = 'en'), 'Greece'),
('GRC', (SELECT id FROM languages WHERE code = 'de'), 'Griechenland'),
('GRC', (SELECT id FROM languages WHERE code = 'hu'), 'Görögország'),

('PRT', (SELECT id FROM languages WHERE code = 'en'), 'Portugal'),
('PRT', (SELECT id FROM languages WHERE code = 'de'), 'Portugal'),
('PRT', (SELECT id FROM languages WHERE code = 'hu'), 'Portugália'),

('IRL', (SELECT id FROM languages WHERE code = 'en'), 'Ireland'),
('IRL', (SELECT id FROM languages WHERE code = 'de'), 'Irland'),
('IRL', (SELECT id FROM languages WHERE code = 'hu'), 'Írország'),

('CAN', (SELECT id FROM languages WHERE code = 'en'), 'Canada'),
('CAN', (SELECT id FROM languages WHERE code = 'de'), 'Kanada'),
('CAN', (SELECT id FROM languages WHERE code = 'hu'), 'Kanada'),

('MEX', (SELECT id FROM languages WHERE code = 'en'), 'Mexico'),
('MEX', (SELECT id FROM languages WHERE code = 'de'), 'Mexiko'),
('MEX', (SELECT id FROM languages WHERE code = 'hu'), 'Mexikó'),

('BRA', (SELECT id FROM languages WHERE code = 'en'), 'Brazil'),
('BRA', (SELECT id FROM languages WHERE code = 'de'), 'Brasilien'),
('BRA', (SELECT id FROM languages WHERE code = 'hu'), 'Brazília'),

('ARG', (SELECT id FROM languages WHERE code = 'en'), 'Argentina'),
('ARG', (SELECT id FROM languages WHERE code = 'de'), 'Argentinien'),
('ARG', (SELECT id FROM languages WHERE code = 'hu'), 'Argentína'),

('CHN', (SELECT id FROM languages WHERE code = 'en'), 'China'),
('CHN', (SELECT id FROM languages WHERE code = 'de'), 'China'),
('CHN', (SELECT id FROM languages WHERE code = 'hu'), 'Kína'),

('JPN', (SELECT id FROM languages WHERE code = 'en'), 'Japan'),
('JPN', (SELECT id FROM languages WHERE code = 'de'), 'Japan'),
('JPN', (SELECT id FROM languages WHERE code = 'hu'), 'Japán'),

('KOR', (SELECT id FROM languages WHERE code = 'en'), 'South Korea'),
('KOR', (SELECT id FROM languages WHERE code = 'de'), 'Südkorea'),
('KOR', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-Korea'),

('IND', (SELECT id FROM languages WHERE code = 'en'), 'India'),
('IND', (SELECT id FROM languages WHERE code = 'de'), 'Indien'),
('IND', (SELECT id FROM languages WHERE code = 'hu'), 'India'),

('AUS', (SELECT id FROM languages WHERE code = 'en'), 'Australia'),
('AUS', (SELECT id FROM languages WHERE code = 'de'), 'Australien'),
('AUS', (SELECT id FROM languages WHERE code = 'hu'), 'Ausztrália'),

('NZL', (SELECT id FROM languages WHERE code = 'en'), 'New Zealand'),
('NZL', (SELECT id FROM languages WHERE code = 'de'), 'Neuseeland'),
('NZL', (SELECT id FROM languages WHERE code = 'hu'), 'Új-Zéland'),

('ZAF', (SELECT id FROM languages WHERE code = 'en'), 'South Africa'),
('ZAF', (SELECT id FROM languages WHERE code = 'de'), 'Südafrika'),
('ZAF', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-afrikai Köztársaság'),

('RUS', (SELECT id FROM languages WHERE code = 'en'), 'Russia'),
('RUS', (SELECT id FROM languages WHERE code = 'de'), 'Russland'),
('RUS', (SELECT id FROM languages WHERE code = 'hu'), 'Oroszország'),

('TUR', (SELECT id FROM languages WHERE code = 'en'), 'Turkey'),
('TUR', (SELECT id FROM languages WHERE code = 'de'), 'Türkei'),
('TUR', (SELECT id FROM languages WHERE code = 'hu'), 'Törökország'),

('SAU', (SELECT id FROM languages WHERE code = 'en'), 'Saudi Arabia'),
('SAU', (SELECT id FROM languages WHERE code = 'de'), 'Saudi-Arabien'),
('SAU', (SELECT id FROM languages WHERE code = 'hu'), 'Szaúd-Arábia'),

('ARE', (SELECT id FROM languages WHERE code = 'en'), 'United Arab Emirates'),
('ARE', (SELECT id FROM languages WHERE code = 'de'), 'Vereinigte Arabische Emirate'),
('ARE', (SELECT id FROM languages WHERE code = 'hu'), 'Egyesült Arab Emírségek'),

('ISR', (SELECT id FROM languages WHERE code = 'en'), 'Israel'),
('ISR', (SELECT id FROM languages WHERE code = 'de'), 'Israel'),
('ISR', (SELECT id FROM languages WHERE code = 'hu'), 'Izrael'),

('SGP', (SELECT id FROM languages WHERE code = 'en'), 'Singapore'),
('SGP', (SELECT id FROM languages WHERE code = 'de'), 'Singapur'),
('SGP', (SELECT id FROM languages WHERE code = 'hu'), 'Szingapúr'),

('THA', (SELECT id FROM languages WHERE code = 'en'), 'Thailand'),
('THA', (SELECT id FROM languages WHERE code = 'de'), 'Thailand'),
('THA', (SELECT id FROM languages WHERE code = 'hu'), 'Thaiföld'),

('IDN', (SELECT id FROM languages WHERE code = 'en'), 'Indonesia'),
('IDN', (SELECT id FROM languages WHERE code = 'de'), 'Indonesien'),
('IDN', (SELECT id FROM languages WHERE code = 'hu'), 'Indonézia'),

('MYS', (SELECT id FROM languages WHERE code = 'en'), 'Malaysia'),
('MYS', (SELECT id FROM languages WHERE code = 'de'), 'Malaysia'),
('MYS', (SELECT id FROM languages WHERE code = 'hu'), 'Malajzia'),

('PHL', (SELECT id FROM languages WHERE code = 'en'), 'Philippines'),
('PHL', (SELECT id FROM languages WHERE code = 'de'), 'Philippinen'),
('PHL', (SELECT id FROM languages WHERE code = 'hu'), 'Fülöp-szigetek'),

('VNM', (SELECT id FROM languages WHERE code = 'en'), 'Vietnam'),
('VNM', (SELECT id FROM languages WHERE code = 'de'), 'Vietnam'),
('VNM', (SELECT id FROM languages WHERE code = 'hu'), 'Vietnám'),

('EGY', (SELECT id FROM languages WHERE code = 'en'), 'Egypt'),
('EGY', (SELECT id FROM languages WHERE code = 'de'), 'Ägypten'),
('EGY', (SELECT id FROM languages WHERE code = 'hu'), 'Egyiptom'),

('NGA', (SELECT id FROM languages WHERE code = 'en'), 'Nigeria'),
('NGA', (SELECT id FROM languages WHERE code = 'de'), 'Nigeria'),
('NGA', (SELECT id FROM languages WHERE code = 'hu'), 'Nigéria'),

('KEN', (SELECT id FROM languages WHERE code = 'en'), 'Kenya'),
('KEN', (SELECT id FROM languages WHERE code = 'de'), 'Kenia'),
('KEN', (SELECT id FROM languages WHERE code = 'hu'), 'Kenya'),

-- Additional European countries
('ALB', (SELECT id FROM languages WHERE code = 'en'), 'Albania'),
('ALB', (SELECT id FROM languages WHERE code = 'de'), 'Albanien'),
('ALB', (SELECT id FROM languages WHERE code = 'hu'), 'Albánia'),

('AND', (SELECT id FROM languages WHERE code = 'en'), 'Andorra'),
('AND', (SELECT id FROM languages WHERE code = 'de'), 'Andorra'),
('AND', (SELECT id FROM languages WHERE code = 'hu'), 'Andorra'),

('ARM', (SELECT id FROM languages WHERE code = 'en'), 'Armenia'),
('ARM', (SELECT id FROM languages WHERE code = 'de'), 'Armenien'),
('ARM', (SELECT id FROM languages WHERE code = 'hu'), 'Örményország'),

('AZE', (SELECT id FROM languages WHERE code = 'en'), 'Azerbaijan'),
('AZE', (SELECT id FROM languages WHERE code = 'de'), 'Aserbaidschan'),
('AZE', (SELECT id FROM languages WHERE code = 'hu'), 'Azerbajdzsán'),

('BLR', (SELECT id FROM languages WHERE code = 'en'), 'Belarus'),
('BLR', (SELECT id FROM languages WHERE code = 'de'), 'Belarus'),
('BLR', (SELECT id FROM languages WHERE code = 'hu'), 'Fehéroroszország'),

('BIH', (SELECT id FROM languages WHERE code = 'en'), 'Bosnia and Herzegovina'),
('BIH', (SELECT id FROM languages WHERE code = 'de'), 'Bosnien und Herzegowina'),
('BIH', (SELECT id FROM languages WHERE code = 'hu'), 'Bosznia-Hercegovina'),

('HRV', (SELECT id FROM languages WHERE code = 'en'), 'Croatia'),
('HRV', (SELECT id FROM languages WHERE code = 'de'), 'Kroatien'),
('HRV', (SELECT id FROM languages WHERE code = 'hu'), 'Horvátország'),

('CYP', (SELECT id FROM languages WHERE code = 'en'), 'Cyprus'),
('CYP', (SELECT id FROM languages WHERE code = 'de'), 'Zypern'),
('CYP', (SELECT id FROM languages WHERE code = 'hu'), 'Ciprus'),

('EST', (SELECT id FROM languages WHERE code = 'en'), 'Estonia'),
('EST', (SELECT id FROM languages WHERE code = 'de'), 'Estland'),
('EST', (SELECT id FROM languages WHERE code = 'hu'), 'Észtország'),

('GEO', (SELECT id FROM languages WHERE code = 'en'), 'Georgia'),
('GEO', (SELECT id FROM languages WHERE code = 'de'), 'Georgien'),
('GEO', (SELECT id FROM languages WHERE code = 'hu'), 'Grúzia'),

('ISL', (SELECT id FROM languages WHERE code = 'en'), 'Iceland'),
('ISL', (SELECT id FROM languages WHERE code = 'de'), 'Island'),
('ISL', (SELECT id FROM languages WHERE code = 'hu'), 'Izland'),

('LVA', (SELECT id FROM languages WHERE code = 'en'), 'Latvia'),
('LVA', (SELECT id FROM languages WHERE code = 'de'), 'Lettland'),
('LVA', (SELECT id FROM languages WHERE code = 'hu'), 'Lettország'),

('LTU', (SELECT id FROM languages WHERE code = 'en'), 'Lithuania'),
('LTU', (SELECT id FROM languages WHERE code = 'de'), 'Litauen'),
('LTU', (SELECT id FROM languages WHERE code = 'hu'), 'Litvánia'),

('LUX', (SELECT id FROM languages WHERE code = 'en'), 'Luxembourg'),
('LUX', (SELECT id FROM languages WHERE code = 'de'), 'Luxemburg'),
('LUX', (SELECT id FROM languages WHERE code = 'hu'), 'Luxemburg'),

('MLT', (SELECT id FROM languages WHERE code = 'en'), 'Malta'),
('MLT', (SELECT id FROM languages WHERE code = 'de'), 'Malta'),
('MLT', (SELECT id FROM languages WHERE code = 'hu'), 'Málta'),

('MDA', (SELECT id FROM languages WHERE code = 'en'), 'Moldova'),
('MDA', (SELECT id FROM languages WHERE code = 'de'), 'Moldau'),
('MDA', (SELECT id FROM languages WHERE code = 'hu'), 'Moldova'),

('MCO', (SELECT id FROM languages WHERE code = 'en'), 'Monaco'),
('MCO', (SELECT id FROM languages WHERE code = 'de'), 'Monaco'),
('MCO', (SELECT id FROM languages WHERE code = 'hu'), 'Monaco'),

('MNE', (SELECT id FROM languages WHERE code = 'en'), 'Montenegro'),
('MNE', (SELECT id FROM languages WHERE code = 'de'), 'Montenegro'),
('MNE', (SELECT id FROM languages WHERE code = 'hu'), 'Montenegró'),

('MKD', (SELECT id FROM languages WHERE code = 'en'), 'North Macedonia'),
('MKD', (SELECT id FROM languages WHERE code = 'de'), 'Nordmazedonien'),
('MKD', (SELECT id FROM languages WHERE code = 'hu'), 'Észak-Macedónia'),

('SMR', (SELECT id FROM languages WHERE code = 'en'), 'San Marino'),
('SMR', (SELECT id FROM languages WHERE code = 'de'), 'San Marino'),
('SMR', (SELECT id FROM languages WHERE code = 'hu'), 'San Marino'),

('SRB', (SELECT id FROM languages WHERE code = 'en'), 'Serbia'),
('SRB', (SELECT id FROM languages WHERE code = 'de'), 'Serbien'),
('SRB', (SELECT id FROM languages WHERE code = 'hu'), 'Szerbia'),

('SVN', (SELECT id FROM languages WHERE code = 'en'), 'Slovenia'),
('SVN', (SELECT id FROM languages WHERE code = 'de'), 'Slowenien'),
('SVN', (SELECT id FROM languages WHERE code = 'hu'), 'Szlovénia'),

('UKR', (SELECT id FROM languages WHERE code = 'en'), 'Ukraine'),
('UKR', (SELECT id FROM languages WHERE code = 'de'), 'Ukraine'),
('UKR', (SELECT id FROM languages WHERE code = 'hu'), 'Ukrajna'),

('VAT', (SELECT id FROM languages WHERE code = 'en'), 'Vatican City'),
('VAT', (SELECT id FROM languages WHERE code = 'de'), 'Vatikanstadt'),
('VAT', (SELECT id FROM languages WHERE code = 'hu'), 'Vatikán');

-- Now insert countries (translations already exist)
INSERT INTO countries (code, is_active) VALUES 
('USA', TRUE),  -- United States
('GBR', TRUE),  -- United Kingdom
('DEU', TRUE),  -- Germany
('FRA', TRUE),  -- France
('ITA', TRUE),  -- Italy
('ESP', TRUE),  -- Spain
('NLD', TRUE),  -- Netherlands
('BEL', TRUE),  -- Belgium
('AUT', TRUE),  -- Austria
('CHE', TRUE),  -- Switzerland
('SWE', TRUE),  -- Sweden
('NOR', TRUE),  -- Norway
('DNK', TRUE),  -- Denmark
('FIN', TRUE),  -- Finland
('POL', TRUE),  -- Poland
('CZE', TRUE),  -- Czech Republic
('SVK', TRUE),  -- Slovakia
('HUN', TRUE),  -- Hungary
('ROU', TRUE),  -- Romania
('BGR', TRUE),  -- Bulgaria
('GRC', TRUE),  -- Greece
('PRT', TRUE),  -- Portugal
('IRL', TRUE),  -- Ireland
('CAN', TRUE),  -- Canada
('MEX', TRUE),  -- Mexico
('BRA', TRUE),  -- Brazil
('ARG', TRUE),  -- Argentina
('CHN', TRUE),  -- China
('JPN', TRUE),  -- Japan
('KOR', TRUE),  -- South Korea
('IND', TRUE),  -- India
('AUS', TRUE),  -- Australia
('NZL', TRUE),  -- New Zealand
('ZAF', TRUE),  -- South Africa
('RUS', TRUE),  -- Russia
('TUR', TRUE),  -- Turkey
('SAU', TRUE),  -- Saudi Arabia
('ARE', TRUE),  -- United Arab Emirates
('ISR', TRUE),  -- Israel
('SGP', TRUE),  -- Singapore
('THA', TRUE),  -- Thailand
('IDN', TRUE),  -- Indonesia
('MYS', TRUE),  -- Malaysia
('PHL', TRUE),  -- Philippines
('VNM', TRUE),  -- Vietnam
('EGY', TRUE),  -- Egypt
('NGA', TRUE),  -- Nigeria
('KEN', TRUE),  -- Kenya

-- Additional European countries
('ALB', TRUE),  -- Albania
('AND', TRUE),  -- Andorra
('ARM', TRUE),  -- Armenia
('AZE', TRUE),  -- Azerbaijan
('BLR', TRUE),  -- Belarus
('BIH', TRUE),  -- Bosnia and Herzegovina
('HRV', TRUE),  -- Croatia
('CYP', TRUE),  -- Cyprus
('EST', TRUE),  -- Estonia
('GEO', TRUE),  -- Georgia
('ISL', TRUE),  -- Iceland
('LVA', TRUE),  -- Latvia
('LTU', TRUE),  -- Lithuania
('LUX', TRUE),  -- Luxembourg
('MLT', TRUE),  -- Malta
('MDA', TRUE),  -- Moldova
('MCO', TRUE),  -- Monaco
('MNE', TRUE),  -- Montenegro
('MKD', TRUE),  -- North Macedonia
('SMR', TRUE),  -- San Marino
('SRB', TRUE),  -- Serbia
('SVN', TRUE),  -- Slovenia
('UKR', TRUE),  -- Ukraine
('VAT', TRUE);  -- Vatican City

-- ============================================================================
-- SECTION 13: TRANSACTION TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before transaction_types
-- because transaction_types.code has a foreign key to translations(code)

-- Insert translations for transaction_types FIRST (before inserting transaction_types)
INSERT INTO translations (code, language_id, text) VALUES 
('SALE', (SELECT id FROM languages WHERE code = 'hu'), 'Eladás'),
('SALE', (SELECT id FROM languages WHERE code = 'en'), 'Sale'),
('SALE', (SELECT id FROM languages WHERE code = 'de'), 'Verkauf'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'hu'), 'Vásárlás'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'en'), 'Purchase'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'de'), 'Kauf'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'hu'), 'Átvitel'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'en'), 'Transfer'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'de'), 'Überweisung'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'hu'), 'Bevétel'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'en'), 'Receipt'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'de'), 'Einnahme'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Fizetés'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'en'), 'Payment'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'de'), 'Zahlung'),
('REFUND', (SELECT id FROM languages WHERE code = 'hu'), 'Visszatérítés'),
('REFUND', (SELECT id FROM languages WHERE code = 'en'), 'Refund'),
('REFUND', (SELECT id FROM languages WHERE code = 'de'), 'Rückerstattung'),
('INVOICE', (SELECT id FROM languages WHERE code = 'hu'), 'Számla'),
('INVOICE', (SELECT id FROM languages WHERE code = 'en'), 'Invoice'),
('INVOICE', (SELECT id FROM languages WHERE code = 'de'), 'Rechnung'),
('CREDIT', (SELECT id FROM languages WHERE code = 'hu'), 'Kredit'),
('CREDIT', (SELECT id FROM languages WHERE code = 'en'), 'Credit'),
('CREDIT', (SELECT id FROM languages WHERE code = 'de'), 'Kredit'),
('DEBIT', (SELECT id FROM languages WHERE code = 'hu'), 'Debet'),
('DEBIT', (SELECT id FROM languages WHERE code = 'en'), 'Debit'),
('DEBIT', (SELECT id FROM languages WHERE code = 'de'), 'Debet'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'hu'), 'Felvétel'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'en'), 'Withdrawal'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'de'), 'Abhebung'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'hu'), 'Befizetés'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'en'), 'Deposit'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'de'), 'Einzahlung'),
('FEE', (SELECT id FROM languages WHERE code = 'hu'), 'Díj'),
('FEE', (SELECT id FROM languages WHERE code = 'en'), 'Fee'),
('FEE', (SELECT id FROM languages WHERE code = 'de'), 'Gebühr'),
('INTEREST', (SELECT id FROM languages WHERE code = 'hu'), 'Kamat'),
('INTEREST', (SELECT id FROM languages WHERE code = 'en'), 'Interest'),
('INTEREST', (SELECT id FROM languages WHERE code = 'de'), 'Zins'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'hu'), 'Kedvezmény'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'en'), 'Discount'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'de'), 'Rabatt'),
('TAX', (SELECT id FROM languages WHERE code = 'hu'), 'Adó'),
('TAX', (SELECT id FROM languages WHERE code = 'en'), 'Tax'),
('TAX', (SELECT id FROM languages WHERE code = 'de'), 'Steuer'),
('LOAN', (SELECT id FROM languages WHERE code = 'hu'), 'Hitel'),
('LOAN', (SELECT id FROM languages WHERE code = 'en'), 'Loan'),
('LOAN', (SELECT id FROM languages WHERE code = 'de'), 'Kredit'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Tartozás'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'en'), 'Repayment'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'de'), 'Zahlung'),
('CHARITY', (SELECT id FROM languages WHERE code = 'hu'), 'Szociális'),
('CHARITY', (SELECT id FROM languages WHERE code = 'en'), 'Charity'),
('CHARITY', (SELECT id FROM languages WHERE code = 'de'), 'Wohltätigkeit'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'hu'), 'Szociális'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'en'), 'Charitable'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'de'), 'Wohltätige');

-- Now insert transaction_types (translations already exist)
INSERT INTO transaction_types (code, is_active) VALUES 
('SALE', TRUE),
('PURCHASE', TRUE),
('TRANSFER', TRUE),
('RECEIPT', TRUE),
('PAYMENT', TRUE),
('REFUND', TRUE),
('INVOICE', TRUE),
('CREDIT', TRUE),
('DEBIT', TRUE),
('WITHDRAWAL', TRUE),
('DEPOSIT', TRUE),
('FEE', TRUE),
('INTEREST', TRUE),
('DISCOUNT', TRUE),
('TAX', TRUE),
('LOAN', TRUE),
('REPAYMENT', TRUE),
('CHARITY', TRUE),
('CHARITABLE', TRUE);

-- ============================================================================
-- SECTION 14: OBJECT RELATION TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before object_relation_types
-- because object_relation_types.code references translations(code)

-- Insert translations for object_relation_types (English, German, Hungarian)
-- NOTE: 'employee' translation already exists from object_types section
INSERT INTO translations (code, language_id, text) VALUES
-- Company-Person relationship translations
('contractor', (SELECT id FROM languages WHERE code = 'en'), 'Contractor'),
('contractor', (SELECT id FROM languages WHERE code = 'de'), 'Auftragnehmer'),
('contractor', (SELECT id FROM languages WHERE code = 'hu'), 'Szerződő'),
('consultant', (SELECT id FROM languages WHERE code = 'en'), 'Consultant'),
('consultant', (SELECT id FROM languages WHERE code = 'de'), 'Berater'),
('consultant', (SELECT id FROM languages WHERE code = 'hu'), 'Tanácsadó'),
('board_member', (SELECT id FROM languages WHERE code = 'en'), 'Board Member'),
('board_member', (SELECT id FROM languages WHERE code = 'de'), 'Vorstandsmitglied'),
('board_member', (SELECT id FROM languages WHERE code = 'hu'), 'Igazgatótanácsi tag'),
('shareholder', (SELECT id FROM languages WHERE code = 'en'), 'Shareholder'),
('shareholder', (SELECT id FROM languages WHERE code = 'de'), 'Aktionär'),
('shareholder', (SELECT id FROM languages WHERE code = 'hu'), 'Részvényes'),
('customer', (SELECT id FROM languages WHERE code = 'en'), 'Customer'),
('customer', (SELECT id FROM languages WHERE code = 'de'), 'Kunde'),
('customer', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfél'),
('supplier', (SELECT id FROM languages WHERE code = 'en'), 'Supplier'),
('supplier', (SELECT id FROM languages WHERE code = 'de'), 'Lieferant'),
('supplier', (SELECT id FROM languages WHERE code = 'hu'), 'Beszállító'),

-- Person-Person relationship translations
('spouse', (SELECT id FROM languages WHERE code = 'en'), 'Spouse'),
('spouse', (SELECT id FROM languages WHERE code = 'de'), 'Ehepartner'),
('spouse', (SELECT id FROM languages WHERE code = 'hu'), 'Házastárs'),
('parent', (SELECT id FROM languages WHERE code = 'en'), 'Parent'),
('parent', (SELECT id FROM languages WHERE code = 'de'), 'Elternteil'),
('parent', (SELECT id FROM languages WHERE code = 'hu'), 'Szülő'),
('child', (SELECT id FROM languages WHERE code = 'en'), 'Child'),
('child', (SELECT id FROM languages WHERE code = 'de'), 'Kind'),
('child', (SELECT id FROM languages WHERE code = 'hu'), 'Gyermek'),
('sibling', (SELECT id FROM languages WHERE code = 'en'), 'Sibling'),
('sibling', (SELECT id FROM languages WHERE code = 'de'), 'Geschwister'),
('sibling', (SELECT id FROM languages WHERE code = 'hu'), 'Testvér'),
('guardian', (SELECT id FROM languages WHERE code = 'en'), 'Guardian'),
('guardian', (SELECT id FROM languages WHERE code = 'de'), 'Vormund'),
('guardian', (SELECT id FROM languages WHERE code = 'hu'), 'Gondnok'),
('emergency_contact', (SELECT id FROM languages WHERE code = 'en'), 'Emergency Contact'),
('emergency_contact', (SELECT id FROM languages WHERE code = 'de'), 'Notfallkontakt'),
('emergency_contact', (SELECT id FROM languages WHERE code = 'hu'), 'Vészhelyzeti kapcsolattartó'),
('family_member', (SELECT id FROM languages WHERE code = 'en'), 'Family Member'),
('family_member', (SELECT id FROM languages WHERE code = 'de'), 'Familienmitglied'),
('family_member', (SELECT id FROM languages WHERE code = 'hu'), 'Családtag'),
('friend', (SELECT id FROM languages WHERE code = 'en'), 'Friend'),
('friend', (SELECT id FROM languages WHERE code = 'de'), 'Freund'),
('friend', (SELECT id FROM languages WHERE code = 'hu'), 'Barát'),
('colleague', (SELECT id FROM languages WHERE code = 'en'), 'Colleague'),
('colleague', (SELECT id FROM languages WHERE code = 'de'), 'Kollege'),
('colleague', (SELECT id FROM languages WHERE code = 'hu'), 'Kolléga'),

-- Company-Company relationship translations
('business_partner', (SELECT id FROM languages WHERE code = 'en'), 'Business Partner'),
('business_partner', (SELECT id FROM languages WHERE code = 'de'), 'Geschäftspartner'),
('business_partner', (SELECT id FROM languages WHERE code = 'hu'), 'Üzleti partner'),
('subsidiary', (SELECT id FROM languages WHERE code = 'en'), 'Subsidiary'),
('subsidiary', (SELECT id FROM languages WHERE code = 'de'), 'Tochtergesellschaft'),
('subsidiary', (SELECT id FROM languages WHERE code = 'hu'), 'Leányvállalat'),
('parent_company', (SELECT id FROM languages WHERE code = 'en'), 'Parent Company'),
('parent_company', (SELECT id FROM languages WHERE code = 'de'), 'Muttergesellschaft'),
('parent_company', (SELECT id FROM languages WHERE code = 'hu'), 'Anyavállalat'),
('supplier_company', (SELECT id FROM languages WHERE code = 'en'), 'Supplier Company'),
('supplier_company', (SELECT id FROM languages WHERE code = 'de'), 'Lieferantenunternehmen'),
('supplier_company', (SELECT id FROM languages WHERE code = 'hu'), 'Beszállító cég'),
('customer_company', (SELECT id FROM languages WHERE code = 'en'), 'Customer Company'),
('customer_company', (SELECT id FROM languages WHERE code = 'de'), 'Kundenunternehmen'),
('customer_company', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfél cég'),
('competitor', (SELECT id FROM languages WHERE code = 'en'), 'Competitor'),
('competitor', (SELECT id FROM languages WHERE code = 'de'), 'Wettbewerber'),
('competitor', (SELECT id FROM languages WHERE code = 'hu'), 'Versenytárs'),
('affiliate', (SELECT id FROM languages WHERE code = 'en'), 'Affiliate'),
('affiliate', (SELECT id FROM languages WHERE code = 'de'), 'Tochtergesellschaft'),
('affiliate', (SELECT id FROM languages WHERE code = 'hu'), 'Társvállalat'),
('merger_partner', (SELECT id FROM languages WHERE code = 'en'), 'Merger Partner'),
('merger_partner', (SELECT id FROM languages WHERE code = 'de'), 'Fusionspartner'),
('merger_partner', (SELECT id FROM languages WHERE code = 'hu'), 'Összeolvadási partner'),

-- User-Object relationship translations
('user_assigned', (SELECT id FROM languages WHERE code = 'en'), 'Assigned User'),
('user_assigned', (SELECT id FROM languages WHERE code = 'de'), 'Zugewiesener Benutzer'),
('user_assigned', (SELECT id FROM languages WHERE code = 'hu'), 'Hozzárendelt felhasználó'),
('user_owner', (SELECT id FROM languages WHERE code = 'en'), 'Owner'),
('user_owner', (SELECT id FROM languages WHERE code = 'de'), 'Eigentümer'),
('user_owner', (SELECT id FROM languages WHERE code = 'hu'), 'Tulajdonos'),
('user_manager', (SELECT id FROM languages WHERE code = 'en'), 'Manager'),
('user_manager', (SELECT id FROM languages WHERE code = 'de'), 'Manager'),
('user_manager', (SELECT id FROM languages WHERE code = 'hu'), 'Menedzser'),

-- Document-Object relationship translations
('document_author', (SELECT id FROM languages WHERE code = 'en'), 'Author'),
('document_author', (SELECT id FROM languages WHERE code = 'de'), 'Autor'),
('document_author', (SELECT id FROM languages WHERE code = 'hu'), 'Szerző'),
('document_reviewer', (SELECT id FROM languages WHERE code = 'en'), 'Reviewer'),
('document_reviewer', (SELECT id FROM languages WHERE code = 'de'), 'Prüfer'),
('document_reviewer', (SELECT id FROM languages WHERE code = 'hu'), 'Lektor'),
('document_owner', (SELECT id FROM languages WHERE code = 'en'), 'Document Owner'),
('document_owner', (SELECT id FROM languages WHERE code = 'de'), 'Dokumentenbesitzer'),
('document_owner', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum tulajdonos'),
('document_shared_with_person', (SELECT id FROM languages WHERE code = 'en'), 'Shared with Person'),
('document_shared_with_person', (SELECT id FROM languages WHERE code = 'de'), 'Mit Person geteilt'),
('document_shared_with_person', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva személlyel'),
('document_shared_with_company', (SELECT id FROM languages WHERE code = 'en'), 'Shared with Company'),
('document_shared_with_company', (SELECT id FROM languages WHERE code = 'de'), 'Mit Unternehmen geteilt'),
('document_shared_with_company', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva céggel'),
('document_shared_with_user', (SELECT id FROM languages WHERE code = 'en'), 'Shared with User'),
('document_shared_with_user', (SELECT id FROM languages WHERE code = 'de'), 'Mit Benutzer geteilt'),
('document_shared_with_user', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva felhasználóval'),
('document_created_by_user', (SELECT id FROM languages WHERE code = 'en'), 'Created by User'),
('document_created_by_user', (SELECT id FROM languages WHERE code = 'de'), 'Erstellt von Benutzer'),
('document_created_by_user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó által létrehozva'),
('document_assigned_to_user', (SELECT id FROM languages WHERE code = 'en'), 'Assigned to User'),
('document_assigned_to_user', (SELECT id FROM languages WHERE code = 'de'), 'Zugewiesen an Benutzer'),
('document_assigned_to_user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználóhoz rendelve'),
('document_company', (SELECT id FROM languages WHERE code = 'en'), 'Company Document'),
('document_company', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmensdokument'),
('document_company', (SELECT id FROM languages WHERE code = 'hu'), 'Cég dokumentum'),
('document_related', (SELECT id FROM languages WHERE code = 'en'), 'Related Document'),
('document_related', (SELECT id FROM languages WHERE code = 'de'), 'Verwandtes Dokument'),
('document_related', (SELECT id FROM languages WHERE code = 'hu'), 'Kapcsolódó dokumentum'),
('document_version_of', (SELECT id FROM languages WHERE code = 'en'), 'Version of Document'),
('document_version_of', (SELECT id FROM languages WHERE code = 'de'), 'Version des Dokuments'),
('document_version_of', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum verziója'),
('document_replaces', (SELECT id FROM languages WHERE code = 'en'), 'Replaces Document'),
('document_replaces', (SELECT id FROM languages WHERE code = 'de'), 'Ersetzt Dokument'),
('document_replaces', (SELECT id FROM languages WHERE code = 'hu'), 'Helyettesíti a dokumentumot'),
('document_supersedes', (SELECT id FROM languages WHERE code = 'en'), 'Supersedes Document'),
('document_supersedes', (SELECT id FROM languages WHERE code = 'de'), 'Ersetzt Dokument'),
('document_supersedes', (SELECT id FROM languages WHERE code = 'hu'), 'Felváltja a dokumentumot'),

-- File-Object relationship translations
('file_owner_person', (SELECT id FROM languages WHERE code = 'en'), 'File Owner'),
('file_owner_person', (SELECT id FROM languages WHERE code = 'de'), 'Dateibesitzer'),
('file_owner_person', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl tulajdonos'),
('file_shared_with_person', (SELECT id FROM languages WHERE code = 'en'), 'Shared with Person'),
('file_shared_with_person', (SELECT id FROM languages WHERE code = 'de'), 'Mit Person geteilt'),
('file_shared_with_person', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva személlyel'),
('file_shared_with_company', (SELECT id FROM languages WHERE code = 'en'), 'Shared with Company'),
('file_shared_with_company', (SELECT id FROM languages WHERE code = 'de'), 'Mit Unternehmen geteilt'),
('file_shared_with_company', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva céggel'),
('file_shared_with_user', (SELECT id FROM languages WHERE code = 'en'), 'Shared with User'),
('file_shared_with_user', (SELECT id FROM languages WHERE code = 'de'), 'Mit Benutzer geteilt'),
('file_shared_with_user', (SELECT id FROM languages WHERE code = 'hu'), 'Megosztva felhasználóval'),
('file_uploaded_by', (SELECT id FROM languages WHERE code = 'en'), 'Uploaded by'),
('file_uploaded_by', (SELECT id FROM languages WHERE code = 'de'), 'Hochgeladen von'),
('file_uploaded_by', (SELECT id FROM languages WHERE code = 'hu'), 'Feltöltötte'),
('file_created_by_user', (SELECT id FROM languages WHERE code = 'en'), 'Created by User'),
('file_created_by_user', (SELECT id FROM languages WHERE code = 'de'), 'Erstellt von Benutzer'),
('file_created_by_user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó által létrehozva'),
('file_assigned_to_user', (SELECT id FROM languages WHERE code = 'en'), 'Assigned to User'),
('file_assigned_to_user', (SELECT id FROM languages WHERE code = 'de'), 'Zugewiesen an Benutzer'),
('file_assigned_to_user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználóhoz rendelve'),
('file_company', (SELECT id FROM languages WHERE code = 'en'), 'Company File'),
('file_company', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmensdatei'),
('file_company', (SELECT id FROM languages WHERE code = 'hu'), 'Cég fájl'),
('file_related', (SELECT id FROM languages WHERE code = 'en'), 'Related File'),
('file_related', (SELECT id FROM languages WHERE code = 'de'), 'Verwandte Datei'),
('file_related', (SELECT id FROM languages WHERE code = 'hu'), 'Kapcsolódó fájl'),
('file_version_of', (SELECT id FROM languages WHERE code = 'en'), 'Version of File'),
('file_version_of', (SELECT id FROM languages WHERE code = 'de'), 'Version der Datei'),
('file_version_of', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl verziója'),
('file_replaces', (SELECT id FROM languages WHERE code = 'en'), 'Replaces File'),
('file_replaces', (SELECT id FROM languages WHERE code = 'de'), 'Ersetzt Datei'),
('file_replaces', (SELECT id FROM languages WHERE code = 'hu'), 'Helyettesíti a fájlt'),
('file_supersedes', (SELECT id FROM languages WHERE code = 'en'), 'Supersedes File'),
('file_supersedes', (SELECT id FROM languages WHERE code = 'de'), 'Ersetzt Datei'),
('file_supersedes', (SELECT id FROM languages WHERE code = 'hu'), 'Felváltja a fájlt'),
('file_attached_to_document', (SELECT id FROM languages WHERE code = 'en'), 'Attached to Document'),
('file_attached_to_document', (SELECT id FROM languages WHERE code = 'de'), 'An Dokument angehängt'),
('file_attached_to_document', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentumhoz csatolva'),
('document_has_file', (SELECT id FROM languages WHERE code = 'en'), 'Has File'),
('document_has_file', (SELECT id FROM languages WHERE code = 'de'), 'Hat Datei'),
('document_has_file', (SELECT id FROM languages WHERE code = 'hu'), 'Tartalmaz fájlt');

-- Now insert object_relation_types (after translations exist)
INSERT INTO object_relation_types (code, is_active, object_type_id) VALUES 
-- Company-Person relationships (object_type_id = company)
('employee', TRUE, (SELECT id FROM object_types WHERE code = 'company')),              -- Company employs Person
('contractor', TRUE, (SELECT id FROM object_types WHERE code = 'company')),            -- Company contracts with Person
('consultant', TRUE, (SELECT id FROM object_types WHERE code = 'company')),            -- Company consults with Person
('board_member', TRUE, (SELECT id FROM object_types WHERE code = 'company')),           -- Person is on Company board
('shareholder', TRUE, (SELECT id FROM object_types WHERE code = 'company')),           -- Person owns shares in Company
('customer', TRUE, (SELECT id FROM object_types WHERE code = 'company')),              -- Person is customer of Company
('supplier', TRUE, (SELECT id FROM object_types WHERE code = 'company')),              -- Person supplies to Company

-- Person-Person relationships (object_type_id = person)
('spouse', TRUE, (SELECT id FROM object_types WHERE code = 'person')),                -- Person is married to Person
('parent', TRUE, (SELECT id FROM object_types WHERE code = 'person')),                -- Person is parent of Person
('child', TRUE, (SELECT id FROM object_types WHERE code = 'person')),                 -- Person is child of Person
('sibling', TRUE, (SELECT id FROM object_types WHERE code = 'person')),               -- Person is sibling of Person
('guardian', TRUE, (SELECT id FROM object_types WHERE code = 'person')),              -- Person is guardian of Person
('emergency_contact', TRUE, (SELECT id FROM object_types WHERE code = 'person')),     -- Person is emergency contact for Person
('family_member', TRUE, (SELECT id FROM object_types WHERE code = 'person')),         -- Person is family member of Person
('friend', TRUE, (SELECT id FROM object_types WHERE code = 'person')),                -- Person is friend of Person
('colleague', TRUE, (SELECT id FROM object_types WHERE code = 'person')),             -- Person is colleague of Person

-- Company-Company relationships (object_type_id = company)
('business_partner', TRUE, (SELECT id FROM object_types WHERE code = 'company')),      -- Company partners with Company
('subsidiary', TRUE, (SELECT id FROM object_types WHERE code = 'company')),            -- Company is subsidiary of Company
('parent_company', TRUE, (SELECT id FROM object_types WHERE code = 'company')),        -- Company is parent of Company
('supplier_company', TRUE, (SELECT id FROM object_types WHERE code = 'company')),      -- Company supplies to Company
('customer_company', TRUE, (SELECT id FROM object_types WHERE code = 'company')),      -- Company is customer of Company
('competitor', TRUE, (SELECT id FROM object_types WHERE code = 'company')),            -- Company competes with Company
('affiliate', TRUE, (SELECT id FROM object_types WHERE code = 'company')),             -- Company is affiliate of Company
('merger_partner', TRUE, (SELECT id FROM object_types WHERE code = 'company')),       -- Company merged with Company

-- User-Object relationships (object_type_id = user)
('user_assigned', TRUE, (SELECT id FROM object_types WHERE code = 'user')),         -- User is assigned to Object
('user_owner', TRUE, (SELECT id FROM object_types WHERE code = 'user')),            -- User owns Object
('user_manager', TRUE, (SELECT id FROM object_types WHERE code = 'user')),          -- User manages Object

-- Document-Object relationships (object_type_id = document)
('document_author', TRUE, (SELECT id FROM object_types WHERE code = 'document')),       -- Person is author of Document
('document_reviewer', TRUE, (SELECT id FROM object_types WHERE code = 'document')),      -- Person/User reviews Document
('document_owner', TRUE, (SELECT id FROM object_types WHERE code = 'document')),         -- Person/User/Company owns Document
('document_shared_with_person', TRUE, (SELECT id FROM object_types WHERE code = 'document')), -- Document shared with Person
('document_shared_with_company', TRUE, (SELECT id FROM object_types WHERE code = 'document')), -- Document shared with Company
('document_shared_with_user', TRUE, (SELECT id FROM object_types WHERE code = 'document')),   -- Document shared with User
('document_created_by_user', TRUE, (SELECT id FROM object_types WHERE code = 'document')),     -- User created Document
('document_assigned_to_user', TRUE, (SELECT id FROM object_types WHERE code = 'document')),    -- Document assigned to User
('document_company', TRUE, (SELECT id FROM object_types WHERE code = 'document')),      -- Document belongs to Company
('document_related', TRUE, (SELECT id FROM object_types WHERE code = 'document')),      -- Document is related to Document
('document_version_of', TRUE, (SELECT id FROM object_types WHERE code = 'document')),   -- Document is version of Document
('document_replaces', TRUE, (SELECT id FROM object_types WHERE code = 'document')),     -- Document replaces Document
('document_supersedes', TRUE, (SELECT id FROM object_types WHERE code = 'document')),   -- Document supersedes Document

-- File-Object relationships (object_type_id = file)
('file_owner_person', TRUE, (SELECT id FROM object_types WHERE code = 'file')),     -- Person owns File
('file_shared_with_person', TRUE, (SELECT id FROM object_types WHERE code = 'file')), -- File shared with Person
('file_shared_with_company', TRUE, (SELECT id FROM object_types WHERE code = 'file')), -- File shared with Company
('file_shared_with_user', TRUE, (SELECT id FROM object_types WHERE code = 'file')),   -- File shared with User
('file_uploaded_by', TRUE, (SELECT id FROM object_types WHERE code = 'file')),      -- Person/User uploaded File
('file_created_by_user', TRUE, (SELECT id FROM object_types WHERE code = 'file')),  -- User created File
('file_assigned_to_user', TRUE, (SELECT id FROM object_types WHERE code = 'file')), -- File assigned to User
('file_company', TRUE, (SELECT id FROM object_types WHERE code = 'file')),          -- File belongs to Company
('file_related', TRUE, (SELECT id FROM object_types WHERE code = 'file')),          -- File is related to File
('file_version_of', TRUE, (SELECT id FROM object_types WHERE code = 'file')),       -- File is version of File
('file_replaces', TRUE, (SELECT id FROM object_types WHERE code = 'file')),         -- File replaces File
('file_supersedes', TRUE, (SELECT id FROM object_types WHERE code = 'file')),       -- File supersedes File
('file_attached_to_document', TRUE, (SELECT id FROM object_types WHERE code = 'file')), -- File attached to Document
('document_has_file', TRUE, (SELECT id FROM object_types WHERE code = 'document'));     -- Document has File

-- ============================================================================
-- SECTION 15: OBJECT RELATIONS (Example Data)
-- ============================================================================
-- Note: These are example relationships. In production, you would insert actual
-- object IDs after creating objects. The examples below show the structure.
-- 
-- Example usage:
-- INSERT INTO object_relations (object_from_id, object_to_id, object_relation_type_id, note, is_active) VALUES
-- ((SELECT id FROM companies WHERE company_id = 'REG-12345'), 
--  (SELECT id FROM persons WHERE first_name = 'John' AND last_name = 'Doe'),
--  (SELECT id FROM object_relation_types WHERE code = 'employee'),
--  'Full-time employee since 2020', TRUE);

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================


-- ============================================================================
-- INSTALLATION COMPLETE
-- ============================================================================
-- Database schema and seed data have been successfully installed.
-- You can now start using the database.
