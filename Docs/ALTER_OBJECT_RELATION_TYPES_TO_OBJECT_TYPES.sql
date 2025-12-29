-- ============================================================================
-- Alter Object Relation Types Table - Change to Reference object_types
-- ============================================================================
-- File: ALTER_OBJECT_RELATION_TYPES_TO_OBJECT_TYPES.sql
-- Purpose: Modify object_relation_types table structure:
--          1. Rename parent_object_id to parent_object_type_id (change FK to object_types)
--          2. Rename child_object_id to child_object_type_id (change FK to object_types)
--          3. Change data type from BIGINT to INT
-- Usage: Execute EACH STEP SEPARATELY (not all at once!)
-- 
-- IMPORTANT: Run each step ONE AT A TIME
-- ============================================================================

-- ============================================================================
-- STEP 1: Find the foreign key constraint names
-- ============================================================================
-- Run this query FIRST to find the constraint names:
SHOW CREATE TABLE object_relation_types;

-- Look for lines like:
-- CONSTRAINT `fk_ort_parent_object` FOREIGN KEY (`parent_object_id`) REFERENCES `objects` (`id`)
-- CONSTRAINT `fk_ort_child_object` FOREIGN KEY (`child_object_id`) REFERENCES `objects` (`id`)
-- The constraint names are the values in backticks after CONSTRAINT

-- Alternative query to find constraint names:
-- SELECT CONSTRAINT_NAME 
-- FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
-- WHERE TABLE_SCHEMA = DATABASE() 
--     AND TABLE_NAME = 'object_relation_types' 
--     AND COLUMN_NAME IN ('parent_object_id', 'child_object_id')
--     AND REFERENCED_TABLE_NAME = 'objects';

-- ============================================================================
-- STEP 2: Disable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- STEP 3: Drop the foreign key constraint on parent_object_id
-- ============================================================================
-- IMPORTANT: Replace 'fk_ort_parent_object' with the actual constraint name from STEP 1
-- Common names: 'fk_ort_parent_object', 'object_relation_types_ibfk_2', etc.
ALTER TABLE object_relation_types 
DROP FOREIGN KEY fk_ort_parent_object;

-- ============================================================================
-- STEP 4: Drop the foreign key constraint on child_object_id
-- ============================================================================
-- IMPORTANT: Replace 'fk_ort_child_object' with the actual constraint name from STEP 1
ALTER TABLE object_relation_types 
DROP FOREIGN KEY fk_ort_child_object;

-- ============================================================================
-- STEP 5: Drop the indexes on parent_object_id and child_object_id
-- ============================================================================
ALTER TABLE object_relation_types 
DROP INDEX idx_parent_object_id;

ALTER TABLE object_relation_types 
DROP INDEX idx_child_object_id;

-- ============================================================================
-- STEP 6: Rename parent_object_id to parent_object_type_id and change to INT
-- ============================================================================
-- This changes the column name and data type from BIGINT to INT
-- to match the object_types.id column type
ALTER TABLE object_relation_types 
CHANGE COLUMN parent_object_id parent_object_type_id INT COMMENT 'Parent object type ID this relation applies to (references object_types.id)';

-- ============================================================================
-- STEP 7: Rename child_object_id to child_object_type_id and change to INT
-- ============================================================================
ALTER TABLE object_relation_types 
CHANGE COLUMN child_object_id child_object_type_id INT COMMENT 'Child object type ID this relation applies to (references object_types.id)';

-- ============================================================================
-- STEP 8: Add foreign key constraint for parent_object_type_id to object_types table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD CONSTRAINT fk_ort_parent_object_type 
FOREIGN KEY (parent_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 9: Add foreign key constraint for child_object_type_id to object_types table
-- ============================================================================
ALTER TABLE object_relation_types 
ADD CONSTRAINT fk_ort_child_object_type 
FOREIGN KEY (child_object_type_id) REFERENCES object_types(id) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 10: Add index for parent_object_type_id
-- ============================================================================
ALTER TABLE object_relation_types 
ADD INDEX idx_parent_object_type_id (parent_object_type_id);

-- ============================================================================
-- STEP 11: Add index for child_object_type_id
-- ============================================================================
ALTER TABLE object_relation_types 
ADD INDEX idx_child_object_type_id (child_object_type_id);

-- ============================================================================
-- STEP 12: Re-enable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- STEP 13: Verify the changes
-- ============================================================================
-- Check the table structure to confirm all changes:
SHOW CREATE TABLE object_relation_types;

-- Or use DESCRIBE to see column details:
DESCRIBE object_relation_types;

-- Expected columns after migration:
-- - id (INT, PRIMARY KEY)
-- - code (VARCHAR(30), UNIQUE)
-- - is_active (BOOLEAN)
-- - parent_object_type_id (INT, FK to object_types.id) - renamed from parent_object_id
-- - child_object_type_id (INT, FK to object_types.id) - renamed from child_object_id
-- - mirrored_type_id (INT, FK to object_relation_types.id)
-- ============================================================================

