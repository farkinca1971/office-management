-- ============================================================================
-- Office Application Database Seed Data
-- ============================================================================
-- File: 02_seed_data.sql
-- Purpose: Insert initial/reference data into lookup tables
-- Usage: Execute this file AFTER 01_schema.sql
-- Dependencies: Requires 01_schema.sql to be executed first
-- ============================================================================

-- ============================================================================
-- SECTION 1: LANGUAGES
-- ============================================================================

-- Insert language codes (ISO language codes)
INSERT INTO languages (code, is_active) VALUES 
('en', TRUE),  -- English
('de', TRUE),  -- German
('hu', TRUE),  -- Hungarian
('fr', TRUE),  -- French
('es', TRUE),  -- Spanish
('it', TRUE),  -- Italian
('pt', TRUE),  -- Portuguese
('ru', TRUE),  -- Russian
('ja', TRUE),  -- Japanese
('ko', TRUE),  -- Korean
('zh', TRUE),  -- Chinese
('ar', TRUE),  -- Arabic
('tr', TRUE),  -- Turkish
('pl', TRUE),  -- Polish
('nl', TRUE),  -- Dutch
('sv', TRUE),  -- Swedish
('da', TRUE),  -- Danish
('no', TRUE),  -- Norwegian
('fi', TRUE),  -- Finnish
('el', TRUE);  -- Greek

