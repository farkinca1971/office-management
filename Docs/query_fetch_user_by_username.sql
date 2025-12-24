-- ============================================================================
-- USER QUERIES: Fetch, Create, and Update Operations
-- ============================================================================
-- This file contains SQL queries for user management operations including:
-- - Fetching active users with active passwords
-- - Fetching user by username
-- - Creating new users
-- - Updating user information and passwords
-- ============================================================================

-- ----------------------------------------------------------------------------
-- FETCH QUERIES
-- ----------------------------------------------------------------------------

-- Query 1: Fetch ALL active users with active passwords
-- Returns all users that have object_status = 'user_active' and password is_active = TRUE
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    up.password_hash,
    up.is_active AS password_active,
    up.created_at AS password_created_at,
    up.updated_at AS password_updated_at
FROM 
    users u
INNER JOIN 
    objects o ON u.id = o.id
INNER JOIN 
    object_statuses os ON o.object_status_id = os.id
INNER JOIN 
    user_passwords up ON u.id = up.user_id
WHERE 
    os.code = 'user_active'
    AND up.is_active = TRUE
ORDER BY 
    u.username;

-- Query 2: Fetch user by username (with active status check)
-- Returns user only if both user status is active and password is active
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    up.password_hash,
    up.is_active AS password_active,
    up.created_at AS password_created_at,
    up.updated_at AS password_updated_at
FROM 
    users u
INNER JOIN 
    objects o ON u.id = o.id
INNER JOIN 
    object_statuses os ON o.object_status_id = os.id
INNER JOIN 
    user_passwords up ON u.id = up.user_id
WHERE 
    u.username = ?  -- Replace ? with the username parameter
    AND os.code = 'user_active'
    AND up.is_active = TRUE;

-- Query 3: Fetch user by username (without status check - returns any user)
-- Use this if you want to fetch user regardless of status
SELECT 
    u.id,
    u.username,
    o.object_type_id,
    o.object_status_id,
    os.code AS status_code,
    up.password_hash,
    up.is_active AS password_active,
    up.created_at AS password_created_at,
    up.updated_at AS password_updated_at
FROM 
    users u
INNER JOIN 
    objects o ON u.id = o.id
LEFT JOIN 
    object_statuses os ON o.object_status_id = os.id
LEFT JOIN 
    user_passwords up ON u.id = up.user_id AND up.is_active = TRUE
WHERE 
    u.username = ?;  -- Replace ? with the username parameter

-- ----------------------------------------------------------------------------
-- CREATE/INSERT QUERIES
-- ----------------------------------------------------------------------------

-- Query 4: Create a new user (complete transaction)
-- Note: This requires knowing the object_type_id for 'user' and object_status_id for 'user_active'
-- You may need to look up these IDs first or use subqueries

-- Step 4a: Insert into objects table first (returns the generated ID)
INSERT INTO objects (object_type_id, object_status_id)
VALUES (
    (SELECT id FROM object_types WHERE code = 'user'),
    (SELECT id FROM object_statuses WHERE code = 'user_active')
);

-- Step 4b: Insert into users table (use LAST_INSERT_ID() or the returned ID from step 4a)
INSERT INTO users (id, username)
VALUES (
    LAST_INSERT_ID(),  -- Or use the ID returned from objects insert
    ?  -- Replace ? with the username
);

-- Step 4c: Insert into user_passwords table
INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (
    LAST_INSERT_ID(),  -- Or use the user ID from step 4b
    ?,  -- Replace ? with the hashed password
    TRUE
);

-- Query 5: Create user in a single transaction (using stored procedure or transaction)
-- This is a complete example that can be wrapped in a transaction:
START TRANSACTION;

SET @object_id = NULL;
SET @user_type_id = (SELECT id FROM object_types WHERE code = 'user');
SET @active_status_id = (SELECT id FROM object_statuses WHERE code = 'user_active');

INSERT INTO objects (object_type_id, object_status_id)
VALUES (@user_type_id, @active_status_id);

SET @object_id = LAST_INSERT_ID();

INSERT INTO users (id, username)
VALUES (@object_id, ?);  -- Replace ? with username

INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (@object_id, ?, TRUE);  -- Replace ? with hashed password

COMMIT;

-- Query 6: Create user password only (if user already exists)
INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (
    ?,  -- Replace ? with the user_id
    ?,  -- Replace ? with the hashed password
    TRUE
);

-- ----------------------------------------------------------------------------
-- UPDATE QUERIES
-- ----------------------------------------------------------------------------

-- Query 7: Update user username
UPDATE users
SET username = ?  -- Replace ? with the new username
WHERE id = ?;  -- Replace ? with the user_id

-- Query 8: Update user password (deactivate old, create new)
-- Step 8a: Deactivate current active password
UPDATE user_passwords
SET is_active = FALSE
WHERE user_id = ?  -- Replace ? with the user_id
    AND is_active = TRUE;

-- Step 8b: Insert new active password
INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (
    ?,  -- Replace ? with the user_id
    ?,  -- Replace ? with the new hashed password
    TRUE
);

-- Query 9: Update user password in a single transaction
START TRANSACTION;

UPDATE user_passwords
SET is_active = FALSE
WHERE user_id = ?  -- Replace ? with the user_id
    AND is_active = TRUE;

INSERT INTO user_passwords (user_id, password_hash, is_active)
VALUES (?, ?, TRUE);  -- Replace ? with user_id and new hashed password

COMMIT;

-- Query 10: Update user status (activate/deactivate user)
UPDATE objects
SET object_status_id = (
    SELECT id FROM object_statuses 
    WHERE code = ?  -- Replace ? with 'user_active', 'user_inactive', 'user_locked', etc.
    AND object_type_id = (SELECT id FROM object_types WHERE code = 'user')
)
WHERE id = ?;  -- Replace ? with the user_id

-- Query 11: Deactivate user password (soft delete)
UPDATE user_passwords
SET is_active = FALSE
WHERE user_id = ?  -- Replace ? with the user_id
    AND is_active = TRUE;

-- Query 12: Reactivate a specific password
UPDATE user_passwords
SET is_active = TRUE
WHERE user_id = ?  -- Replace ? with the user_id
    AND id = ?;  -- Replace ? with the specific password record id (if you have password history)

-- ----------------------------------------------------------------------------
-- HELPER QUERIES
-- ----------------------------------------------------------------------------

-- Query 13: Get object_type_id for 'user'
SELECT id FROM object_types WHERE code = 'user';

-- Query 14: Get object_status_id for 'user_active'
SELECT id FROM object_statuses 
WHERE code = 'user_active' 
    AND object_type_id = (SELECT id FROM object_types WHERE code = 'user');

-- Query 15: Check if username exists
SELECT COUNT(*) as user_count
FROM users
WHERE username = ?;  -- Replace ? with the username

-- Query 16: Get user password history (all passwords for a user)
SELECT 
    user_id,
    password_hash,
    is_active,
    created_at,
    updated_at
FROM user_passwords
WHERE user_id = ?  -- Replace ? with the user_id
ORDER BY created_at DESC;
