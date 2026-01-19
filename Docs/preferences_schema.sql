-- ============================================
-- USER PREFERENCES SYSTEM SCHEMA
-- ============================================
-- Created: 2026-01-19
-- Description: User preferences system with multi-language support via translations table
-- Dependencies: translations table, objects table (for user_id references)

-- 1. Preference Categories (Lookup Table)
CREATE TABLE IF NOT EXISTS preference_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique code like ui, api, notifications',
  description_code VARCHAR(100) NOT NULL COMMENT 'Translation code for description',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_is_active (is_active),
  INDEX idx_description_code (description_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Preference categories with multi-language descriptions';

-- 2. Preference Definitions (Schema/Metadata)
-- Defines what preferences exist and their metadata
CREATE TABLE IF NOT EXISTS preference_definitions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NOT NULL,
  key_name VARCHAR(100) UNIQUE NOT NULL COMMENT 'Unique identifier like ui.language, api.timeout',
  display_name_code VARCHAR(100) NOT NULL COMMENT 'Translation code for display name',
  description_code VARCHAR(100) NOT NULL COMMENT 'Translation code for description',
  data_type ENUM('string', 'number', 'boolean', 'json', 'date', 'datetime') DEFAULT 'string',
  default_value TEXT COMMENT 'Default value if not set by user',
  validation_rules JSON COMMENT 'JSON schema or validation rules',
  is_user_editable BOOLEAN DEFAULT TRUE COMMENT 'Can users change this?',
  scope ENUM('user', 'system', 'both') DEFAULT 'user' COMMENT 'User-level or system-wide',
  group_name VARCHAR(100) COMMENT 'For grouping in UI (e.g., appearance, behavior)',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES preference_categories(id),
  INDEX idx_category (category_id),
  INDEX idx_key_name (key_name),
  INDEX idx_group (group_name),
  INDEX idx_scope (scope),
  INDEX idx_is_active (is_active),
  INDEX idx_display_name_code (display_name_code),
  INDEX idx_description_code (description_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Preference definitions with multi-language display names and descriptions';

-- 3. User Preferences (User-Specific Values)
-- Stores actual user preference values
CREATE TABLE IF NOT EXISTS user_preferences (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT 'References objects.id (user)',
  preference_definition_id INT NOT NULL,
  value TEXT NOT NULL COMMENT 'Serialized value based on data_type',
  value_json JSON COMMENT 'For complex JSON preferences',
  is_default BOOLEAN DEFAULT FALSE COMMENT 'Is this using default value?',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT COMMENT 'Who created this preference',
  FOREIGN KEY (user_id) REFERENCES objects(id) ON DELETE CASCADE,
  FOREIGN KEY (preference_definition_id) REFERENCES preference_definitions(id),
  FOREIGN KEY (created_by) REFERENCES objects(id),
  UNIQUE KEY unique_user_preference (user_id, preference_definition_id),
  INDEX idx_user_id (user_id),
  INDEX idx_preference_def (preference_definition_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User-specific preference values';

-- 4. User Preferences Extended (JSON Blob for Dynamic Settings)
-- For highly dynamic or rarely used preferences
CREATE TABLE IF NOT EXISTS user_preferences_extended (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  namespace VARCHAR(100) NOT NULL COMMENT 'e.g., ui, api, notifications',
  preferences JSON NOT NULL COMMENT 'Key-value pairs of preferences',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES objects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_namespace (user_id, namespace),
  INDEX idx_user_id (user_id),
  INDEX idx_namespace (namespace)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Extended JSON-based preferences for dynamic settings';

-- 5. Preference Audit Trail
CREATE TABLE IF NOT EXISTS preference_audits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  preference_definition_id INT,
  old_value TEXT,
  new_value TEXT,
  changed_by BIGINT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (user_id) REFERENCES objects(id),
  FOREIGN KEY (preference_definition_id) REFERENCES preference_definitions(id),
  FOREIGN KEY (changed_by) REFERENCES objects(id),
  INDEX idx_user_id (user_id),
  INDEX idx_changed_at (changed_at),
  INDEX idx_changed_by (changed_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for preference changes';
