-- ============================================================================
-- Object Relation Types Table - New Schema
-- ============================================================================
-- This file shows the new structure of the object_relation_types table
-- after the modifications:
--   1. Renamed object_type_id to parent_object_type_id (INT, FK to object_types.id)
--   2. Added child_object_type_id (INT, FK to object_types.id)
--   3. Added mirrored_type_id (INT, FK to object_relation_types.id)
-- ============================================================================

CREATE TABLE object_relation_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL COMMENT 'Relation type code (e.g., mother, son, employer, worker, spouse)',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this relation type is currently active',
    parent_object_type_id INT COMMENT 'Parent object type ID this relation applies to (references object_types.id)',
    child_object_type_id INT COMMENT 'Child object type ID this relation applies to (references object_types.id)',
    mirrored_type_id INT COMMENT 'Mirrored relation type ID (references object_relation_types.id)',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (parent_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (child_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (mirrored_type_id) REFERENCES object_relation_types(id) ON DELETE RESTRICT,
    INDEX idx_parent_object_type_id (parent_object_type_id),
    INDEX idx_child_object_type_id (child_object_type_id),
    INDEX idx_mirrored_type_id (mirrored_type_id)
);

-- ============================================================================
-- Column Summary:
-- ============================================================================
-- id                      : INT, PRIMARY KEY, AUTO_INCREMENT
-- code                    : VARCHAR(30), UNIQUE, NOT NULL, FK to translations.code
-- is_active               : BOOLEAN, DEFAULT TRUE
-- parent_object_type_id    : INT, NULLABLE, FK to object_types.id (renamed from object_type_id)
-- child_object_type_id     : INT, NULLABLE, FK to object_types.id (NEW COLUMN)
-- mirrored_type_id        : INT, NULLABLE, FK to object_relation_types.id (NEW - self-reference)
-- ============================================================================

-- ============================================================================
-- Changes from Previous Schema:
-- ============================================================================
-- OLD: object_type_id INT, FK to object_types.id
-- NEW: parent_object_type_id INT, FK to object_types.id (renamed and repurposed)
--      child_object_type_id INT, FK to object_types.id (NEW COLUMN)
--      mirrored_type_id INT, FK to object_relation_types.id (NEW COLUMN)
-- ============================================================================

-- ============================================================================
-- Example Relationships:
-- ============================================================================
-- Family (Person → Person):
--   - mother → son (mirrored by son → mother)
--   - father → daughter (mirrored by daughter → father)
--   - parent → child (mirrored by child → parent)
--
-- Business (Company → Person):
--   - employer → worker (mirrored by worker → employer)
--
-- Symmetric (self-mirrored):
--   - spouse (Person → Person)
--   - sibling (Person → Person)
--   - friend (Person → Person)
--   - colleague (Person → Person)
--   - business_partner (Company → Company)
-- ============================================================================

