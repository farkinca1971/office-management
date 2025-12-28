-- ============================================================================
-- ALTER TABLE: Increase audit_actions.code column size (MANUAL VERSION)
-- ============================================================================
-- File: ALTER_AUDIT_ACTIONS_CODE_COLUMN_MANUAL.sql
-- Purpose: Manual step-by-step instructions to increase code column size
-- Usage: Execute EACH STEP SEPARATELY in phpMyAdmin (not all at once!)
-- ============================================================================

-- ============================================================================
-- STEP 1: Find the foreign key constraint name
-- ============================================================================
SHOW CREATE TABLE audit_actions;

-- Look for a line like:
-- CONSTRAINT `audit_actions_ibfk_2` FOREIGN KEY (`code`) REFERENCES `translations` (`code`)
-- The constraint name is the value in backticks after CONSTRAINT

-- ============================================================================
-- STEP 2: Disable foreign key checks
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- STEP 3: Drop the foreign key constraint
-- ============================================================================
-- Replace 'audit_actions_ibfk_2' with the actual constraint name from STEP 1
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
SHOW CREATE TABLE audit_actions;
