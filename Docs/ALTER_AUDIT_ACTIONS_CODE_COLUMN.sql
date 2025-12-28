-- ============================================================================
-- ALTER TABLE: Increase audit_actions.code column size
-- ============================================================================
-- File: ALTER_AUDIT_ACTIONS_CODE_COLUMN.sql
-- Purpose: Increase the code column size from VARCHAR(30) to VARCHAR(50)
--          to accommodate longer audit action codes like USER_CREATE_OBJECT_RELATION_TYPES
-- Usage: Execute EACH STEP SEPARATELY in phpMyAdmin (not all at once!)
-- 
-- IMPORTANT: Run each step ONE AT A TIME in phpMyAdmin
-- ============================================================================

-- ============================================================================
-- STEP 1: Find the foreign key constraint name
-- ============================================================================
-- Run this query FIRST to see the table structure and find the constraint name:
SHOW CREATE TABLE audit_actions;

-- Look for a line like:
-- CONSTRAINT `audit_actions_ibfk_2` FOREIGN KEY (`code`) REFERENCES `translations` (`code`)
-- The constraint name is the value in backticks after CONSTRAINT (e.g., audit_actions_ibfk_2)

-- ============================================================================
-- STEP 2: Disable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- STEP 3: Drop the foreign key constraint
-- ============================================================================
-- IMPORTANT: Replace 'audit_actions_ibfk_2' with the actual constraint name from STEP 1
-- Common names: 'audit_actions_ibfk_2', 'audit_actions_ibfk_1', '2', etc.
ALTER TABLE audit_actions DROP FOREIGN KEY audit_actions_ibfk_2;

-- ============================================================================
-- STEP 4: Modify the column size
-- ============================================================================
ALTER TABLE audit_actions 
MODIFY COLUMN code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Action code (e.g., CREATE_PERSON, UPDATE_COMPANY, USER_CREATE_OBJECT_TYPES)';

-- ============================================================================
-- STEP 5: Re-add the foreign key constraint
-- ============================================================================
ALTER TABLE audit_actions 
ADD CONSTRAINT audit_actions_code_fk 
FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT;

-- ============================================================================
-- STEP 6: Re-enable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- STEP 7: Verify the change
-- ============================================================================
-- Check the table structure to confirm the change:
SHOW CREATE TABLE audit_actions;

-- Or use phpMyAdmin: click on Structure tab to see the column is now VARCHAR(50)
