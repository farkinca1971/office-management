-- ============================================================================
-- Alter Object Relation Types Table
-- ============================================================================
-- File: ALTER_OBJECT_RELATION_TYPES.sql
-- Purpose: Modify object_relation_types table structure:
--          1. Rename object_type_id to parent_object_id (change FK to objects table)
--          2. Add child_object_id column referencing objects table
--          3. Add mirrored_type_id column self-referencing this table
-- Usage: Execute EACH STEP SEPARATELY (not all at once!)
-- 
-- IMPORTANT: Run each step ONE AT A TIME
-- ============================================================================

-- ============================================================================
-- STEP 1: Find the foreign key constraint name on object_type_id
-- ============================================================================
-- Run this query FIRST to find the constraint name:
SHOW CREATE TABLE object_relation_types;

-- Look for a line like:
-- CONSTRAINT `object_relation_types_ibfk_2` FOREIGN KEY (`object_type_id`) REFERENCES `object_types` (`id`)
-- The constraint name is the value in backticks after CONSTRAINT
-- Common names: 'object_relation_types_ibfk_2', 'object_relation_types_ibfk_1', etc.

-- Alternative query to find constraint name:
-- SELECT CONSTRAINT_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = DATABASE() 
--     AND TABLE_NAME = 'object_relation_types' 
--     AND COLUMN_NAME = 'object_type_id' 
--     AND REFERENCED_TABLE_NAME = 'object_types';

-- ============================================================================
-- STEP 2: Disable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- STEP 3: Drop the foreign key constraint on object_type_id
-- ============================================================================
-- IMPORTANT: Replace 'object_relation_types_ibfk_2' with the actual constraint name from STEP 1
-- If the constraint doesn't exist, skip this step
ALTER TABLE object_relation_types 
DROP FOREIGN KEY object_relation_types_ibfk_2;

-- ============================================================================
-- STEP 4: Drop the index on object_type_id
-- ============================================================================
-- If index doesn't exist, this will generate a warning but won't fail
ALTER TABLE object_relation_types 
DROP INDEX idx_object_type_id;

-- ============================================================================
-- STEP 5: Rename object_type_id column to parent_object_id
-- ============================================================================
-- This changes the column name and data type from INT to BIGINT
-- to match the objects.id column type
ALTER TABLE object_relation_types 
CHANGE COLUMN object_type_id parent_object_id BIGINT COMMENT 'Parent object ID this relation applies to (references objects.id)';

-- ============================================================================
-- STEP 6: Add foreign key constraint for parent_object_id to objects table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD CONSTRAINT fk_ort_parent_object 
FOREIGN KEY (parent_object_id) REFERENCES objects(id) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 7: Add index for parent_object_id
-- ============================================================================
ALTER TABLE object_relation_types 
ADD INDEX idx_parent_object_id (parent_object_id);

-- ============================================================================
-- STEP 8: Add child_object_id column referencing objects table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD COLUMN child_object_id BIGINT COMMENT 'Child object ID this relation applies to (references objects.id)';

-- ============================================================================
-- STEP 9: Add foreign key constraint for child_object_id to objects table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD CONSTRAINT fk_ort_child_object 
FOREIGN KEY (child_object_id) REFERENCES objects(id) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 10: Add index for child_object_id
-- ============================================================================
ALTER TABLE object_relation_types 
ADD INDEX idx_child_object_id (child_object_id);

-- ============================================================================
-- STEP 11: Add mirrored_type_id column self-referencing this table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD COLUMN mirrored_type_id INT COMMENT 'Mirrored relation type ID (references object_relation_types.id)';

-- ============================================================================
-- STEP 12: Add foreign key constraint for mirrored_type_id (self-reference)
-- ============================================================================
ALTER TABLE object_relation_types 
ADD CONSTRAINT fk_ort_mirrored_type 
FOREIGN KEY (mirrored_type_id) REFERENCES object_relation_types(id) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 13: Add index for mirrored_type_id
-- ============================================================================
ALTER TABLE object_relation_types 
ADD INDEX idx_mirrored_type_id (mirrored_type_id);

-- ============================================================================
-- STEP 14: Re-enable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- STEP 15: Verify the changes
-- ============================================================================
-- Check the table structure to confirm all changes:
SHOW CREATE TABLE object_relation_types;

-- Or use DESCRIBE to see column details:
DESCRIBE object_relation_types;

-- Expected columns after migration:
-- - id (INT, PRIMARY KEY)
-- - code (VARCHAR(30), UNIQUE)
-- - is_active (BOOLEAN)
-- - parent_object_id (BIGINT, FK to objects.id) - renamed from object_type_id
-- - child_object_id (BIGINT, FK to objects.id) - NEW
-- - mirrored_type_id (INT, FK to object_relation_types.id) - NEW
-- ============================================================================

