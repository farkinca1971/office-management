# User Tokens Table Reference

This document describes the database tables for managing JWT authentication tokens.

## Table: `user_tokens`

**Purpose**: Stores JWT tokens for authentication, session management, and token revocation.

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key, auto-increment |
| `user_id` | BIGINT | Foreign key to `users.id` |
| `token_hash` | VARCHAR(255) | SHA-256 hash of the JWT token |
| `token_type` | VARCHAR(50) | Token type: 'access', 'refresh', 'api_key' |
| `device_info` | VARCHAR(255) | Optional device/browser info |
| `ip_address` | VARCHAR(45) | IP address where token was issued |
| `user_agent` | TEXT | User agent string from request |
| `is_active` | BOOLEAN | Whether token is active (not revoked) |
| `expires_at` | TIMESTAMP | Token expiration timestamp |
| `created_at` | TIMESTAMP | When token was created |
| `last_used_at` | TIMESTAMP | Last time token was used |
| `revoked_at` | TIMESTAMP | When token was revoked |
| `revoked_reason` | VARCHAR(255) | Reason for revocation |

### Indexes

- `idx_user_id` - Fast lookup by user
- `idx_token_hash` - Fast token validation
- `idx_expires_at` - Cleanup expired tokens
- `idx_is_active` - Filter active tokens
- `idx_user_active` - Composite index for user + active status
- `idx_created_at` - Sort by creation date

## Table: `token_blacklist`

**Purpose**: Simple blacklist for revoked tokens (alternative to `user_tokens`).

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT | Primary key, auto-increment |
| `token_hash` | VARCHAR(255) | SHA-256 hash of the token (UNIQUE) |
| `user_id` | BIGINT | User ID (optional, for cleanup) |
| `expires_at` | TIMESTAMP | When token expires |
| `blacklisted_at` | TIMESTAMP | When token was blacklisted |
| `reason` | VARCHAR(255) | Reason for blacklisting |

### When to Use Which Table

**Use `user_tokens` if you need:**
- Track all tokens per user
- Multi-device session management
- Device information tracking
- Last used timestamp
- Detailed revocation tracking

**Use `token_blacklist` if you need:**
- Simple token revocation
- Minimal storage overhead
- Only blacklist revoked tokens
- Don't need to track all active tokens

## Common Queries

### 1. Store Token After Login

```sql
INSERT INTO user_tokens (
    user_id,
    token_hash,
    token_type,
    device_info,
    ip_address,
    user_agent,
    expires_at
) VALUES (
    123,
    SHA2('your_jwt_token_here', 256),
    'access',
    'Chrome on Windows',
    '192.168.1.1',
    'Mozilla/5.0...',
    DATE_ADD(NOW(), INTERVAL 24 HOUR)
);
```

### 2. Validate Token

```sql
SELECT 
    ut.id,
    ut.user_id,
    ut.token_type,
    ut.is_active,
    ut.expires_at
FROM user_tokens ut
WHERE ut.token_hash = SHA2(?, 256)
    AND ut.is_active = TRUE
    AND ut.expires_at > NOW();
```

### 3. Revoke Token (Logout)

```sql
UPDATE user_tokens
SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_reason = 'user_logout'
WHERE token_hash = SHA2(?, 256);
```

### 4. Revoke All User Tokens (Logout All Devices)

```sql
UPDATE user_tokens
SET 
    is_active = FALSE,
    revoked_at = NOW(),
    revoked_reason = 'logout_all_devices'
WHERE user_id = ? AND is_active = TRUE;
```

### 5. Update Last Used Timestamp

```sql
UPDATE user_tokens
SET last_used_at = NOW()
WHERE token_hash = SHA2(?, 256) AND is_active = TRUE;
```

### 6. Get Active Sessions for User

```sql
SELECT 
    ut.id,
    ut.token_type,
    ut.device_info,
    ut.ip_address,
    ut.created_at,
    ut.last_used_at,
    ut.expires_at
FROM user_tokens ut
WHERE ut.user_id = ?
    AND ut.is_active = TRUE
    AND ut.expires_at > NOW()
ORDER BY ut.created_at DESC;
```

### 7. Cleanup Expired Tokens (Scheduled Job)

```sql
DELETE FROM user_tokens
WHERE expires_at < NOW() AND is_active = FALSE;
```

### 8. Blacklist Token (Using Blacklist Table)

```sql
INSERT INTO token_blacklist (
    token_hash,
    user_id,
    expires_at,
    reason
) VALUES (
    SHA2(?, 256),
    123,
    DATE_ADD(NOW(), INTERVAL 24 HOUR),
    'user_logout'
);
```

### 9. Check if Token is Blacklisted

```sql
SELECT COUNT(*) as is_blacklisted
FROM token_blacklist
WHERE token_hash = SHA2(?, 256)
    AND expires_at > NOW();
```

## n8n Implementation

### Store Token After Login

1. **Code Node** - Hash the token:
```javascript
const token = $input.all()[0].json.data.token;
const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

return {
  json: {
    user_id: $input.all()[0].json.data.user.id,
    token_hash: tokenHash,
    token_type: 'access',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    device_info: $input.all()[0].json.headers['user-agent'] || '',
    ip_address: $input.all()[0].json.headers['x-forwarded-for'] || '',
  }
};
```

2. **MySQL Node** - Insert token:
```sql
INSERT INTO user_tokens (
    user_id,
    token_hash,
    token_type,
    device_info,
    ip_address,
    expires_at
) VALUES (
    {{ $json.user_id }},
    '{{ $json.token_hash }}',
    '{{ $json.token_type }}',
    '{{ $json.device_info }}',
    '{{ $json.ip_address }}',
    '{{ $json.expires_at }}'
);
```

### Validate Token in /auth/me

1. **Code Node** - Extract and hash token:
```javascript
const authHeader = $input.all()[0].json.headers?.authorization || '';
const token = authHeader.replace('Bearer ', '');
const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');

return {
  json: {
    token_hash: tokenHash
  }
};
```

2. **MySQL Node** - Validate token:
```sql
SELECT 
    ut.user_id,
    ut.is_active,
    ut.expires_at
FROM user_tokens ut
WHERE ut.token_hash = '{{ $json.token_hash }}'
    AND ut.is_active = TRUE
    AND ut.expires_at > NOW();
```

3. **Code Node** - Update last_used_at:
```sql
UPDATE user_tokens
SET last_used_at = NOW()
WHERE token_hash = '{{ $json.token_hash }}';
```

## Security Notes

1. **Never store full tokens** - Always hash tokens before storing
2. **Use SHA-256** - For token hashing
3. **Set expiration** - Always set reasonable expiration times
4. **Cleanup regularly** - Delete expired tokens periodically
5. **Track IP/Device** - For security monitoring
6. **Revoke on logout** - Always mark tokens as inactive on logout

## Token Types

- **access** - Short-lived access token (15 min - 24 hours)
- **refresh** - Long-lived refresh token (7-30 days)
- **api_key** - Permanent API key for service accounts

## Best Practices

1. Store token hash, not the actual token
2. Set appropriate expiration times
3. Clean up expired tokens regularly
4. Track device/IP for security
5. Support "logout all devices" functionality
6. Monitor token usage patterns

