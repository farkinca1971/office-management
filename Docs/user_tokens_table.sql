-- ----------------------------------------------------------------------------
-- User Tokens: JWT token storage and management
-- ----------------------------------------------------------------------------
-- This table stores authentication tokens (JWT) for users
-- Supports token blacklisting, refresh tokens, and multi-device sessions
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
-- Alternative: Simpler token blacklist table (if you only need blacklisting)
-- ----------------------------------------------------------------------------
-- Use this if you don't need to track all tokens, just blacklisted ones
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
-- Usage Examples and Queries
-- ----------------------------------------------------------------------------

-- Example 1: Store a new token after login
-- INSERT INTO user_tokens (
--     user_id,
--     token_hash,
--     token_type,
--     device_info,
--     ip_address,
--     user_agent,
--     expires_at
-- ) VALUES (
--     123,  -- user_id
--     SHA2('your_jwt_token_here', 256),  -- Hash the token for storage
--     'access',
--     'Chrome on Windows',
--     '192.168.1.1',
--     'Mozilla/5.0...',
--     DATE_ADD(NOW(), INTERVAL 24 HOUR)  -- Expires in 24 hours
-- );

-- Example 2: Check if token is valid (not revoked and not expired)
-- SELECT 
--     ut.id,
--     ut.user_id,
--     ut.token_type,
--     ut.is_active,
--     ut.expires_at
-- FROM user_tokens ut
-- WHERE ut.token_hash = SHA2(?, 256)  -- Replace ? with actual token
--     AND ut.is_active = TRUE
--     AND ut.expires_at > NOW();

-- Example 3: Revoke a token (logout)
-- UPDATE user_tokens
-- SET 
--     is_active = FALSE,
--     revoked_at = NOW(),
--     revoked_reason = 'user_logout'
-- WHERE token_hash = SHA2(?, 256);

-- Example 4: Revoke all tokens for a user (logout from all devices)
-- UPDATE user_tokens
-- SET 
--     is_active = FALSE,
--     revoked_at = NOW(),
--     revoked_reason = 'logout_all_devices'
-- WHERE user_id = ? AND is_active = TRUE;

-- Example 5: Clean up expired tokens (run as scheduled job)
-- DELETE FROM user_tokens
-- WHERE expires_at < NOW() AND is_active = FALSE;

-- Example 6: Get active tokens for a user
-- SELECT 
--     ut.id,
--     ut.token_type,
--     ut.device_info,
--     ut.ip_address,
--     ut.created_at,
--     ut.last_used_at,
--     ut.expires_at
-- FROM user_tokens ut
-- WHERE ut.user_id = ?
--     AND ut.is_active = TRUE
--     AND ut.expires_at > NOW()
-- ORDER BY ut.created_at DESC;

-- Example 7: Update last_used_at when token is used
-- UPDATE user_tokens
-- SET last_used_at = NOW()
-- WHERE token_hash = SHA2(?, 256) AND is_active = TRUE;

-- Example 8: Blacklist a token (using blacklist table)
-- INSERT INTO token_blacklist (
--     token_hash,
--     user_id,
--     expires_at,
--     reason
-- ) VALUES (
--     SHA2(?, 256),
--     123,
--     DATE_ADD(NOW(), INTERVAL 24 HOUR),
--     'user_logout'
-- );

-- Example 9: Check if token is blacklisted
-- SELECT COUNT(*) as is_blacklisted
-- FROM token_blacklist
-- WHERE token_hash = SHA2(?, 256)
--     AND expires_at > NOW();

-- Example 10: Clean up expired blacklist entries
-- DELETE FROM token_blacklist
-- WHERE expires_at < NOW();

