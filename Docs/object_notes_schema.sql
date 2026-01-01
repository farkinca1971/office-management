-- ----------------------------------------------------------------------------
-- Object Notes: Notes/comments associated with objects
-- ----------------------------------------------------------------------------
-- This table stores notes and comments for any object (person, company, employee, etc.)
-- Follows the same pattern as object_contacts, object_identifications, and object_addresses
--
-- IMPORTANT: subject and note_text are stored in the translations table for multi-language support.
-- The object_notes table stores translation codes that reference translations(code).
-- Translation codes are generated as: 'note_subject_{id}' and 'note_text_{id}'
-- ----------------------------------------------------------------------------

CREATE TABLE object_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    object_id BIGINT NOT NULL COMMENT 'References objects.id - the object this note belongs to',
    note_type_id INT COMMENT 'Optional: Type of note (general, meeting, reminder, etc.) - references note_types lookup table',
    subject_code VARCHAR(100) COMMENT 'Translation code for subject - references translations(code)',
    note_text_code VARCHAR(100) NOT NULL COMMENT 'Translation code for note content - references translations(code)',
    is_pinned BOOLEAN DEFAULT FALSE COMMENT 'Whether this note should be pinned/highlighted',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this note is currently active (soft delete)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When the note was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When the note was last updated',
    created_by BIGINT COMMENT 'User/object who created this note',
    FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
    FOREIGN KEY (note_type_id) REFERENCES note_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (subject_code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (note_text_code) REFERENCES translations(code) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES objects(id) ON DELETE SET NULL,
    INDEX idx_object_id (object_id),
    INDEX idx_note_type_id (note_type_id),
    INDEX idx_subject_code (subject_code),
    INDEX idx_note_text_code (note_text_code),
    INDEX idx_is_active (is_active),
    INDEX idx_is_pinned (is_pinned),
    INDEX idx_object_active (object_id, is_active),
    INDEX idx_created_at (created_at)
) COMMENT='Stores notes and comments associated with any object in the system';

-- ----------------------------------------------------------------------------
-- Note Types Lookup Table
-- ----------------------------------------------------------------------------
-- This lookup table defines the types of notes that can be created
-- Examples: General Note, Meeting Note, Follow-up Reminder, Important Alert, etc.
-- ----------------------------------------------------------------------------

CREATE TABLE note_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique code for this note type (e.g., "note_general", "note_meeting")',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this note type is active',
    FOREIGN KEY (code) REFERENCES translations(code) ON DELETE RESTRICT,
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) COMMENT='Lookup table for note types';

-- ----------------------------------------------------------------------------
-- Seed Data for Note Types
-- ----------------------------------------------------------------------------
-- Note: Insert note_types FIRST, then translations (matching existing pattern)

INSERT INTO note_types (code, is_active) VALUES
('note_general', TRUE),
('note_meeting', TRUE),
('note_reminder', TRUE),
('note_important', TRUE),
('note_follow_up', TRUE),
('note_internal', TRUE),
('note_customer_facing', TRUE);

-- ----------------------------------------------------------------------------
-- Translations for Note Types
-- ----------------------------------------------------------------------------

INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('note_general', (SELECT id FROM languages WHERE code = 'en'), 'General Note'),
('note_meeting', (SELECT id FROM languages WHERE code = 'en'), 'Meeting Note'),
('note_reminder', (SELECT id FROM languages WHERE code = 'en'), 'Reminder'),
('note_important', (SELECT id FROM languages WHERE code = 'en'), 'Important'),
('note_follow_up', (SELECT id FROM languages WHERE code = 'en'), 'Follow-up'),
('note_internal', (SELECT id FROM languages WHERE code = 'en'), 'Internal Note'),
('note_customer_facing', (SELECT id FROM languages WHERE code = 'en'), 'Customer-facing Note'),

-- German translations
('note_general', (SELECT id FROM languages WHERE code = 'de'), 'Allgemeine Notiz'),
('note_meeting', (SELECT id FROM languages WHERE code = 'de'), 'Besprechungsnotiz'),
('note_reminder', (SELECT id FROM languages WHERE code = 'de'), 'Erinnerung'),
('note_important', (SELECT id FROM languages WHERE code = 'de'), 'Wichtig'),
('note_follow_up', (SELECT id FROM languages WHERE code = 'de'), 'Nachverfolgung'),
('note_internal', (SELECT id FROM languages WHERE code = 'de'), 'Interne Notiz'),
('note_customer_facing', (SELECT id FROM languages WHERE code = 'de'), 'Kundenorientierte Notiz'),

-- Hungarian translations
('note_general', (SELECT id FROM languages WHERE code = 'hu'), 'Általános jegyzet'),
('note_meeting', (SELECT id FROM languages WHERE code = 'hu'), 'Találkozó jegyzet'),
('note_reminder', (SELECT id FROM languages WHERE code = 'hu'), 'Emlékeztető'),
('note_important', (SELECT id FROM languages WHERE code = 'hu'), 'Fontos'),
('note_follow_up', (SELECT id FROM languages WHERE code = 'hu'), 'Nyomon követés'),
('note_internal', (SELECT id FROM languages WHERE code = 'hu'), 'Belső jegyzet'),
('note_customer_facing', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfélnek szánt jegyzet');

-- ----------------------------------------------------------------------------
-- Example Usage
-- ----------------------------------------------------------------------------

-- Step 1: Insert translations for the note subject and text
-- INSERT INTO translations (code, language_id, text) VALUES
-- ('note_subject_1', (SELECT id FROM languages WHERE code = 'en'), 'First meeting'),
-- ('note_text_1', (SELECT id FROM languages WHERE code = 'en'), 'Discussed project requirements and timeline.');

-- Step 2: Create the note referencing the translation codes
-- INSERT INTO object_notes (object_id, note_type_id, subject_code, note_text_code, created_by)
-- VALUES (100, 1, 'note_subject_1', 'note_text_1', 1);

-- Create a pinned important note (with translations)
-- INSERT INTO translations (code, language_id, text) VALUES
-- ('note_subject_2', (SELECT id FROM languages WHERE code = 'en'), 'URGENT: Payment overdue'),
-- ('note_text_2', (SELECT id FROM languages WHERE code = 'en'), 'Client has outstanding invoice from last month.');
-- INSERT INTO object_notes (object_id, note_type_id, subject_code, note_text_code, is_pinned, created_by)
-- VALUES (100, 4, 'note_subject_2', 'note_text_2', TRUE, 1);

-- Get all active notes for an object with translated content
-- SELECT
--     n.id,
--     n.object_id,
--     n.note_type_id,
--     ts.text AS subject,
--     tt.text AS note_text,
--     n.is_pinned,
--     n.is_active,
--     n.created_at,
--     n.created_by
-- FROM object_notes n
-- LEFT JOIN translations ts ON ts.code = n.subject_code AND ts.language_id = 1
-- LEFT JOIN translations tt ON tt.code = n.note_text_code AND tt.language_id = 1
-- WHERE n.object_id = 100 AND n.is_active = TRUE
-- ORDER BY n.is_pinned DESC, n.created_at DESC;

-- Soft delete a note
-- UPDATE object_notes SET is_active = FALSE WHERE id = 123;
