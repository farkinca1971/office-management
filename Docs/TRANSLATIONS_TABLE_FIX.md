# Fix: translations Table Creation Order

## Problem Verified ✅

The `translations` table **IS defined** in `install.sql` at **line 321-330**, but it's created **AFTER** tables that reference it:

- **Line 154**: `documents` table references `translations(code)`
- **Line 196**: `products` table references `translations(code)`  
- **Line 318**: `transactions` table references `translations(code)`
- **Line 321**: `translations` table is finally created ❌

## Impact

When MySQL tries to execute `install.sql`, it will fail with foreign key errors:
```
ERROR 1215 (HY000): Cannot add foreign key constraint
```

This happens because:
1. MySQL tries to create `documents` table with FK to `translations(code)` 
2. But `translations` table doesn't exist yet
3. Foreign key creation fails

## Solution

**Move the `translations` table creation to BEFORE the tables that reference it.**

### Current Location (WRONG):
```sql
-- Line 321-330 (at the end, after transactions table)
CREATE TABLE translations (
    code VARCHAR(100) NOT NULL,
    language_id INT NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (code, language_id),
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_language_id (language_id),
    INDEX idx_code_language (code, language_id)
);
```

### Correct Location:
The `translations` table should be created **after `currencies` (line 78-82) and before `audit_actions` (line 85)**.

**Insert at line 83** (right after currencies table):

```sql
-- After currencies table (line 82)
CREATE TABLE currencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ADD translations table HERE (after line 82)
CREATE TABLE translations (
    code VARCHAR(100) NOT NULL,
    language_id INT NOT NULL,
    text TEXT NOT NULL,
    PRIMARY KEY (code, language_id),
    FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_language_id (language_id),
    INDEX idx_code_language (code, language_id)
);

-- Tables with foreign key dependencies (dependencies resolved)
CREATE TABLE audit_actions (
    -- ...
```

### Action Required:

1. **Cut** lines 321-330 from `install.sql` (the translations table definition)
2. **Paste** it at line 83 (right after the `currencies` table, before `audit_actions`)
3. **Delete** the duplicate at line 321-330

## Verification

After the fix, the table creation order should be:
1. ✅ `languages` (line 5) - no dependencies
2. ✅ `currencies` (line 78) - no dependencies  
3. ✅ **`translations` (line 83)** - depends on `languages` ✅
4. ✅ `documents` (line 149) - can now reference `translations` ✅
5. ✅ `products` (line 190) - can now reference `translations` ✅
6. ✅ `transactions` (line 307) - can now reference `translations` ✅

## Status

- ✅ **Verified**: Table exists but in wrong order
- ⚠️ **Action Required**: Move table definition to correct position
- ✅ **Fix Documented**: See above for exact location

