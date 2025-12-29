-- ============================================================================
-- Delete All Object Relation Types and Their Translations
-- ============================================================================
-- File: DELETE_ALL_OBJECT_RELATION_TYPES.sql
-- Purpose: Delete all records from object_relation_types table and their 
--          associated translations
-- Usage: Execute this file to remove all object relation types
-- WARNING: This will delete ALL object relation types and their translations!
--          Make sure to backup your database before running this script.
-- ============================================================================

-- Step 1: Store all codes from object_relation_types in a temporary table
-- This allows us to reference them after deleting from object_relation_types
CREATE TEMPORARY TABLE IF NOT EXISTS temp_ort_codes AS
SELECT code FROM &;

-- Step 2: Store all IDs from object_relation_types in a temporary table
-- This allows us to reference them for deleting object_relations
CREATE TEMPORARY TABLE IF NOT EXISTS temp_ort_ids AS
SELECT id FROM object_relation_types;

-- Disable foreign key checks temporarily to allow deletion
SET FOREIGN_KEY_CHECKS = 0;

-- Step 3: Delete all object_relations that reference object_relation_types
-- This is necessary because object_relations has a foreign key constraint
-- on object_relation_type_id with ON DELETE RESTRICT
DELETE FROM object_relations 
WHERE object_relation_type_id IN (SELECT id FROM temp_ort_ids);

-- Step 4: Delete all object relation types
DELETE FROM object_relation_types;

-- Step 5: Delete all translations for object relation type codes
-- Using the temporary table to avoid foreign key constraint issues
DELETE FROM translations 
WHERE code IN (SELECT code FROM temp_ort_codes);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Clean up temporary tables
DROP TEMPORARY TABLE IF EXISTS temp_ort_codes;
DROP TEMPORARY TABLE IF EXISTS temp_ort_ids;

-- ============================================================================
-- Verification Query (optional - uncomment to check results)
-- ============================================================================
-- SELECT COUNT(*) as remaining_object_relation_types 
-- FROM object_relation_types;
-- 
-- SELECT COUNT(*) as remaining_translations_for_ort_codes
-- FROM translations 
-- WHERE code IN (SELECT code FROM object_relation_types);
-- ============================================================================