-- Insert translations for language names (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('en', (SELECT id FROM languages WHERE code = 'en'), 'English'),
('de', (SELECT id FROM languages WHERE code = 'en'), 'German'),
('hu', (SELECT id FROM languages WHERE code = 'en'), 'Hungarian'),
('fr', (SELECT id FROM languages WHERE code = 'en'), 'French'),
('es', (SELECT id FROM languages WHERE code = 'en'), 'Spanish'),
('it', (SELECT id FROM languages WHERE code = 'en'), 'Italian'),
('pt', (SELECT id FROM languages WHERE code = 'en'), 'Portuguese'),
('ru', (SELECT id FROM languages WHERE code = 'en'), 'Russian'),
('ja', (SELECT id FROM languages WHERE code = 'en'), 'Japanese'),
('ko', (SELECT id FROM languages WHERE code = 'en'), 'Korean'),
('zh', (SELECT id FROM languages WHERE code = 'en'), 'Chinese'),
('ar', (SELECT id FROM languages WHERE code = 'en'), 'Arabic'),
('tr', (SELECT id FROM languages WHERE code = 'en'), 'Turkish'),
('pl', (SELECT id FROM languages WHERE code = 'en'), 'Polish'),
('nl', (SELECT id FROM languages WHERE code = 'en'), 'Dutch'),
('sv', (SELECT id FROM languages WHERE code = 'en'), 'Swedish'),
('da', (SELECT id FROM languages WHERE code = 'en'), 'Danish'),
('no', (SELECT id FROM languages WHERE code = 'en'), 'Norwegian'),
('fi', (SELECT id FROM languages WHERE code = 'en'), 'Finnish'),
('el', (SELECT id FROM languages WHERE code = 'en'), 'Greek'),

-- German translations
('en', (SELECT id FROM languages WHERE code = 'de'), 'Englisch'),
('de', (SELECT id FROM languages WHERE code = 'de'), 'Deutsch'),
('hu', (SELECT id FROM languages WHERE code = 'de'), 'Ungarisch'),
('fr', (SELECT id FROM languages WHERE code = 'de'), 'Französisch'),
('es', (SELECT id FROM languages WHERE code = 'de'), 'Spanisch'),
('it', (SELECT id FROM languages WHERE code = 'de'), 'Italienisch'),
('pt', (SELECT id FROM languages WHERE code = 'de'), 'Portugiesisch'),
('ru', (SELECT id FROM languages WHERE code = 'de'), 'Russisch'),
('ja', (SELECT id FROM languages WHERE code = 'de'), 'Japanisch'),
('ko', (SELECT id FROM languages WHERE code = 'de'), 'Koreanisch'),
('zh', (SELECT id FROM languages WHERE code = 'de'), 'Chinesisch'),
('ar', (SELECT id FROM languages WHERE code = 'de'), 'Arabisch'),
('tr', (SELECT id FROM languages WHERE code = 'de'), 'Türkisch'),
('pl', (SELECT id FROM languages WHERE code = 'de'), 'Polnisch'),
('nl', (SELECT id FROM languages WHERE code = 'de'), 'Niederländisch'),
('sv', (SELECT id FROM languages WHERE code = 'de'), 'Schwedisch'),
('da', (SELECT id FROM languages WHERE code = 'de'), 'Dänisch'),
('no', (SELECT id FROM languages WHERE code = 'de'), 'Norwegisch'),
('fi', (SELECT id FROM languages WHERE code = 'de'), 'Finnisch'),
('el', (SELECT id FROM languages WHERE code = 'de'), 'Griechisch'),

-- Hungarian translations
('en', (SELECT id FROM languages WHERE code = 'hu'), 'Angol'),
('de', (SELECT id FROM languages WHERE code = 'hu'), 'Német'),
('hu', (SELECT id FROM languages WHERE code = 'hu'), 'Magyar'),
('fr', (SELECT id FROM languages WHERE code = 'hu'), 'Francia'),
('es', (SELECT id FROM languages WHERE code = 'hu'), 'Spanyol'),
('it', (SELECT id FROM languages WHERE code = 'hu'), 'Olasz'),
('pt', (SELECT id FROM languages WHERE code = 'hu'), 'Portugál'),
('ru', (SELECT id FROM languages WHERE code = 'hu'), 'Orosz'),
('ja', (SELECT id FROM languages WHERE code = 'hu'), 'Japán'),
('ko', (SELECT id FROM languages WHERE code = 'hu'), 'Koreai'),
('zh', (SELECT id FROM languages WHERE code = 'hu'), 'Kínai'),
('ar', (SELECT id FROM languages WHERE code = 'hu'), 'Arab'),
('tr', (SELECT id FROM languages WHERE code = 'hu'), 'Török'),
('pl', (SELECT id FROM languages WHERE code = 'hu'), 'Lengyel'),
('nl', (SELECT id FROM languages WHERE code = 'hu'), 'Holland'),
('sv', (SELECT id FROM languages WHERE code = 'hu'), 'Svéd'),
('da', (SELECT id FROM languages WHERE code = 'hu'), 'Dán'),
('no', (SELECT id FROM languages WHERE code = 'hu'), 'Norvég'),
('fi', (SELECT id FROM languages WHERE code = 'hu'), 'Finn'),
('el', (SELECT id FROM languages WHERE code = 'hu'), 'Görög');

-- ============================================================================
-- SECTION 2: OBJECT TYPES
-- ============================================================================
-- CRITICAL: Object types must be inserted BEFORE object_statuses
-- (object_statuses references object_types)

INSERT INTO object_types (code, is_active) VALUES 
('person', TRUE),
('company', TRUE),
('user', TRUE),
('document', TRUE),
('file', TRUE),
('employee', TRUE);

-- Insert translations for object_types
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('person', (SELECT id FROM languages WHERE code = 'en'), 'Person'),
('company', (SELECT id FROM languages WHERE code = 'en'), 'Company'),
('user', (SELECT id FROM languages WHERE code = 'en'), 'User'),
('document', (SELECT id FROM languages WHERE code = 'en'), 'Document'),
('file', (SELECT id FROM languages WHERE code = 'en'), 'File'),
('employee', (SELECT id FROM languages WHERE code = 'en'), 'Employee'),

-- German translations
('person', (SELECT id FROM languages WHERE code = 'de'), 'Person'),
('company', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen'),
('user', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer'),
('document', (SELECT id FROM languages WHERE code = 'de'), 'Dokument'),
('file', (SELECT id FROM languages WHERE code = 'de'), 'Datei'),
('employee', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter'),

-- Hungarian translations
('person', (SELECT id FROM languages WHERE code = 'hu'), 'Személy'),
('company', (SELECT id FROM languages WHERE code = 'hu'), 'Cég'),
('user', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó'),
('document', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum'),
('file', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl'),
('employee', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó');

-- ============================================================================
-- SECTION 3: OBJECT STATUSES
-- ============================================================================
-- CRITICAL: These statuses are required for the objects table
-- Statuses are now scoped to object types (each status belongs to a specific object type)

-- Common statuses for all object types
INSERT INTO object_statuses (code, is_active, object_type_id) VALUES 
-- Person statuses
('person_active', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_archived', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('person_pending', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

-- Company statuses
('company_active', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_archived', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('company_pending', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

-- User statuses
('user_active', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_locked', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_pending', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

-- Document statuses
('document_draft', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_published', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_archived', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('document_pending_review', TRUE, (SELECT id FROM object_types WHERE code = 'document')),

-- File statuses
('file_active', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_archived', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_deleted', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('file_pending', TRUE, (SELECT id FROM object_types WHERE code = 'file')),

-- Employee statuses
('employee_active', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_inactive', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_on_leave', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_terminated', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_suspended', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('employee_pending', TRUE, (SELECT id FROM object_types WHERE code = 'employee'));

-- Insert translations for object_statuses
INSERT INTO translations (code, language_id, text) VALUES
-- Person status translations
('person_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('person_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('person_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('person_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('person_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('person_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('person_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('person_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('person_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('person_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('person_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('person_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('person_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('person_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('person_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Company status translations
('company_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('company_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('company_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('company_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('company_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('company_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('company_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('company_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('company_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('company_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('company_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('company_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('company_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('company_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('company_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('company_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('company_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('company_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- User status translations
('user_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('user_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('user_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('user_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('user_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('user_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('user_locked', (SELECT id FROM languages WHERE code = 'en'), 'Locked'),
('user_locked', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('user_locked', (SELECT id FROM languages WHERE code = 'hu'), 'Zárolva'),
('user_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('user_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('user_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('user_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('user_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('user_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('user_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('user_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('user_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Document status translations
('document_draft', (SELECT id FROM languages WHERE code = 'en'), 'Draft'),
('document_draft', (SELECT id FROM languages WHERE code = 'de'), 'Entwurf'),
('document_draft', (SELECT id FROM languages WHERE code = 'hu'), 'Piszklap'),
('document_published', (SELECT id FROM languages WHERE code = 'en'), 'Published'),
('document_published', (SELECT id FROM languages WHERE code = 'de'), 'Veröffentlicht'),
('document_published', (SELECT id FROM languages WHERE code = 'hu'), 'Közzétéve'),
('document_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('document_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('document_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('document_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('document_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('document_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'en'), 'Pending Review'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehende Überprüfung'),
('document_pending_review', (SELECT id FROM languages WHERE code = 'hu'), 'Áttekintésre vár'),

-- File status translations
('file_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('file_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('file_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('file_archived', (SELECT id FROM languages WHERE code = 'en'), 'Archived'),
('file_archived', (SELECT id FROM languages WHERE code = 'de'), 'Archiviert'),
('file_archived', (SELECT id FROM languages WHERE code = 'hu'), 'Archivált'),
('file_deleted', (SELECT id FROM languages WHERE code = 'en'), 'Deleted'),
('file_deleted', (SELECT id FROM languages WHERE code = 'de'), 'Gelöscht'),
('file_deleted', (SELECT id FROM languages WHERE code = 'hu'), 'Törölt'),
('file_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('file_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('file_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben'),

-- Employee status translations
('employee_active', (SELECT id FROM languages WHERE code = 'en'), 'Active'),
('employee_active', (SELECT id FROM languages WHERE code = 'de'), 'Aktiv'),
('employee_active', (SELECT id FROM languages WHERE code = 'hu'), 'Aktív'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'en'), 'Inactive'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'de'), 'Inaktiv'),
('employee_inactive', (SELECT id FROM languages WHERE code = 'hu'), 'Inaktív'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'en'), 'On Leave'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'de'), 'Im Urlaub'),
('employee_on_leave', (SELECT id FROM languages WHERE code = 'hu'), 'Szabadságon'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'en'), 'Terminated'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'de'), 'Gekündigt'),
('employee_terminated', (SELECT id FROM languages WHERE code = 'hu'), 'Felmondva'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'en'), 'Suspended'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'de'), 'Gesperrt'),
('employee_suspended', (SELECT id FROM languages WHERE code = 'hu'), 'Felfüggesztve'),
('employee_pending', (SELECT id FROM languages WHERE code = 'en'), 'Pending'),
('employee_pending', (SELECT id FROM languages WHERE code = 'de'), 'Ausstehend'),
('employee_pending', (SELECT id FROM languages WHERE code = 'hu'), 'Függőben');


-- ============================================================================
-- SECTION 4: SEXES
-- ============================================================================

INSERT INTO sexes (code, is_active) VALUES 
('male', TRUE),
('female', TRUE),
('non-binary', TRUE),
('other', TRUE),
('prefer-not-to-say', TRUE),
('transgender-male', TRUE),
('transgender-female', TRUE),
('agender', TRUE),
('bigender', TRUE),
('genderfluid', TRUE),
('pangender', TRUE),
('two-spirit', TRUE),
('non-conforming', TRUE),
('queer', TRUE),
('questioning', TRUE),
('fluid', TRUE),
('undisclosed', TRUE);

-- Insert translations for sexes (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('male', (SELECT id FROM languages WHERE code = 'en'), 'Male'),
('female', (SELECT id FROM languages WHERE code = 'en'), 'Female'),
('non-binary', (SELECT id FROM languages WHERE code = 'en'), 'Non-binary'),
('other', (SELECT id FROM languages WHERE code = 'en'), 'Other'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'en'), 'Prefer not to say'),
('transgender-male', (SELECT id FROM languages WHERE code = 'en'), 'Transgender Male'),
('transgender-female', (SELECT id FROM languages WHERE code = 'en'), 'Transgender Female'),
('agender', (SELECT id FROM languages WHERE code = 'en'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'en'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'en'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'en'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'en'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'en'), 'Non-conforming'),
('queer', (SELECT id FROM languages WHERE code = 'en'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'en'), 'Questioning'),
('fluid', (SELECT id FROM languages WHERE code = 'en'), 'Fluid'),
('undisclosed', (SELECT id FROM languages WHERE code = 'en'), 'Undisclosed'),

-- German translations
('male', (SELECT id FROM languages WHERE code = 'de'), 'Männlich'),
('female', (SELECT id FROM languages WHERE code = 'de'), 'Weiblich'),
('non-binary', (SELECT id FROM languages WHERE code = 'de'), 'Nicht-binär'),
('other', (SELECT id FROM languages WHERE code = 'de'), 'Andere'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'de'), 'Bevorzuge nicht zu sagen'),
('transgender-male', (SELECT id FROM languages WHERE code = 'de'), 'Transgender-Männlich'),
('transgender-female', (SELECT id FROM languages WHERE code = 'de'), 'Transgender-Weiblich'),
('agender', (SELECT id FROM languages WHERE code = 'de'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'de'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'de'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'de'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'de'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'de'), 'Nicht-konform'),
('queer', (SELECT id FROM languages WHERE code = 'de'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'de'), 'Fragend'),
('fluid', (SELECT id FROM languages WHERE code = 'de'), 'Fließend'),
('undisclosed', (SELECT id FROM languages WHERE code = 'de'), 'Nicht offengelegt'),

-- Hungarian translations
('male', (SELECT id FROM languages WHERE code = 'hu'), 'Férfi'),
('female', (SELECT id FROM languages WHERE code = 'hu'), 'Nő'),
('non-binary', (SELECT id FROM languages WHERE code = 'hu'), 'Nem bináris'),
('other', (SELECT id FROM languages WHERE code = 'hu'), 'Egyéb'),
('prefer-not-to-say', (SELECT id FROM languages WHERE code = 'hu'), 'Nem szeretném megmondani'),
('transgender-male', (SELECT id FROM languages WHERE code = 'hu'), 'Transznemű férfi'),
('transgender-female', (SELECT id FROM languages WHERE code = 'hu'), 'Transznemű nő'),
('agender', (SELECT id FROM languages WHERE code = 'hu'), 'Agender'),
('bigender', (SELECT id FROM languages WHERE code = 'hu'), 'Bigender'),
('genderfluid', (SELECT id FROM languages WHERE code = 'hu'), 'Genderfluid'),
('pangender', (SELECT id FROM languages WHERE code = 'hu'), 'Pangender'),
('two-spirit', (SELECT id FROM languages WHERE code = 'hu'), 'Two-Spirit'),
('non-conforming', (SELECT id FROM languages WHERE code = 'hu'), 'Nem megfelelő'),
('queer', (SELECT id FROM languages WHERE code = 'hu'), 'Queer'),
('questioning', (SELECT id FROM languages WHERE code = 'hu'), 'Kérdő'),
('fluid', (SELECT id FROM languages WHERE code = 'hu'), 'Folyamatos'),
('undisclosed', (SELECT id FROM languages WHERE code = 'hu'), 'Meghatározatlan');

-- ============================================================================
-- SECTION 5: SALUTATIONS
-- ============================================================================

INSERT INTO salutations (code, is_active) VALUES 
('mr', TRUE),
('mrs', TRUE),
('ms', TRUE),
('miss', TRUE),
('dr', TRUE),
('prof', TRUE),
('rev', TRUE),
('hon', TRUE),
('Sir', TRUE),
('Lady', TRUE),
('Lord', TRUE),
('Dame', TRUE),
('Master', TRUE),
('Mistress', TRUE),
('Captain', TRUE),
('Colonel', TRUE),
('General', TRUE),
('Admiral', TRUE),
('Senator', TRUE),
('Governor', TRUE),
('senior', TRUE),
('junior', TRUE),
('özvegy', TRUE);

-- Insert translations for salutations (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('mr', (SELECT id FROM languages WHERE code = 'en'), 'Mr'),
('mrs', (SELECT id FROM languages WHERE code = 'en'), 'Mrs'),
('ms', (SELECT id FROM languages WHERE code = 'en'), 'Ms'),
('miss', (SELECT id FROM languages WHERE code = 'en'), 'Miss'),
('dr', (SELECT id FROM languages WHERE code = 'en'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'en'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'en'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'en'), 'Hon'),
('Sir', (SELECT id FROM languages WHERE code = 'en'), 'Sir'),
('Lady', (SELECT id FROM languages WHERE code = 'en'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'en'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'en'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'en'), 'Master'),
('Mistress', (SELECT id FROM languages WHERE code = 'en'), 'Mistress'),
('Captain', (SELECT id FROM languages WHERE code = 'en'), 'Captain'),
('Colonel', (SELECT id FROM languages WHERE code = 'en'), 'Colonel'),
('General', (SELECT id FROM languages WHERE code = 'en'), 'General'),
('Admiral', (SELECT id FROM languages WHERE code = 'en'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'en'), 'Senator'),
('Governor', (SELECT id FROM languages WHERE code = 'en'), 'Governor'),
('senior', (SELECT id FROM languages WHERE code = 'en'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'en'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'en'), 'Widow'),

-- German translations
('mr', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('mrs', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('ms', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('miss', (SELECT id FROM languages WHERE code = 'de'), 'Fräulein'),
('dr', (SELECT id FROM languages WHERE code = 'de'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'de'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'de'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'de'), 'Ehrwürdig'),
('Sir', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('Lady', (SELECT id FROM languages WHERE code = 'de'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'de'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'de'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'de'), 'Herr'),
('Mistress', (SELECT id FROM languages WHERE code = 'de'), 'Frau'),
('Captain', (SELECT id FROM languages WHERE code = 'de'), 'Kapitän'),
('Colonel', (SELECT id FROM languages WHERE code = 'de'), 'Colonel'),
('General', (SELECT id FROM languages WHERE code = 'de'), 'General'),
('Admiral', (SELECT id FROM languages WHERE code = 'de'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'de'), 'Senator'),
('Governor', (SELECT id FROM languages WHERE code = 'de'), 'Gouverneur'),
('senior', (SELECT id FROM languages WHERE code = 'de'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'de'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'de'), 'Witwe'),

-- Hungarian translations
('mr', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('mrs', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('ms', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('miss', (SELECT id FROM languages WHERE code = 'hu'), 'Kisasszony'),
('dr', (SELECT id FROM languages WHERE code = 'hu'), 'Dr'),
('prof', (SELECT id FROM languages WHERE code = 'hu'), 'Prof'),
('rev', (SELECT id FROM languages WHERE code = 'hu'), 'Rev'),
('hon', (SELECT id FROM languages WHERE code = 'hu'), 'Tiszteletteljes'),
('Sir', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('Lady', (SELECT id FROM languages WHERE code = 'hu'), 'Lady'),
('Lord', (SELECT id FROM languages WHERE code = 'hu'), 'Lord'),
('Dame', (SELECT id FROM languages WHERE code = 'hu'), 'Dame'),
('Master', (SELECT id FROM languages WHERE code = 'hu'), 'Úr'),
('Mistress', (SELECT id FROM languages WHERE code = 'hu'), 'Asszony'),
('Captain', (SELECT id FROM languages WHERE code = 'hu'), 'Kapitány'),
('Colonel', (SELECT id FROM languages WHERE code = 'hu'), 'Kolonel'),
('General', (SELECT id FROM languages WHERE code = 'hu'), 'Generál'),
('Admiral', (SELECT id FROM languages WHERE code = 'hu'), 'Admiral'),
('Senator', (SELECT id FROM languages WHERE code = 'hu'), 'Senátor'),
('Governor', (SELECT id FROM languages WHERE code = 'hu'), 'Gubernátor'),
('senior', (SELECT id FROM languages WHERE code = 'hu'), 'Senior'),
('junior', (SELECT id FROM languages WHERE code = 'hu'), 'Junior'),
('özvegy', (SELECT id FROM languages WHERE code = 'hu'), 'Veledő');

-- ============================================================================
-- SECTION 6: PRODUCT CATEGORIES
-- ============================================================================
-- CRITICAL: These categories are required for the products table

INSERT INTO product_categories (code, is_active) VALUES 
('electronics', TRUE),
('clothing', TRUE),
('food', TRUE),
('books', TRUE),
('furniture', TRUE),
('toys', TRUE),
('sports', TRUE),
('beauty', TRUE),
('automotive', TRUE),
('home_garden', TRUE);

-- Insert translations for product_categories
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('electronics', (SELECT id FROM languages WHERE code = 'en'), 'Electronics'),
('clothing', (SELECT id FROM languages WHERE code = 'en'), 'Clothing'),
('food', (SELECT id FROM languages WHERE code = 'en'), 'Food'),
('books', (SELECT id FROM languages WHERE code = 'en'), 'Books'),
('furniture', (SELECT id FROM languages WHERE code = 'en'), 'Furniture'),
('toys', (SELECT id FROM languages WHERE code = 'en'), 'Toys'),
('sports', (SELECT id FROM languages WHERE code = 'en'), 'Sports'),
('beauty', (SELECT id FROM languages WHERE code = 'en'), 'Beauty'),
('automotive', (SELECT id FROM languages WHERE code = 'en'), 'Automotive'),
('home_garden', (SELECT id FROM languages WHERE code = 'en'), 'Home & Garden'),

-- German translations
('electronics', (SELECT id FROM languages WHERE code = 'de'), 'Elektronik'),
('clothing', (SELECT id FROM languages WHERE code = 'de'), 'Kleidung'),
('food', (SELECT id FROM languages WHERE code = 'de'), 'Lebensmittel'),
('books', (SELECT id FROM languages WHERE code = 'de'), 'Bücher'),
('furniture', (SELECT id FROM languages WHERE code = 'de'), 'Möbel'),
('toys', (SELECT id FROM languages WHERE code = 'de'), 'Spielzeug'),
('sports', (SELECT id FROM languages WHERE code = 'de'), 'Sport'),
('beauty', (SELECT id FROM languages WHERE code = 'de'), 'Schönheit'),
('automotive', (SELECT id FROM languages WHERE code = 'de'), 'Automobil'),
('home_garden', (SELECT id FROM languages WHERE code = 'de'), 'Haus & Garten'),

-- Hungarian translations
('electronics', (SELECT id FROM languages WHERE code = 'hu'), 'Elektronika'),
('clothing', (SELECT id FROM languages WHERE code = 'hu'), 'Ruházat'),
('food', (SELECT id FROM languages WHERE code = 'hu'), 'Élelmiszer'),
('books', (SELECT id FROM languages WHERE code = 'hu'), 'Könyvek'),
('furniture', (SELECT id FROM languages WHERE code = 'hu'), 'Bútor'),
('toys', (SELECT id FROM languages WHERE code = 'hu'), 'Játékok'),
('sports', (SELECT id FROM languages WHERE code = 'hu'), 'Sport'),
('beauty', (SELECT id FROM languages WHERE code = 'hu'), 'Szépség'),
('automotive', (SELECT id FROM languages WHERE code = 'hu'), 'Autóipar'),
('home_garden', (SELECT id FROM languages WHERE code = 'hu'), 'Otthon és kert');

-- ============================================================================
-- SECTION 7: ADDRESS AREA TYPES
-- ============================================================================

INSERT INTO address_area_types (code, is_active) VALUES 
('street', TRUE),
('avenue', TRUE),
('road', TRUE),
('lane', TRUE),
('court', TRUE),
('place', TRUE),
('square', TRUE),
('boulevard', TRUE),
('drive', TRUE),
('circle', TRUE),
('way', TRUE),
('trail', TRUE),
('parkway', TRUE),
('highway', TRUE),
('expressway', TRUE),
('alley', TRUE),
('crescent', TRUE),
('loop', TRUE),
('terrace', TRUE),
('row', TRUE),
('block', TRUE),
('quarter', TRUE),
('district', TRUE),
('neighborhood', TRUE),
('zone', TRUE),
('area', TRUE),
('region', TRUE),
('county', TRUE),
('state', TRUE),
('province', TRUE),
('territory', TRUE),
('country', TRUE);

-- Insert translations for address_area_types (English, German, Hungarian)
-- Note: Only showing first few entries due to length. Full translations follow same pattern.
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('street', (SELECT id FROM languages WHERE code = 'en'), 'Street'),
('avenue', (SELECT id FROM languages WHERE code = 'en'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'en'), 'Road'),
('lane', (SELECT id FROM languages WHERE code = 'en'), 'Lane'),
('court', (SELECT id FROM languages WHERE code = 'en'), 'Court'),
('place', (SELECT id FROM languages WHERE code = 'en'), 'Place'),
('square', (SELECT id FROM languages WHERE code = 'en'), 'Square'),
('boulevard', (SELECT id FROM languages WHERE code = 'en'), 'Boulevard'),
('drive', (SELECT id FROM languages WHERE code = 'en'), 'Drive'),
('circle', (SELECT id FROM languages WHERE code = 'en'), 'Circle'),
('way', (SELECT id FROM languages WHERE code = 'en'), 'Way'),
('trail', (SELECT id FROM languages WHERE code = 'en'), 'Trail'),
('parkway', (SELECT id FROM languages WHERE code = 'en'), 'Parkway'),
('highway', (SELECT id FROM languages WHERE code = 'en'), 'Highway'),
('expressway', (SELECT id FROM languages WHERE code = 'en'), 'Expressway'),
('alley', (SELECT id FROM languages WHERE code = 'en'), 'Alley'),
('crescent', (SELECT id FROM languages WHERE code = 'en'), 'Crescent'),
('loop', (SELECT id FROM languages WHERE code = 'en'), 'Loop'),
('terrace', (SELECT id FROM languages WHERE code = 'en'), 'Terrace'),
('row', (SELECT id FROM languages WHERE code = 'en'), 'Row'),
('block', (SELECT id FROM languages WHERE code = 'en'), 'Block'),
('quarter', (SELECT id FROM languages WHERE code = 'en'), 'Quarter'),
('district', (SELECT id FROM languages WHERE code = 'en'), 'District'),
('neighborhood', (SELECT id FROM languages WHERE code = 'en'), 'Neighborhood'),
('zone', (SELECT id FROM languages WHERE code = 'en'), 'Zone'),
('area', (SELECT id FROM languages WHERE code = 'en'), 'Area'),
('region', (SELECT id FROM languages WHERE code = 'en'), 'Region'),
('county', (SELECT id FROM languages WHERE code = 'en'), 'County'),
('state', (SELECT id FROM languages WHERE code = 'en'), 'State'),
('province', (SELECT id FROM languages WHERE code = 'en'), 'Province'),
('territory', (SELECT id FROM languages WHERE code = 'en'), 'Territory'),
('country', (SELECT id FROM languages WHERE code = 'en'), 'Country'),

-- German translations
('street', (SELECT id FROM languages WHERE code = 'de'), 'Straße'),
('avenue', (SELECT id FROM languages WHERE code = 'de'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'de'), 'Straße'),
('lane', (SELECT id FROM languages WHERE code = 'de'), 'Gasse'),
('court', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('place', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('square', (SELECT id FROM languages WHERE code = 'de'), 'Platz'),
('boulevard', (SELECT id FROM languages WHERE code = 'de'), 'Boulevard'),
('drive', (SELECT id FROM languages WHERE code = 'de'), 'Drive'),
('circle', (SELECT id FROM languages WHERE code = 'de'), 'Kreis'),
('way', (SELECT id FROM languages WHERE code = 'de'), 'Weg'),
('trail', (SELECT id FROM languages WHERE code = 'de'), 'Pfad'),
('parkway', (SELECT id FROM languages WHERE code = 'de'), 'Parkway'),
('highway', (SELECT id FROM languages WHERE code = 'de'), 'Autobahn'),
('expressway', (SELECT id FROM languages WHERE code = 'de'), 'Schnellstraße'),
('alley', (SELECT id FROM languages WHERE code = 'de'), 'Gasse'),
('crescent', (SELECT id FROM languages WHERE code = 'de'), 'Kreuzung'),
('loop', (SELECT id FROM languages WHERE code = 'de'), 'Schleife'),
('terrace', (SELECT id FROM languages WHERE code = 'de'), 'Terrasse'),
('row', (SELECT id FROM languages WHERE code = 'de'), 'Reihe'),
('block', (SELECT id FROM languages WHERE code = 'de'), 'Block'),
('quarter', (SELECT id FROM languages WHERE code = 'de'), 'Viertel'),
('district', (SELECT id FROM languages WHERE code = 'de'), 'Bezirk'),
('neighborhood', (SELECT id FROM languages WHERE code = 'de'), 'Nachbarschaft'),
('zone', (SELECT id FROM languages WHERE code = 'de'), 'Zone'),
('area', (SELECT id FROM languages WHERE code = 'de'), 'Gebiet'),
('region', (SELECT id FROM languages WHERE code = 'de'), 'Region'),
('county', (SELECT id FROM languages WHERE code = 'de'), 'Kreis'),
('state', (SELECT id FROM languages WHERE code = 'de'), 'Bundesland'),
('province', (SELECT id FROM languages WHERE code = 'de'), 'Provinz'),
('territory', (SELECT id FROM languages WHERE code = 'de'), 'Gebiet'),
('country', (SELECT id FROM languages WHERE code = 'de'), 'Land'),

-- Hungarian translations
('street', (SELECT id FROM languages WHERE code = 'hu'), 'Utca'),
('avenue', (SELECT id FROM languages WHERE code = 'hu'), 'Avenue'),
('road', (SELECT id FROM languages WHERE code = 'hu'), 'Út'),
('lane', (SELECT id FROM languages WHERE code = 'hu'), 'Kis utca'),
('court', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('place', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('square', (SELECT id FROM languages WHERE code = 'hu'), 'Tér'),
('boulevard', (SELECT id FROM languages WHERE code = 'hu'), 'Bulvar'),
('drive', (SELECT id FROM languages WHERE code = 'hu'), 'Főút'),
('circle', (SELECT id FROM languages WHERE code = 'hu'), 'Körút'),
('way', (SELECT id FROM languages WHERE code = 'hu'), 'Út'),
('trail', (SELECT id FROM languages WHERE code = 'hu'), 'Sétaút'),
('parkway', (SELECT id FROM languages WHERE code = 'hu'), 'Park út'),
('highway', (SELECT id FROM languages WHERE code = 'hu'), 'Autópálya'),
('expressway', (SELECT id FROM languages WHERE code = 'hu'), 'Közföldi út'),
('alley', (SELECT id FROM languages WHERE code = 'hu'), 'Kis utca'),
('crescent', (SELECT id FROM languages WHERE code = 'hu'), 'Félgörbe'),
('loop', (SELECT id FROM languages WHERE code = 'hu'), 'Körút'),
('terrace', (SELECT id FROM languages WHERE code = 'hu'), 'Terrács'),
('row', (SELECT id FROM languages WHERE code = 'hu'), 'Sor'),
('block', (SELECT id FROM languages WHERE code = 'hu'), 'Blokk'),
('quarter', (SELECT id FROM languages WHERE code = 'hu'), 'Negyed'),
('district', (SELECT id FROM languages WHERE code = 'hu'), 'Kistérség'),
('neighborhood', (SELECT id FROM languages WHERE code = 'hu'), 'Környék'),
('zone', (SELECT id FROM languages WHERE code = 'hu'), 'Zóna'),
('area', (SELECT id FROM languages WHERE code = 'hu'), 'Terület'),
('region', (SELECT id FROM languages WHERE code = 'hu'), 'Régió'),
('county', (SELECT id FROM languages WHERE code = 'hu'), 'Megye'),
('state', (SELECT id FROM languages WHERE code = 'hu'), 'Állam'),
('province', (SELECT id FROM languages WHERE code = 'hu'), 'Tartomány'),
('territory', (SELECT id FROM languages WHERE code = 'hu'), 'Terület'),
('country', (SELECT id FROM languages WHERE code = 'hu'), 'Ország');

-- ============================================================================
-- SECTION 8: ADDRESS TYPES
-- ============================================================================

INSERT INTO address_types (code, is_active) VALUES 
('temporary', TRUE),
('mailing', TRUE),
('permanent', TRUE),
('home', TRUE),
('work', TRUE),
('business', TRUE),
('residential', TRUE),
('commercial', TRUE),
('office', TRUE),
('warehouse', TRUE),
('factory', TRUE),
('retail', TRUE),
('hotel', TRUE),
('hospital', TRUE),
('school', TRUE),
('university', TRUE),
('library', TRUE),
('church', TRUE),
('bank', TRUE),
('post_office', TRUE);

-- Insert translations for address_types (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- English translations
('temporary', (SELECT id FROM languages WHERE code = 'en'), 'Temporary'),
('mailing', (SELECT id FROM languages WHERE code = 'en'), 'Mailing'),
('permanent', (SELECT id FROM languages WHERE code = 'en'), 'Permanent'),
('home', (SELECT id FROM languages WHERE code = 'en'), 'Home'),
('work', (SELECT id FROM languages WHERE code = 'en'), 'Work'),
('business', (SELECT id FROM languages WHERE code = 'en'), 'Business'),
('residential', (SELECT id FROM languages WHERE code = 'en'), 'Residential'),
('commercial', (SELECT id FROM languages WHERE code = 'en'), 'Commercial'),
('office', (SELECT id FROM languages WHERE code = 'en'), 'Office'),
('warehouse', (SELECT id FROM languages WHERE code = 'en'), 'Warehouse'),
('factory', (SELECT id FROM languages WHERE code = 'en'), 'Factory'),
('retail', (SELECT id FROM languages WHERE code = 'en'), 'Retail'),
('hotel', (SELECT id FROM languages WHERE code = 'en'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'en'), 'Hospital'),
('school', (SELECT id FROM languages WHERE code = 'en'), 'School'),
('university', (SELECT id FROM languages WHERE code = 'en'), 'University'),
('library', (SELECT id FROM languages WHERE code = 'en'), 'Library'),
('church', (SELECT id FROM languages WHERE code = 'en'), 'Church'),
('bank', (SELECT id FROM languages WHERE code = 'en'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'en'), 'Post Office'),

-- German translations
('temporary', (SELECT id FROM languages WHERE code = 'de'), 'Temporär'),
('mailing', (SELECT id FROM languages WHERE code = 'de'), 'Post'),
('permanent', (SELECT id FROM languages WHERE code = 'de'), 'Dauerhaft'),
('home', (SELECT id FROM languages WHERE code = 'de'), 'Zuhause'),
('work', (SELECT id FROM languages WHERE code = 'de'), 'Arbeit'),
('business', (SELECT id FROM languages WHERE code = 'de'), 'Geschäft'),
('residential', (SELECT id FROM languages WHERE code = 'de'), 'Wohnung'),
('commercial', (SELECT id FROM languages WHERE code = 'de'), 'Gewerbe'),
('office', (SELECT id FROM languages WHERE code = 'de'), 'Büro'),
('warehouse', (SELECT id FROM languages WHERE code = 'de'), 'Lager'),
('factory', (SELECT id FROM languages WHERE code = 'de'), 'Fabrik'),
('retail', (SELECT id FROM languages WHERE code = 'de'), 'Einzelhandel'),
('hotel', (SELECT id FROM languages WHERE code = 'de'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'de'), 'Krankenhaus'),
('school', (SELECT id FROM languages WHERE code = 'de'), 'Schule'),
('university', (SELECT id FROM languages WHERE code = 'de'), 'Universität'),
('library', (SELECT id FROM languages WHERE code = 'de'), 'Bibliothek'),
('church', (SELECT id FROM languages WHERE code = 'de'), 'Kirche'),
('bank', (SELECT id FROM languages WHERE code = 'de'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'de'), 'Postamt'),

-- Hungarian translations
('temporary', (SELECT id FROM languages WHERE code = 'hu'), 'Átmeneti'),
('mailing', (SELECT id FROM languages WHERE code = 'hu'), 'Levélküldési'),
('permanent', (SELECT id FROM languages WHERE code = 'hu'), 'Állandó'),
('home', (SELECT id FROM languages WHERE code = 'hu'), 'Otthon'),
('work', (SELECT id FROM languages WHERE code = 'hu'), 'Munkahely'),
('business', (SELECT id FROM languages WHERE code = 'hu'), 'Üzlet'),
('residential', (SELECT id FROM languages WHERE code = 'hu'), 'Lakó'),
('commercial', (SELECT id FROM languages WHERE code = 'hu'), 'Kereskedelmi'),
('office', (SELECT id FROM languages WHERE code = 'hu'), 'Iroda'),
('warehouse', (SELECT id FROM languages WHERE code = 'hu'), 'Raktár'),
('factory', (SELECT id FROM languages WHERE code = 'hu'), 'Gyár'),
('retail', (SELECT id FROM languages WHERE code = 'hu'), 'Kiskereskedelmi'),
('hotel', (SELECT id FROM languages WHERE code = 'hu'), 'Hotel'),
('hospital', (SELECT id FROM languages WHERE code = 'hu'), 'Kórház'),
('school', (SELECT id FROM languages WHERE code = 'hu'), 'Iskola'),
('university', (SELECT id FROM languages WHERE code = 'hu'), 'Egyetem'),
('library', (SELECT id FROM languages WHERE code = 'hu'), 'Könyvtár'),
('church', (SELECT id FROM languages WHERE code = 'hu'), 'Egyház'),
('bank', (SELECT id FROM languages WHERE code = 'hu'), 'Bank'),
('post_office', (SELECT id FROM languages WHERE code = 'hu'), 'Posta');

-- ============================================================================
-- SECTION 9: CONTACT TYPES
-- ============================================================================

INSERT INTO contact_types (code, is_active) VALUES 
('phone', TRUE),
('mobile', TRUE),
('email', TRUE),
('fax', TRUE),
('mail', TRUE),
('letter', TRUE),
('telegram', TRUE),
('whatsapp', TRUE),
('viber', TRUE),
('skype', TRUE),
('linkedin', TRUE),
('twitter', TRUE),
('facebook', TRUE),
('instagram', TRUE),
('xing', TRUE),
('youtube', TRUE),
('website', TRUE),
('rss', TRUE),
('newsletter', TRUE),
('callback', TRUE),
('emergency', TRUE),
('office', TRUE),
('home', TRUE),
('work', TRUE),
('direct', TRUE),
('secretary', TRUE),
('reception', TRUE),
('assistant', TRUE),
('technical', TRUE),
('customer_service', TRUE),
('sales', TRUE),
('support', TRUE),
('hr', TRUE),
('finance', TRUE),
('legal', TRUE),
('project_management', TRUE),
('delivery', TRUE),
('pickup', TRUE),
('pickup_point', TRUE),
('drop_off', TRUE),
('collection', TRUE),
('distribution', TRUE),
('warehouse', TRUE),
('factory', TRUE);

-- Insert translations for contact types (English, German, Hungarian)
-- Note: Showing key entries. Full translations follow same pattern.
INSERT INTO translations (code, language_id, text) VALUES
-- Phone translations
('phone', (SELECT id FROM languages WHERE code = 'en'), 'Phone'),
('phone', (SELECT id FROM languages WHERE code = 'de'), 'Telefon'),
('phone', (SELECT id FROM languages WHERE code = 'hu'), 'Telefon'),

-- Mobile translations
('mobile', (SELECT id FROM languages WHERE code = 'en'), 'Mobile'),
('mobile', (SELECT id FROM languages WHERE code = 'de'), 'Mobil'),
('mobile', (SELECT id FROM languages WHERE code = 'hu'), 'Mobiltelefon'),

-- Email translations
('email', (SELECT id FROM languages WHERE code = 'en'), 'Email'),
('email', (SELECT id FROM languages WHERE code = 'de'), 'E-Mail'),
('email', (SELECT id FROM languages WHERE code = 'hu'), 'E-mail'),

-- Fax translations
('fax', (SELECT id FROM languages WHERE code = 'en'), 'Fax'),
('fax', (SELECT id FROM languages WHERE code = 'de'), 'Fax'),
('fax', (SELECT id FROM languages WHERE code = 'hu'), 'Fax'),

-- Mail translations
('mail', (SELECT id FROM languages WHERE code = 'en'), 'Mail'),
('mail', (SELECT id FROM languages WHERE code = 'de'), 'Post'),
('mail', (SELECT id FROM languages WHERE code = 'hu'), 'Posta'),

-- Letter translations
('letter', (SELECT id FROM languages WHERE code = 'en'), 'Letter'),
('letter', (SELECT id FROM languages WHERE code = 'de'), 'Brief'),
('letter', (SELECT id FROM languages WHERE code = 'hu'), 'Levelet'),

-- Telegram translations
('telegram', (SELECT id FROM languages WHERE code = 'en'), 'Telegram'),
('telegram', (SELECT id FROM languages WHERE code = 'de'), 'Telegram'),
('telegram', (SELECT id FROM languages WHERE code = 'hu'), 'Telegram'),

-- WhatsApp translations
('whatsapp', (SELECT id FROM languages WHERE code = 'en'), 'WhatsApp'),
('whatsapp', (SELECT id FROM languages WHERE code = 'de'), 'WhatsApp'),
('whatsapp', (SELECT id FROM languages WHERE code = 'hu'), 'WhatsApp'),

-- Viber translations
('viber', (SELECT id FROM languages WHERE code = 'en'), 'Viber'),
('viber', (SELECT id FROM languages WHERE code = 'de'), 'Viber'),
('viber', (SELECT id FROM languages WHERE code = 'hu'), 'Viber'),

-- Skype translations
('skype', (SELECT id FROM languages WHERE code = 'en'), 'Skype'),
('skype', (SELECT id FROM languages WHERE code = 'de'), 'Skype'),
('skype', (SELECT id FROM languages WHERE code = 'hu'), 'Skype'),

-- LinkedIn translations
('linkedin', (SELECT id FROM languages WHERE code = 'en'), 'LinkedIn'),
('linkedin', (SELECT id FROM languages WHERE code = 'de'), 'LinkedIn'),
('linkedin', (SELECT id FROM languages WHERE code = 'hu'), 'LinkedIn'),

-- Twitter translations
('twitter', (SELECT id FROM languages WHERE code = 'en'), 'Twitter'),
('twitter', (SELECT id FROM languages WHERE code = 'de'), 'Twitter'),
('twitter', (SELECT id FROM languages WHERE code = 'hu'), 'Twitter'),

-- Facebook translations
('facebook', (SELECT id FROM languages WHERE code = 'en'), 'Facebook'),
('facebook', (SELECT id FROM languages WHERE code = 'de'), 'Facebook'),
('facebook', (SELECT id FROM languages WHERE code = 'hu'), 'Facebook'),

-- Instagram translations
('instagram', (SELECT id FROM languages WHERE code = 'en'), 'Instagram'),
('instagram', (SELECT id FROM languages WHERE code = 'de'), 'Instagram'),
('instagram', (SELECT id FROM languages WHERE code = 'hu'), 'Instagram'),

-- XING translations
('xing', (SELECT id FROM languages WHERE code = 'en'), 'XING'),
('xing', (SELECT id FROM languages WHERE code = 'de'), 'XING'),
('xing', (SELECT id FROM languages WHERE code = 'hu'), 'XING'),

-- YouTube translations
('youtube', (SELECT id FROM languages WHERE code = 'en'), 'YouTube'),
('youtube', (SELECT id FROM languages WHERE code = 'de'), 'YouTube'),
('youtube', (SELECT id FROM languages WHERE code = 'hu'), 'YouTube'),

-- Website translations
('website', (SELECT id FROM languages WHERE code = 'en'), 'Website'),
('website', (SELECT id FROM languages WHERE code = 'de'), 'Website'),
('website', (SELECT id FROM languages WHERE code = 'hu'), 'Weboldal'),

-- RSS translations
('rss', (SELECT id FROM languages WHERE code = 'en'), 'RSS'),
('rss', (SELECT id FROM languages WHERE code = 'de'), 'RSS'),
('rss', (SELECT id FROM languages WHERE code = 'hu'), 'RSS'),

-- Newsletter translations
('newsletter', (SELECT id FROM languages WHERE code = 'en'), 'Newsletter'),
('newsletter', (SELECT id FROM languages WHERE code = 'de'), 'Newsletter'),
('newsletter', (SELECT id FROM languages WHERE code = 'hu'), 'Hírlevél'),

-- Callback translations
('callback', (SELECT id FROM languages WHERE code = 'en'), 'Callback'),
('callback', (SELECT id FROM languages WHERE code = 'de'), 'Rückruf'),
('callback', (SELECT id FROM languages WHERE code = 'hu'), 'Visszahívás'),

-- Emergency translations
('emergency', (SELECT id FROM languages WHERE code = 'en'), 'Emergency'),
('emergency', (SELECT id FROM languages WHERE code = 'de'), 'Notruf'),
('emergency', (SELECT id FROM languages WHERE code = 'hu'), 'Sürgős'),

-- Office translations
('office', (SELECT id FROM languages WHERE code = 'en'), 'Office'),
('office', (SELECT id FROM languages WHERE code = 'de'), 'Büro'),
('office', (SELECT id FROM languages WHERE code = 'hu'), 'Iroda'),

-- Home translations
('home', (SELECT id FROM languages WHERE code = 'en'), 'Home'),
('home', (SELECT id FROM languages WHERE code = 'de'), 'Heim'),
('home', (SELECT id FROM languages WHERE code = 'hu'), 'Otthon'),

-- Work translations
('work', (SELECT id FROM languages WHERE code = 'en'), 'Work'),
('work', (SELECT id FROM languages WHERE code = 'de'), 'Arbeit'),
('work', (SELECT id FROM languages WHERE code = 'hu'), 'Munkahely'),

-- Direct translations
('direct', (SELECT id FROM languages WHERE code = 'en'), 'Direct'),
('direct', (SELECT id FROM languages WHERE code = 'de'), 'Direkt'),
('direct', (SELECT id FROM languages WHERE code = 'hu'), 'Direkt'),

-- Secretary translations
('secretary', (SELECT id FROM languages WHERE code = 'en'), 'Secretary'),
('secretary', (SELECT id FROM languages WHERE code = 'de'), 'Assistent'),
('secretary', (SELECT id FROM languages WHERE code = 'hu'), 'Titkár'),

-- Reception translations
('reception', (SELECT id FROM languages WHERE code = 'en'), 'Reception'),
('reception', (SELECT id FROM languages WHERE code = 'de'), 'Rezeption'),
('reception', (SELECT id FROM languages WHERE code = 'hu'), 'Fogadó'),

-- Assistant translations
('assistant', (SELECT id FROM languages WHERE code = 'en'), 'Assistant'),
('assistant', (SELECT id FROM languages WHERE code = 'de'), 'Assistent'),
('assistant', (SELECT id FROM languages WHERE code = 'hu'), 'Asszisztens'),

-- Technical translations
('technical', (SELECT id FROM languages WHERE code = 'en'), 'Technical'),
('technical', (SELECT id FROM languages WHERE code = 'de'), 'Technisch'),
('technical', (SELECT id FROM languages WHERE code = 'hu'), 'Technikai'),

-- Customer service translations
('customer_service', (SELECT id FROM languages WHERE code = 'en'), 'Customer Service'),
('customer_service', (SELECT id FROM languages WHERE code = 'de'), 'Kundendienst'),
('customer_service', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfélszolgálat'),

-- Sales translations
('sales', (SELECT id FROM languages WHERE code = 'en'), 'Sales'),
('sales', (SELECT id FROM languages WHERE code = 'de'), 'Vertrieb'),
('sales', (SELECT id FROM languages WHERE code = 'hu'), 'Eladás'),

-- Support translations
('support', (SELECT id FROM languages WHERE code = 'en'), 'Support'),
('support', (SELECT id FROM languages WHERE code = 'de'), 'Support'),
('support', (SELECT id FROM languages WHERE code = 'hu'), 'Támogatás'),

-- HR translations
('hr', (SELECT id FROM languages WHERE code = 'en'), 'HR'),
('hr', (SELECT id FROM languages WHERE code = 'de'), 'HR'),
('hr', (SELECT id FROM languages WHERE code = 'hu'), 'HR'),

-- Finance translations
('finance', (SELECT id FROM languages WHERE code = 'en'), 'Finance'),
('finance', (SELECT id FROM languages WHERE code = 'de'), 'Finanzen'),
('finance', (SELECT id FROM languages WHERE code = 'hu'), 'Pénzügyek'),

-- Legal translations
('legal', (SELECT id FROM languages WHERE code = 'en'), 'Legal'),
('legal', (SELECT id FROM languages WHERE code = 'de'), 'Rechtlich'),
('legal', (SELECT id FROM languages WHERE code = 'hu'), 'Jogi'),

-- Project management translations
('project_management', (SELECT id FROM languages WHERE code = 'en'), 'Project Management'),
('project_management', (SELECT id FROM languages WHERE code = 'de'), 'Projektmanagement'),
('project_management', (SELECT id FROM languages WHERE code = 'hu'), 'Projektmenedzsment'),

-- Delivery translations
('delivery', (SELECT id FROM languages WHERE code = 'en'), 'Delivery'),
('delivery', (SELECT id FROM languages WHERE code = 'de'), 'Lieferung'),
('delivery', (SELECT id FROM languages WHERE code = 'hu'), 'Szállítás'),

-- Pickup translations
('pickup', (SELECT id FROM languages WHERE code = 'en'), 'Pickup'),
('pickup', (SELECT id FROM languages WHERE code = 'de'), 'Abholung'),
('pickup', (SELECT id FROM languages WHERE code = 'hu'), 'Elvétel'),

-- Pickup point translations
('pickup_point', (SELECT id FROM languages WHERE code = 'en'), 'Pickup Point'),
('pickup_point', (SELECT id FROM languages WHERE code = 'de'), 'Abholpunkt'),
('pickup_point', (SELECT id FROM languages WHERE code = 'hu'), 'Elvételi pont'),

-- Drop off translations
('drop_off', (SELECT id FROM languages WHERE code = 'en'), 'Drop Off'),
('drop_off', (SELECT id FROM languages WHERE code = 'de'), 'Abgabe'),
('drop_off', (SELECT id FROM languages WHERE code = 'hu'), 'Letét'),

-- Collection translations
('collection', (SELECT id FROM languages WHERE code = 'en'), 'Collection'),
('collection', (SELECT id FROM languages WHERE code = 'de'), 'Sammlung'),
('collection', (SELECT id FROM languages WHERE code = 'hu'), 'Gyűjtés'),

-- Distribution translations
('distribution', (SELECT id FROM languages WHERE code = 'en'), 'Distribution'),
('distribution', (SELECT id FROM languages WHERE code = 'de'), 'Verteilung'),
('distribution', (SELECT id FROM languages WHERE code = 'hu'), 'Elosztás'),

-- Warehouse translations
('warehouse', (SELECT id FROM languages WHERE code = 'en'), 'Warehouse'),
('warehouse', (SELECT id FROM languages WHERE code = 'de'), 'Lager'),
('warehouse', (SELECT id FROM languages WHERE code = 'hu'), 'Raktár'),

-- Factory translations
('factory', (SELECT id FROM languages WHERE code = 'en'), 'Factory'),
('factory', (SELECT id FROM languages WHERE code = 'de'), 'Fabrik'),
('factory', (SELECT id FROM languages WHERE code = 'hu'), 'Gyár');

-- ============================================================================
-- SECTION 10: AUDIT ACTIONS
-- ============================================================================

-- Insert translations for audit actions (English, German, Hungarian)
-- NOTE: Translations must be inserted BEFORE audit_actions due to foreign key constraint
INSERT INTO translations (code, language_id, text) VALUES
-- Person actions
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Create Person'),
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person erstellen'),
('CREATE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy létrehozása'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Update Person'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person aktualisieren'),
('UPDATE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy módosítása'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Delete Person'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person löschen'),
('DELETE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy törlése'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Archive Person'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person archivieren'),
('ARCHIVE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy archiválása'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'en'), 'Restore Person'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'de'), 'Person wiederherstellen'),
('RESTORE_PERSON', (SELECT id FROM languages WHERE code = 'hu'), 'Személy visszaállítása'),

-- Company actions
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Create Company'),
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen erstellen'),
('CREATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég létrehozása'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Update Company'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen aktualisieren'),
('UPDATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég módosítása'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Delete Company'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen löschen'),
('DELETE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég törlése'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Deactivate Company'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen deaktivieren'),
('DEACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég deaktiválása'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'en'), 'Reactivate Company'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'de'), 'Unternehmen reaktivieren'),
('REACTIVATE_COMPANY', (SELECT id FROM languages WHERE code = 'hu'), 'Cég reaktiválása'),

-- User actions
('CREATE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Create User'),
('CREATE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellen'),
('CREATE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó létrehozása'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Update User'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer aktualisieren'),
('UPDATE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó módosítása'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'en'), 'Delete User'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer löschen'),
('DELETE_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó törlése'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'en'), 'Lock User'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer sperren'),
('LOCK_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó zárolása'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'en'), 'Unlock User'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer entsperren'),
('UNLOCK_USER', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó feloldása'),
('LOGIN', (SELECT id FROM languages WHERE code = 'en'), 'Login'),
('LOGIN', (SELECT id FROM languages WHERE code = 'de'), 'Anmeldung'),
('LOGIN', (SELECT id FROM languages WHERE code = 'hu'), 'Bejelentkezés'),
('LOGOUT', (SELECT id FROM languages WHERE code = 'en'), 'Logout'),
('LOGOUT', (SELECT id FROM languages WHERE code = 'de'), 'Abmeldung'),
('LOGOUT', (SELECT id FROM languages WHERE code = 'hu'), 'Kijelentkezés'),

-- Document actions
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Create Document'),
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument erstellen'),
('CREATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum létrehozása'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Update Document'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument aktualisieren'),
('UPDATE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum módosítása'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Delete Document'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument löschen'),
('DELETE_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum törlése'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Publish Document'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Dokument veröffentlichen'),
('PUBLISH_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum közzététele'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'en'), 'Save as Draft'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'de'), 'Als Entwurf speichern'),
('DRAFT_DOCUMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Piszklapot mentés'),

-- File actions
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Create File'),
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei erstellen'),
('CREATE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl létrehozása'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Update File'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei aktualisieren'),
('UPDATE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl módosítása'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Delete File'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei löschen'),
('DELETE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl törlése'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Create Version'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Version erstellen'),
('VERSION_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Verzió létrehozása'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'en'), 'Restore File'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'de'), 'Datei wiederherstellen'),
('RESTORE_FILE', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl visszaállítása'),

-- Employee actions
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Create Employee'),
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter erstellen'),
('CREATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó létrehozása'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Update Employee'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter aktualisieren'),
('UPDATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó módosítása'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Delete Employee'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter löschen'),
('DELETE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó törlése'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Transfer Employee'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter transferieren'),
('TRANSFER_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó áthelyezése'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'en'), 'Reinstate Employee'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter wieder einstellen'),
('REINSTATE_EMPLOYEE', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó visszahelyezése'),

-- Lookup table creation actions (USER_CREATE_{LOOKUP_TYPE})
-- Languages
('USER_CREATE_LANGUAGES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Language'),
('USER_CREATE_LANGUAGES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Sprache'),
('USER_CREATE_LANGUAGES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó nyelv létrehozása'),

-- Object Types
('USER_CREATE_OBJECT_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Object Type'),
('USER_CREATE_OBJECT_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Objekttyp'),
('USER_CREATE_OBJECT_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó objektumtípus létrehozása'),

-- Object Statuses
('USER_CREATE_OBJECT_STATUSES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Object Status'),
('USER_CREATE_OBJECT_STATUSES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Objektstatus'),
('USER_CREATE_OBJECT_STATUSES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó objektumstátusz létrehozása'),

-- Sexes
('USER_CREATE_SEXES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Sex'),
('USER_CREATE_SEXES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Geschlecht'),
('USER_CREATE_SEXES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó nem létrehozása'),

-- Salutations
('USER_CREATE_SALUTATIONS', (SELECT id FROM languages WHERE code = 'en'), 'User Create Salutation'),
('USER_CREATE_SALUTATIONS', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Anrede'),
('USER_CREATE_SALUTATIONS', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó megszólítás létrehozása'),

-- Product Categories
('USER_CREATE_PRODUCT_CATEGORIES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Product Category'),
('USER_CREATE_PRODUCT_CATEGORIES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Produktkategorie'),
('USER_CREATE_PRODUCT_CATEGORIES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó termékkategória létrehozása'),

-- Countries
('USER_CREATE_COUNTRIES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Country'),
('USER_CREATE_COUNTRIES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Land'),
('USER_CREATE_COUNTRIES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó ország létrehozása'),

-- Address Types
('USER_CREATE_ADDRESS_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Address Type'),
('USER_CREATE_ADDRESS_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Adresstyp'),
('USER_CREATE_ADDRESS_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó címtípus létrehozása'),

-- Address Area Types
('USER_CREATE_ADDRESS_AREA_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Address Area Type'),
('USER_CREATE_ADDRESS_AREA_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Adressbereichstyp'),
('USER_CREATE_ADDRESS_AREA_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó címterülettípus létrehozása'),

-- Contact Types
('USER_CREATE_CONTACT_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Contact Type'),
('USER_CREATE_CONTACT_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Kontakttyp'),
('USER_CREATE_CONTACT_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó kapcsolattípus létrehozása'),

-- Transaction Types
('USER_CREATE_TRANSACTION_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Transaction Type'),
('USER_CREATE_TRANSACTION_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Transaktionstyp'),
('USER_CREATE_TRANSACTION_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó tranzakciótípus létrehozása'),

-- Currencies
('USER_CREATE_CURRENCIES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Currency'),
('USER_CREATE_CURRENCIES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Währung'),
('USER_CREATE_CURRENCIES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó pénznem létrehozása'),

-- Object Relation Types
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Object Relation Type'),
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Objektbeziehungstyp'),
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó objektumkapcsolat-típus létrehozása');

INSERT INTO audit_actions (code, is_active, object_type_id) VALUES 
('CREATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('UPDATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('DELETE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('ARCHIVE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('RESTORE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

('CREATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('UPDATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DELETE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DEACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('REACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

('CREATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UPDATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('DELETE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UNLOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOGIN', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOGOUT', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

('CREATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('UPDATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DELETE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('PUBLISH_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DRAFT_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),

('CREATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('UPDATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('DELETE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('VERSION_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('RESTORE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),

('CREATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('UPDATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('DELETE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('TRANSFER_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('REINSTATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),

-- Lookup table creation actions (scoped to 'user' object type)
-- These actions track when users create items in lookup/reference data tables
('USER_CREATE_LANGUAGES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_OBJECT_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_OBJECT_STATUSES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_SEXES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_SALUTATIONS', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_PRODUCT_CATEGORIES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_COUNTRIES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_ADDRESS_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_ADDRESS_AREA_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_CONTACT_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_TRANSACTION_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_CURRENCIES', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_OBJECT_RELATION_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user'));

-- ============================================================================
-- SECTION 11: IDENTIFICATION TYPES
-- ============================================================================

INSERT INTO identification_types (code, is_active, object_type_id) VALUES 
-- Person identification types
('passport', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('id_card', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('driver_license', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('birth_certificate', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('national_id', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('residence_permit', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('social_security_number', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('tax_number', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

-- Company identification types
('company_registration_number', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('tax_id', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('vat_number', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('business_license', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

-- Employee identification types
('employee_id', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('staff_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('social_insurance_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('pension_number', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),

-- User identification types
('user_username', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('user_email', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

-- Document and File identification types
('document_number', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('file_number', TRUE, (SELECT id FROM object_types WHERE code = 'file'));

-- Insert translations for identification types (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- Person identification documents
('passport', (SELECT id FROM languages WHERE code = 'en'), 'Passport'),
('passport', (SELECT id FROM languages WHERE code = 'de'), 'Pass'),
('passport', (SELECT id FROM languages WHERE code = 'hu'), 'Útlevélt'),
('id_card', (SELECT id FROM languages WHERE code = 'en'), 'ID Card'),
('id_card', (SELECT id FROM languages WHERE code = 'de'), 'Ausweis'),
('id_card', (SELECT id FROM languages WHERE code = 'hu'), 'Azonosító igazolvány'),
('driver_license', (SELECT id FROM languages WHERE code = 'en'), 'Driver License'),
('driver_license', (SELECT id FROM languages WHERE code = 'de'), 'Führerschein'),
('driver_license', (SELECT id FROM languages WHERE code = 'hu'), 'Jogosítvány'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'en'), 'Birth Certificate'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'de'), 'Geburtsurkunde'),
('birth_certificate', (SELECT id FROM languages WHERE code = 'hu'), 'Születési okirat'),
('national_id', (SELECT id FROM languages WHERE code = 'en'), 'National ID'),
('national_id', (SELECT id FROM languages WHERE code = 'de'), 'National-ID'),
('national_id', (SELECT id FROM languages WHERE code = 'hu'), 'Nemzeti azonosító'),
('residence_permit', (SELECT id FROM languages WHERE code = 'en'), 'Residence Permit'),
('residence_permit', (SELECT id FROM languages WHERE code = 'de'), 'Aufenthaltserlaubnis'),
('residence_permit', (SELECT id FROM languages WHERE code = 'hu'), 'Lakhelyengedély'),
('social_security_number', (SELECT id FROM languages WHERE code = 'en'), 'Social Security Number'),
('social_security_number', (SELECT id FROM languages WHERE code = 'de'), 'Sozialversicherungsnummer'),
('social_security_number', (SELECT id FROM languages WHERE code = 'hu'), 'Társadalombiztosítási szám'),
('tax_number', (SELECT id FROM languages WHERE code = 'en'), 'Tax Number'),
('tax_number', (SELECT id FROM languages WHERE code = 'de'), 'Steueridentifikationsnummer'),
('tax_number', (SELECT id FROM languages WHERE code = 'hu'), 'Adószám'),

-- Company identification documents
('company_registration_number', (SELECT id FROM languages WHERE code = 'en'), 'Company Registration Number'),
('company_registration_number', (SELECT id FROM languages WHERE code = 'de'), 'Firmenregistrierungsnummer'),
('company_registration_number', (SELECT id FROM languages WHERE code = 'hu'), 'Cégjegyzési szám'),
('tax_id', (SELECT id FROM languages WHERE code = 'en'), 'Tax ID'),
('tax_id', (SELECT id FROM languages WHERE code = 'de'), 'Steuer-ID'),
('tax_id', (SELECT id FROM languages WHERE code = 'hu'), 'Adóazonosító'),
('vat_number', (SELECT id FROM languages WHERE code = 'en'), 'VAT Number'),
('vat_number', (SELECT id FROM languages WHERE code = 'de'), 'Umsatzsteuer-Identifikationsnummer'),
('vat_number', (SELECT id FROM languages WHERE code = 'hu'), 'ÁFA szám'),
('business_license', (SELECT id FROM languages WHERE code = 'en'), 'Business License'),
('business_license', (SELECT id FROM languages WHERE code = 'de'), 'Gewerbeschein'),
('business_license', (SELECT id FROM languages WHERE code = 'hu'), 'Vállalkozási engedély'),

-- Employee identification documents
('employee_id', (SELECT id FROM languages WHERE code = 'en'), 'Employee ID'),
('employee_id', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiter-ID'),
('employee_id', (SELECT id FROM languages WHERE code = 'hu'), 'Dolgozó azonosító'),
('staff_number', (SELECT id FROM languages WHERE code = 'en'), 'Staff Number'),
('staff_number', (SELECT id FROM languages WHERE code = 'de'), 'Mitarbeiternummer'),
('staff_number', (SELECT id FROM languages WHERE code = 'hu'), 'Személyzeti szám'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'en'), 'Social Insurance Number'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'de'), 'Sozialversicherungsnummer'),
('social_insurance_number', (SELECT id FROM languages WHERE code = 'hu'), 'Társadalombiztosítási szám'),
('pension_number', (SELECT id FROM languages WHERE code = 'en'), 'Pension Number'),
('pension_number', (SELECT id FROM languages WHERE code = 'de'), 'Pensionsnummer'),
('pension_number', (SELECT id FROM languages WHERE code = 'hu'), 'Nyugdíj szám'),

-- User identification documents
('user_username', (SELECT id FROM languages WHERE code = 'en'), 'User Username'),
('user_username', (SELECT id FROM languages WHERE code = 'de'), 'Benutzername'),
('user_username', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználónév'),
('user_email', (SELECT id FROM languages WHERE code = 'en'), 'User Email'),
('user_email', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer-E-Mail'),
('user_email', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó e-mail'),

-- Document and File identification documents
('document_number', (SELECT id FROM languages WHERE code = 'en'), 'Document Number'),
('document_number', (SELECT id FROM languages WHERE code = 'de'), 'Dokumentnummer'),
('document_number', (SELECT id FROM languages WHERE code = 'hu'), 'Dokumentum szám'),
('file_number', (SELECT id FROM languages WHERE code = 'en'), 'File Number'),
('file_number', (SELECT id FROM languages WHERE code = 'de'), 'Dateinummer'),
('file_number', (SELECT id FROM languages WHERE code = 'hu'), 'Fájl szám');

-- ============================================================================
-- SECTION 12: CURRENCIES
-- ============================================================================

INSERT INTO currencies (code, is_active) VALUES 
('HUF', TRUE),  -- Hungarian Forint
('USD', TRUE),  -- US Dollar
('EUR', TRUE),  -- Euro
('GBP', TRUE),  -- British Pound
('CAD', TRUE),  -- Canadian Dollar
('JPY', TRUE),  -- Japanese Yen
('AUD', TRUE),  -- Australian Dollar
('CHF', TRUE),  -- Swiss Franc
('CNY', TRUE),  -- Chinese Yuan
('SEK', TRUE),  -- Swedish Krona
('NZD', TRUE),  -- New Zealand Dollar
('MXN', TRUE),  -- Mexican Peso
('SGD', TRUE),  -- Singapore Dollar
('NOK', TRUE),  -- Norwegian Krone
('KRW', TRUE),  -- South Korean Won
('TRY', TRUE),  -- Turkish Lira
('RUB', TRUE),  -- Russian Ruble
('BRL', TRUE),  -- Brazilian Real
('ZAR', TRUE),  -- South African Rand
('INR', TRUE);  -- Indian Rupee

-- Insert translations for currencies
-- FIX: Changed 'value' to 'text' to match schema
INSERT INTO translations (code, language_id, text) VALUES 
('HUF', (SELECT id FROM languages WHERE code = 'hu'), 'Forint'),
('HUF', (SELECT id FROM languages WHERE code = 'en'), 'Hungarian Forint'),
('HUF', (SELECT id FROM languages WHERE code = 'de'), 'Ungarischer Forint'),
('USD', (SELECT id FROM languages WHERE code = 'hu'), 'US-dollár'),
('USD', (SELECT id FROM languages WHERE code = 'en'), 'US Dollar'),
('USD', (SELECT id FROM languages WHERE code = 'de'), 'US-Dollar'),
('EUR', (SELECT id FROM languages WHERE code = 'hu'), 'Euro'),
('EUR', (SELECT id FROM languages WHERE code = 'en'), 'Euro'),
('EUR', (SELECT id FROM languages WHERE code = 'de'), 'Euro'),
('GBP', (SELECT id FROM languages WHERE code = 'hu'), 'Angol font'),
('GBP', (SELECT id FROM languages WHERE code = 'en'), 'British Pound'),
('GBP', (SELECT id FROM languages WHERE code = 'de'), 'Britisches Pfund'),
('CAD', (SELECT id FROM languages WHERE code = 'hu'), 'Canadai dollár'),
('CAD', (SELECT id FROM languages WHERE code = 'en'), 'Canadian Dollar'),
('CAD', (SELECT id FROM languages WHERE code = 'de'), 'Kanadischer Dollar'),
('JPY', (SELECT id FROM languages WHERE code = 'hu'), 'Jen'),
('JPY', (SELECT id FROM languages WHERE code = 'en'), 'Japanese Yen'),
('JPY', (SELECT id FROM languages WHERE code = 'de'), 'Japanischer Yen'),
('AUD', (SELECT id FROM languages WHERE code = 'hu'), 'Ausztrál dollár'),
('AUD', (SELECT id FROM languages WHERE code = 'en'), 'Australian Dollar'),
('AUD', (SELECT id FROM languages WHERE code = 'de'), 'Australischer Dollar'),
('CHF', (SELECT id FROM languages WHERE code = 'hu'), 'SVF frank'),
('CHF', (SELECT id FROM languages WHERE code = 'en'), 'Swiss Franc'),
('CHF', (SELECT id FROM languages WHERE code = 'de'), 'Schweizer Franken'),
('CNY', (SELECT id FROM languages WHERE code = 'hu'), 'Kínai jüan'),
('CNY', (SELECT id FROM languages WHERE code = 'en'), 'Chinese Yuan'),
('CNY', (SELECT id FROM languages WHERE code = 'de'), 'Chinesischer Yuan'),
('SEK', (SELECT id FROM languages WHERE code = 'hu'), 'Svéd korona'),
('SEK', (SELECT id FROM languages WHERE code = 'en'), 'Swedish Krona'),
('SEK', (SELECT id FROM languages WHERE code = 'de'), 'Schwedische Krone'),
('NZD', (SELECT id FROM languages WHERE code = 'hu'), 'Új-zélandi dollár'),
('NZD', (SELECT id FROM languages WHERE code = 'en'), 'New Zealand Dollar'),
('NZD', (SELECT id FROM languages WHERE code = 'de'), 'Neuseeland-Dollar'),
('MXN', (SELECT id FROM languages WHERE code = 'hu'), 'Mexikói peso'),
('MXN', (SELECT id FROM languages WHERE code = 'en'), 'Mexican Peso'),
('MXN', (SELECT id FROM languages WHERE code = 'de'), 'Mexikanischer Peson'),
('SGD', (SELECT id FROM languages WHERE code = 'hu'), 'Szingapúri dollár'),
('SGD', (SELECT id FROM languages WHERE code = 'en'), 'Singapore Dollar'),
('SGD', (SELECT id FROM languages WHERE code = 'de'), 'Singapur-Dollar'),
('NOK', (SELECT id FROM languages WHERE code = 'hu'), 'Norvég korona'),
('NOK', (SELECT id FROM languages WHERE code = 'en'), 'Norwegian Krone'),
('NOK', (SELECT id FROM languages WHERE code = 'de'), 'Norwegische Krone'),
('KRW', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-koreai won'),
('KRW', (SELECT id FROM languages WHERE code = 'en'), 'South Korean Won'),
('KRW', (SELECT id FROM languages WHERE code = 'de'), 'Südkoreanischer Won'),
('TRY', (SELECT id FROM languages WHERE code = 'hu'), 'Török lira'),
('TRY', (SELECT id FROM languages WHERE code = 'en'), 'Turkish Lira'),
('TRY', (SELECT id FROM languages WHERE code = 'de'), 'Türkische Lira'),
('RUB', (SELECT id FROM languages WHERE code = 'hu'), 'Orosz rubel'),
('RUB', (SELECT id FROM languages WHERE code = 'en'), 'Russian Ruble'),
('RUB', (SELECT id FROM languages WHERE code = 'de'), 'Russischer Rubel'),
('BRL', (SELECT id FROM languages WHERE code = 'hu'), 'Brazil jelzés'),
('BRL', (SELECT id FROM languages WHERE code = 'en'), 'Brazilian Real'),
('BRL', (SELECT id FROM languages WHERE code = 'de'), 'Brasilianischer Real'),
('ZAR', (SELECT id FROM languages WHERE code = 'hu'), 'Dél-afrikai rand'),
('ZAR', (SELECT id FROM languages WHERE code = 'en'), 'South African Rand'),
('ZAR', (SELECT id FROM languages WHERE code = 'de'), 'Südafrikanischer Rand'),
('INR', (SELECT id FROM languages WHERE code = 'hu'), 'Indiai rúpia'),
('INR', (SELECT id FROM languages WHERE code = 'en'), 'Indian Rupee'),
('INR', (SELECT id FROM languages WHERE code = 'de'), 'Indische Rupie');

-- ============================================================================
-- SECTION 13: TRANSACTION TYPES
-- ============================================================================

INSERT INTO transaction_types (code, is_active) VALUES 
('SALE', TRUE),
('PURCHASE', TRUE),
('TRANSFER', TRUE),
('RECEIPT', TRUE),
('PAYMENT', TRUE),
('REFUND', TRUE),
('INVOICE', TRUE),
('CREDIT', TRUE),
('DEBIT', TRUE),
('WITHDRAWAL', TRUE),
('DEPOSIT', TRUE),
('FEE', TRUE),
('INTEREST', TRUE),
('DISCOUNT', TRUE),
('TAX', TRUE),
('LOAN', TRUE),
('REPAYMENT', TRUE),
('CHARITY', TRUE),
('CHARITABLE', TRUE);

-- Insert translations for transaction types (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES 
('SALE', (SELECT id FROM languages WHERE code = 'hu'), 'Eladás'),
('SALE', (SELECT id FROM languages WHERE code = 'en'), 'Sale'),
('SALE', (SELECT id FROM languages WHERE code = 'de'), 'Verkauf'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'hu'), 'Vásárlás'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'en'), 'Purchase'),
('PURCHASE', (SELECT id FROM languages WHERE code = 'de'), 'Kauf'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'hu'), 'Átvitel'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'en'), 'Transfer'),
('TRANSFER', (SELECT id FROM languages WHERE code = 'de'), 'Überweisung'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'hu'), 'Bevétel'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'en'), 'Receipt'),
('RECEIPT', (SELECT id FROM languages WHERE code = 'de'), 'Einnahme'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Fizetés'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'en'), 'Payment'),
('PAYMENT', (SELECT id FROM languages WHERE code = 'de'), 'Zahlung'),
('REFUND', (SELECT id FROM languages WHERE code = 'hu'), 'Visszatérítés'),
('REFUND', (SELECT id FROM languages WHERE code = 'en'), 'Refund'),
('REFUND', (SELECT id FROM languages WHERE code = 'de'), 'Rückerstattung'),
('INVOICE', (SELECT id FROM languages WHERE code = 'hu'), 'Számla'),
('INVOICE', (SELECT id FROM languages WHERE code = 'en'), 'Invoice'),
('INVOICE', (SELECT id FROM languages WHERE code = 'de'), 'Rechnung'),
('CREDIT', (SELECT id FROM languages WHERE code = 'hu'), 'Kredit'),
('CREDIT', (SELECT id FROM languages WHERE code = 'en'), 'Credit'),
('CREDIT', (SELECT id FROM languages WHERE code = 'de'), 'Kredit'),
('DEBIT', (SELECT id FROM languages WHERE code = 'hu'), 'Debet'),
('DEBIT', (SELECT id FROM languages WHERE code = 'en'), 'Debit'),
('DEBIT', (SELECT id FROM languages WHERE code = 'de'), 'Debet'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'hu'), 'Felvétel'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'en'), 'Withdrawal'),
('WITHDRAWAL', (SELECT id FROM languages WHERE code = 'de'), 'Abhebung'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'hu'), 'Befizetés'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'en'), 'Deposit'),
('DEPOSIT', (SELECT id FROM languages WHERE code = 'de'), 'Einzahlung'),
('FEE', (SELECT id FROM languages WHERE code = 'hu'), 'Díj'),
('FEE', (SELECT id FROM languages WHERE code = 'en'), 'Fee'),
('FEE', (SELECT id FROM languages WHERE code = 'de'), 'Gebühr'),
('INTEREST', (SELECT id FROM languages WHERE code = 'hu'), 'Kamat'),
('INTEREST', (SELECT id FROM languages WHERE code = 'en'), 'Interest'),
('INTEREST', (SELECT id FROM languages WHERE code = 'de'), 'Zins'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'hu'), 'Kedvezmény'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'en'), 'Discount'),
('DISCOUNT', (SELECT id FROM languages WHERE code = 'de'), 'Rabatt'),
('TAX', (SELECT id FROM languages WHERE code = 'hu'), 'Adó'),
('TAX', (SELECT id FROM languages WHERE code = 'en'), 'Tax'),
('TAX', (SELECT id FROM languages WHERE code = 'de'), 'Steuer'),
('LOAN', (SELECT id FROM languages WHERE code = 'hu'), 'Hitel'),
('LOAN', (SELECT id FROM languages WHERE code = 'en'), 'Loan'),
('LOAN', (SELECT id FROM languages WHERE code = 'de'), 'Kredit'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'hu'), 'Tartozás'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'en'), 'Repayment'),
('REPAYMENT', (SELECT id FROM languages WHERE code = 'de'), 'Zahlung'),
('CHARITY', (SELECT id FROM languages WHERE code = 'hu'), 'Szociális'),
('CHARITY', (SELECT id FROM languages WHERE code = 'en'), 'Charity'),
('CHARITY', (SELECT id FROM languages WHERE code = 'de'), 'Wohltätigkeit'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'hu'), 'Szociális'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'en'), 'Charitable'),
('CHARITABLE', (SELECT id FROM languages WHERE code = 'de'), 'Wohltätige');

-- ============================================================================
-- SECTION 14: OBJECT RELATION TYPES
-- ============================================================================
-- CRITICAL: Translations must be inserted FIRST before object_relation_types
-- because object_relation_types.code references translations(code)

-- Insert translations for object_relation_types (English, German, Hungarian)
INSERT INTO translations (code, language_id, text) VALUES
-- Family relationship translations (Person-Person)
('mother', (SELECT id FROM languages WHERE code = 'en'), 'Mother'),
('mother', (SELECT id FROM languages WHERE code = 'de'), 'Mutter'),
('mother', (SELECT id FROM languages WHERE code = 'hu'), 'Anya'),
('father', (SELECT id FROM languages WHERE code = 'en'), 'Father'),
('father', (SELECT id FROM languages WHERE code = 'de'), 'Vater'),
('father', (SELECT id FROM languages WHERE code = 'hu'), 'Apa'),
('son', (SELECT id FROM languages WHERE code = 'en'), 'Son'),
('son', (SELECT id FROM languages WHERE code = 'de'), 'Sohn'),
('son', (SELECT id FROM languages WHERE code = 'hu'), 'Fiú'),
('daughter', (SELECT id FROM languages WHERE code = 'en'), 'Daughter'),
('daughter', (SELECT id FROM languages WHERE code = 'de'), 'Tochter'),
('daughter', (SELECT id FROM languages WHERE code = 'hu'), 'Lány'),
('parent', (SELECT id FROM languages WHERE code = 'en'), 'Parent'),
('parent', (SELECT id FROM languages WHERE code = 'de'), 'Elternteil'),
('parent', (SELECT id FROM languages WHERE code = 'hu'), 'Szülő'),
('child', (SELECT id FROM languages WHERE code = 'en'), 'Child'),
('child', (SELECT id FROM languages WHERE code = 'de'), 'Kind'),
('child', (SELECT id FROM languages WHERE code = 'hu'), 'Gyermek'),
('spouse', (SELECT id FROM languages WHERE code = 'en'), 'Spouse'),
('spouse', (SELECT id FROM languages WHERE code = 'de'), 'Ehepartner'),
('spouse', (SELECT id FROM languages WHERE code = 'hu'), 'Házastárs'),
('sibling', (SELECT id FROM languages WHERE code = 'en'), 'Sibling'),
('sibling', (SELECT id FROM languages WHERE code = 'de'), 'Geschwister'),
('sibling', (SELECT id FROM languages WHERE code = 'hu'), 'Testvér'),
('friend', (SELECT id FROM languages WHERE code = 'en'), 'Friend'),
('friend', (SELECT id FROM languages WHERE code = 'de'), 'Freund'),
('friend', (SELECT id FROM languages WHERE code = 'hu'), 'Barát'),
('colleague', (SELECT id FROM languages WHERE code = 'en'), 'Colleague'),
('colleague', (SELECT id FROM languages WHERE code = 'de'), 'Kollege'),
('colleague', (SELECT id FROM languages WHERE code = 'hu'), 'Kolléga'),

-- Business relationship translations (Company-Person)
('employer', (SELECT id FROM languages WHERE code = 'en'), 'Employer'),
('employer', (SELECT id FROM languages WHERE code = 'de'), 'Arbeitgeber'),
('employer', (SELECT id FROM languages WHERE code = 'hu'), 'Munkáltató'),
('worker', (SELECT id FROM languages WHERE code = 'en'), 'Worker'),
('worker', (SELECT id FROM languages WHERE code = 'de'), 'Arbeitnehmer'),
('worker', (SELECT id FROM languages WHERE code = 'hu'), 'Munkavállaló'),

-- Extended family relationship translations (Person-Person)
('grandparent', (SELECT id FROM languages WHERE code = 'en'), 'Grandparent'),
('grandparent', (SELECT id FROM languages WHERE code = 'de'), 'Großelternteil'),
('grandparent', (SELECT id FROM languages WHERE code = 'hu'), 'Nagyszülő'),
('grandchild', (SELECT id FROM languages WHERE code = 'en'), 'Grandchild'),
('grandchild', (SELECT id FROM languages WHERE code = 'de'), 'Enkelkind'),
('grandchild', (SELECT id FROM languages WHERE code = 'hu'), 'Unoka'),
('uncle', (SELECT id FROM languages WHERE code = 'en'), 'Uncle'),
('uncle', (SELECT id FROM languages WHERE code = 'de'), 'Onkel'),
('uncle', (SELECT id FROM languages WHERE code = 'hu'), 'Nagybácsi'),
('aunt', (SELECT id FROM languages WHERE code = 'en'), 'Aunt'),
('aunt', (SELECT id FROM languages WHERE code = 'de'), 'Tante'),
('aunt', (SELECT id FROM languages WHERE code = 'hu'), 'Nagynéni'),
('nephew', (SELECT id FROM languages WHERE code = 'en'), 'Nephew'),
('nephew', (SELECT id FROM languages WHERE code = 'de'), 'Neffe'),
('nephew', (SELECT id FROM languages WHERE code = 'hu'), 'Unokaöcs'),
('niece', (SELECT id FROM languages WHERE code = 'en'), 'Niece'),
('niece', (SELECT id FROM languages WHERE code = 'de'), 'Nichte'),
('niece', (SELECT id FROM languages WHERE code = 'hu'), 'Unokahúg'),
('cousin', (SELECT id FROM languages WHERE code = 'en'), 'Cousin'),
('cousin', (SELECT id FROM languages WHERE code = 'de'), 'Cousin'),
('cousin', (SELECT id FROM languages WHERE code = 'hu'), 'Unokatestvér'),
('mother_in_law', (SELECT id FROM languages WHERE code = 'en'), 'Mother-in-Law'),
('mother_in_law', (SELECT id FROM languages WHERE code = 'de'), 'Schwiegermutter'),
('mother_in_law', (SELECT id FROM languages WHERE code = 'hu'), 'Anyós'),
('father_in_law', (SELECT id FROM languages WHERE code = 'en'), 'Father-in-Law'),
('father_in_law', (SELECT id FROM languages WHERE code = 'de'), 'Schwiegerfather'),
('father_in_law', (SELECT id FROM languages WHERE code = 'hu'), 'Após'),
('son_in_law', (SELECT id FROM languages WHERE code = 'en'), 'Son-in-Law'),
('son_in_law', (SELECT id FROM languages WHERE code = 'de'), 'Schwiegersohn'),
('son_in_law', (SELECT id FROM languages WHERE code = 'hu'), 'Vő'),
('daughter_in_law', (SELECT id FROM languages WHERE code = 'en'), 'Daughter-in-Law'),
('daughter_in_law', (SELECT id FROM languages WHERE code = 'de'), 'Schwiegertochter'),
('daughter_in_law', (SELECT id FROM languages WHERE code = 'hu'), 'Menye'),

-- Professional relationship translations (Person-Person)
('manager', (SELECT id FROM languages WHERE code = 'en'), 'Manager'),
('manager', (SELECT id FROM languages WHERE code = 'de'), 'Vorgesetzter'),
('manager', (SELECT id FROM languages WHERE code = 'hu'), 'Menedzser'),
('subordinate', (SELECT id FROM languages WHERE code = 'en'), 'Subordinate'),
('subordinate', (SELECT id FROM languages WHERE code = 'de'), 'Untergebener'),
('subordinate', (SELECT id FROM languages WHERE code = 'hu'), 'Beosztott'),
('mentor', (SELECT id FROM languages WHERE code = 'en'), 'Mentor'),
('mentor', (SELECT id FROM languages WHERE code = 'de'), 'Mentor'),
('mentor', (SELECT id FROM languages WHERE code = 'hu'), 'Mentor'),
('mentee', (SELECT id FROM languages WHERE code = 'en'), 'Mentee'),
('mentee', (SELECT id FROM languages WHERE code = 'de'), 'Mentee'),
('mentee', (SELECT id FROM languages WHERE code = 'hu'), 'Mentorált'),
('teacher', (SELECT id FROM languages WHERE code = 'en'), 'Teacher'),
('teacher', (SELECT id FROM languages WHERE code = 'de'), 'Lehrer'),
('teacher', (SELECT id FROM languages WHERE code = 'hu'), 'Tanár'),
('student', (SELECT id FROM languages WHERE code = 'en'), 'Student'),
('student', (SELECT id FROM languages WHERE code = 'de'), 'Schüler'),
('student', (SELECT id FROM languages WHERE code = 'hu'), 'Tanuló'),
('neighbor', (SELECT id FROM languages WHERE code = 'en'), 'Neighbor'),
('neighbor', (SELECT id FROM languages WHERE code = 'de'), 'Nachbar'),
('neighbor', (SELECT id FROM languages WHERE code = 'hu'), 'Szomszéd'),
('acquaintance', (SELECT id FROM languages WHERE code = 'en'), 'Acquaintance'),
('acquaintance', (SELECT id FROM languages WHERE code = 'de'), 'Bekannter'),
('acquaintance', (SELECT id FROM languages WHERE code = 'hu'), 'Ismerős'),

-- Business relationship translations (Company-Person)
('client', (SELECT id FROM languages WHERE code = 'en'), 'Client'),
('client', (SELECT id FROM languages WHERE code = 'de'), 'Kunde'),
('client', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfél'),
('client_of', (SELECT id FROM languages WHERE code = 'en'), 'Client Of'),
('client_of', (SELECT id FROM languages WHERE code = 'de'), 'Kunde von'),
('client_of', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfél'),
('vendor', (SELECT id FROM languages WHERE code = 'en'), 'Vendor'),
('vendor', (SELECT id FROM languages WHERE code = 'de'), 'Lieferant'),
('vendor', (SELECT id FROM languages WHERE code = 'hu'), 'Beszállító'),
('vendor_to', (SELECT id FROM languages WHERE code = 'en'), 'Vendor To'),
('vendor_to', (SELECT id FROM languages WHERE code = 'de'), 'Lieferant für'),
('vendor_to', (SELECT id FROM languages WHERE code = 'hu'), 'Beszállító'),
('consultant', (SELECT id FROM languages WHERE code = 'en'), 'Consultant'),
('consultant', (SELECT id FROM languages WHERE code = 'de'), 'Berater'),
('consultant', (SELECT id FROM languages WHERE code = 'hu'), 'Tanácsadó'),
('consultant_to', (SELECT id FROM languages WHERE code = 'en'), 'Consultant To'),
('consultant_to', (SELECT id FROM languages WHERE code = 'de'), 'Berater für'),
('consultant_to', (SELECT id FROM languages WHERE code = 'hu'), 'Tanácsadó'),
('advisor', (SELECT id FROM languages WHERE code = 'en'), 'Advisor'),
('advisor', (SELECT id FROM languages WHERE code = 'de'), 'Berater'),
('advisor', (SELECT id FROM languages WHERE code = 'hu'), 'Tanácsadó'),
('advisor_to', (SELECT id FROM languages WHERE code = 'en'), 'Advisor To'),
('advisor_to', (SELECT id FROM languages WHERE code = 'de'), 'Berater für'),
('advisor_to', (SELECT id FROM languages WHERE code = 'hu'), 'Tanácsadó'),
('board_member', (SELECT id FROM languages WHERE code = 'en'), 'Board Member'),
('board_member', (SELECT id FROM languages WHERE code = 'de'), 'Vorstandsmitglied'),
('board_member', (SELECT id FROM languages WHERE code = 'hu'), 'Igazgatótanácsi tag'),

-- Company-Company relationship translations
('business_partner', (SELECT id FROM languages WHERE code = 'en'), 'Business Partner'),
('business_partner', (SELECT id FROM languages WHERE code = 'de'), 'Geschäftspartner'),
('business_partner', (SELECT id FROM languages WHERE code = 'hu'), 'Üzleti partner'),
('subsidiary', (SELECT id FROM languages WHERE code = 'en'), 'Subsidiary'),
('subsidiary', (SELECT id FROM languages WHERE code = 'de'), 'Tochtergesellschaft'),
('subsidiary', (SELECT id FROM languages WHERE code = 'hu'), 'Leányvállalat'),
('parent_company', (SELECT id FROM languages WHERE code = 'en'), 'Parent Company'),
('parent_company', (SELECT id FROM languages WHERE code = 'de'), 'Muttergesellschaft'),
('parent_company', (SELECT id FROM languages WHERE code = 'hu'), 'Anyavállalat'),
('supplier_company', (SELECT id FROM languages WHERE code = 'en'), 'Supplier Company'),
('supplier_company', (SELECT id FROM languages WHERE code = 'de'), 'Lieferantenunternehmen'),
('supplier_company', (SELECT id FROM languages WHERE code = 'hu'), 'Beszállító cég'),
('customer_company', (SELECT id FROM languages WHERE code = 'en'), 'Customer Company'),
('customer_company', (SELECT id FROM languages WHERE code = 'de'), 'Kundenunternehmen'),
('customer_company', (SELECT id FROM languages WHERE code = 'hu'), 'Ügyfél cég'),
('competitor', (SELECT id FROM languages WHERE code = 'en'), 'Competitor'),
('competitor', (SELECT id FROM languages WHERE code = 'de'), 'Wettbewerber'),
('competitor', (SELECT id FROM languages WHERE code = 'hu'), 'Versenytárs');

-- Now insert object_relation_types (after translations exist)
-- Insert directional relationships (will update mirrored_type_id after all inserts)
-- Family relationships (Person → Person)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('mother', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('father', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('son', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('daughter', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('parent', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('child', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Business relationships (Company → Person and Person → Company)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('employer', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('worker', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'company'), NULL);

-- Symmetric relationships (self-mirrored, Person → Person)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('spouse', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('sibling', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('friend', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('colleague', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Extended family relationships (Person → Person)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('grandparent', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('grandchild', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('uncle', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('aunt', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('nephew', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('niece', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('mother_in_law', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('father_in_law', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('son_in_law', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('daughter_in_law', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Professional relationships (Person → Person)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('manager', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('subordinate', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('mentor', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('mentee', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('teacher', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('student', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Additional person-to-person relationships (symmetric)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('neighbor', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('acquaintance', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('cousin', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Additional business relationships (Company → Person, with mirrors)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('client', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('client_of', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('vendor', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('vendor_to', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('consultant', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('consultant_to', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('advisor', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL),
('advisor_to', TRUE, (SELECT id FROM object_types WHERE code = 'person'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('board_member', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'person'), NULL);

-- Company-Company relationships (directional)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('subsidiary', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('parent_company', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('supplier_company', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('customer_company', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL);

-- Symmetric relationships (self-mirrored, Company → Company)
INSERT INTO object_relation_types (code, is_active, parent_object_type_id, child_object_type_id, mirrored_type_id) VALUES
('business_partner', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL),
('competitor', TRUE, (SELECT id FROM object_types WHERE code = 'company'), (SELECT id FROM object_types WHERE code = 'company'), NULL);

-- Update mirrored relationships for directional pairs
-- Mother ↔ Son
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'son') 
WHERE code = 'mother';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'mother') 
WHERE code = 'son';

-- Father ↔ Daughter
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'daughter') 
WHERE code = 'father';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'father') 
WHERE code = 'daughter';

-- Parent ↔ Child
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'child') 
WHERE code = 'parent';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'parent') 
WHERE code = 'child';

-- Employer ↔ Worker
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'worker') 
WHERE code = 'employer';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'employer') 
WHERE code = 'worker';

-- Update self-mirrored symmetric relationships
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'spouse') 
WHERE code = 'spouse';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'sibling') 
WHERE code = 'sibling';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'friend') 
WHERE code = 'friend';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'colleague') 
WHERE code = 'colleague';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'business_partner') 
WHERE code = 'business_partner';

-- Update mirrored relationships for extended family pairs
-- Grandparent ↔ Grandchild
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'grandchild') 
WHERE code = 'grandparent';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'grandparent') 
WHERE code = 'grandchild';

-- Uncle ↔ Nephew
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'nephew') 
WHERE code = 'uncle';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'uncle') 
WHERE code = 'nephew';

-- Aunt ↔ Niece
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'niece') 
WHERE code = 'aunt';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'aunt') 
WHERE code = 'niece';

-- Mother-in-Law ↔ Son-in-Law
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'son_in_law') 
WHERE code = 'mother_in_law';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'mother_in_law') 
WHERE code = 'son_in_law';

-- Father-in-Law ↔ Daughter-in-Law
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'daughter_in_law') 
WHERE code = 'father_in_law';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'father_in_law') 
WHERE code = 'daughter_in_law';

-- Update mirrored relationships for professional pairs
-- Manager ↔ Subordinate
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'subordinate') 
WHERE code = 'manager';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'manager') 
WHERE code = 'subordinate';

-- Mentor ↔ Mentee
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'mentee') 
WHERE code = 'mentor';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'mentor') 
WHERE code = 'mentee';

-- Teacher ↔ Student
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'student') 
WHERE code = 'teacher';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'teacher') 
WHERE code = 'student';

-- Update self-mirrored symmetric relationships
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'neighbor') 
WHERE code = 'neighbor';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'acquaintance') 
WHERE code = 'acquaintance';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'cousin') 
WHERE code = 'cousin';

-- Update mirrored relationships for company-company pairs
-- Subsidiary ↔ Parent Company
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'parent_company') 
WHERE code = 'subsidiary';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'subsidiary') 
WHERE code = 'parent_company';

-- Supplier Company ↔ Customer Company
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'customer_company') 
WHERE code = 'supplier_company';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'supplier_company') 
WHERE code = 'customer_company';

-- Update mirrored relationships for business pairs (Company ↔ Person)
-- Client ↔ Client Of
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'client_of') 
WHERE code = 'client';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'client') 
WHERE code = 'client_of';

-- Vendor ↔ Vendor To
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'vendor_to') 
WHERE code = 'vendor';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'vendor') 
WHERE code = 'vendor_to';

-- Consultant ↔ Consultant To
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'consultant_to') 
WHERE code = 'consultant';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'consultant') 
WHERE code = 'consultant_to';

-- Advisor ↔ Advisor To
UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'advisor_to') 
WHERE code = 'advisor';

UPDATE object_relation_types 
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'advisor') 
WHERE code = 'advisor_to';

-- Update self-mirrored symmetric company relationships
UPDATE object_relation_types
SET mirrored_type_id = (SELECT id FROM object_relation_types WHERE code = 'competitor')
WHERE code = 'competitor';

-- ============================================================================
-- SECTION 15: NOTE TYPES
-- ============================================================================

INSERT INTO note_types (code, is_active) VALUES
('note_general', TRUE),
('note_meeting', TRUE),
('note_reminder', TRUE),
('note_important', TRUE),
('note_follow_up', TRUE),
('note_internal', TRUE),
('note_customer_facing', TRUE);

-- Insert translations for note_types (English, German, Hungarian)
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

-- ============================================================================
-- SECTION 16: OBJECT RELATIONS (Example Data)
-- ============================================================================
-- Note: These are example relationships. In production, you would insert actual
-- object IDs after creating objects. The examples below show the structure.
-- 
-- Example usage:
-- INSERT INTO object_relations (object_from_id, object_to_id, object_relation_type_id, note, is_active) VALUES
-- ((SELECT id FROM companies WHERE company_id = 'REG-12345'), 
--  (SELECT id FROM persons WHERE first_name = 'John' AND last_name = 'Doe'),
--  (SELECT id FROM object_relation_types WHERE code = 'worker'),
--  'Full-time worker since 2020', TRUE);

-- ============================================================================
-- VERIFICATION QUERIES FOR OBJECT RELATION TYPES
-- ============================================================================
-- Uncomment these queries to verify the seed data was inserted correctly:

-- Show all object relation types with their object type references
-- SELECT 
--     ort.id,
--     ort.code,
--     ort.is_active,
--     pt.code as parent_object_type,
--     ct.code as child_object_type,
--     mrt.code as mirrored_relation_type
-- FROM object_relation_types ort
-- LEFT JOIN object_types pt ON ort.parent_object_type_id = pt.id
-- LEFT JOIN object_types ct ON ort.child_object_type_id = ct.id
-- LEFT JOIN object_relation_types mrt ON ort.mirrored_type_id = mrt.id
-- ORDER BY ort.code;

-- Show directional relationships with their mirrors
-- SELECT 
--     ort1.code as relation_type,
--     ort1.mirrored_type_id,
--     ort2.code as mirrored_type
-- FROM object_relation_types ort1
-- LEFT JOIN object_relation_types ort2 ON ort1.mirrored_type_id = ort2.id
-- WHERE ort1.mirrored_type_id IS NOT NULL
-- ORDER BY ort1.code;

-- Count relationships by type
-- SELECT 
--     pt.code as parent_type,
--     ct.code as child_type,
--     COUNT(*) as count
-- FROM object_relation_types ort
-- LEFT JOIN object_types pt ON ort.parent_object_type_id = pt.id
-- LEFT JOIN object_types ct ON ort.child_object_type_id = ct.id
-- GROUP BY pt.code, ct.code
-- ORDER BY pt.code, ct.code;

-- Verify no employee relationships exist
-- SELECT COUNT(*) as employee_relationship_count
-- FROM object_relation_types
-- WHERE code LIKE '%employee%' OR code = 'employee';
-- Should return 0

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

