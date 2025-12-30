-- ============================================================================
-- Audit Actions Seed Data
-- ============================================================================
-- This file contains seed data for the audit_actions lookup table
--
-- Table Structure:
--   - id: Auto-increment primary key
--   - code: Unique action code (references translations.code)
--   - is_active: Boolean flag for soft delete
--   - object_type_id: Foreign key to object_types table
--
-- Usage:
--   1. Ensure translations table is populated first (foreign key constraint)
--   2. Ensure object_types table is populated first (foreign key constraint)
--   3. Run this script to populate audit_actions
--
-- Note: This script is an ADDITION to the existing 02_seed_data.sql
--       The data below is ALREADY included in 02_seed_data.sql
--       Use this file as a REFERENCE for the audit_actions structure
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Insert translations for audit action codes
-- ----------------------------------------------------------------------------
-- NOTE: These translations MUST be inserted BEFORE audit_actions due to foreign key constraint

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
-- These actions track when users create items in lookup/reference data tables
-- All scoped to 'user' object type

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

-- Audit Actions (for managing audit_actions table itself)
('USER_CREATE_AUDIT_ACTIONS', (SELECT id FROM languages WHERE code = 'en'), 'User Create Audit Action'),
('USER_CREATE_AUDIT_ACTIONS', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Audit-Aktion'),
('USER_CREATE_AUDIT_ACTIONS', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó audit-művelet létrehozása'),

-- Object Relation Types
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'en'), 'User Create Object Relation Type'),
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'de'), 'Benutzer erstellt Objektbeziehungstyp'),
('USER_CREATE_OBJECT_RELATION_TYPES', (SELECT id FROM languages WHERE code = 'hu'), 'Felhasználó objektumkapcsolat-típus létrehozása');

-- ----------------------------------------------------------------------------
-- STEP 2: Insert audit_actions records
-- ----------------------------------------------------------------------------
-- NOTE: Translations MUST be inserted first (see STEP 1 above)

INSERT INTO audit_actions (code, is_active, object_type_id) VALUES
-- Person actions (object_type: person)
('CREATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('UPDATE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('DELETE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('ARCHIVE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),
('RESTORE_PERSON', TRUE, (SELECT id FROM object_types WHERE code = 'person')),

-- Company actions (object_type: company)
('CREATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('UPDATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DELETE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('DEACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),
('REACTIVATE_COMPANY', TRUE, (SELECT id FROM object_types WHERE code = 'company')),

-- User actions (object_type: user)
('CREATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UPDATE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('DELETE_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('UNLOCK_USER', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOGIN', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('LOGOUT', TRUE, (SELECT id FROM object_types WHERE code = 'user')),

-- Document actions (object_type: document)
('CREATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('UPDATE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DELETE_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('PUBLISH_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),
('DRAFT_DOCUMENT', TRUE, (SELECT id FROM object_types WHERE code = 'document')),

-- File actions (object_type: file)
('CREATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('UPDATE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('DELETE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('VERSION_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),
('RESTORE_FILE', TRUE, (SELECT id FROM object_types WHERE code = 'file')),

-- Employee actions (object_type: employee)
('CREATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('UPDATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('DELETE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('TRANSFER_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),
('REINSTATE_EMPLOYEE', TRUE, (SELECT id FROM object_types WHERE code = 'employee')),

-- Lookup table creation actions (all scoped to 'user' object type)
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
('USER_CREATE_AUDIT_ACTIONS', TRUE, (SELECT id FROM object_types WHERE code = 'user')),
('USER_CREATE_OBJECT_RELATION_TYPES', TRUE, (SELECT id FROM object_types WHERE code = 'user'));

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify the data was inserted correctly

-- Check audit_actions count
-- Expected: 40 records (5 person + 5 company + 7 user + 5 document + 5 file + 5 employee + 14 user_create_*)
SELECT COUNT(*) as total_audit_actions FROM audit_actions;

-- Check audit_actions by object_type
SELECT
    ot.code as object_type,
    COUNT(*) as action_count
FROM audit_actions aa
JOIN object_types ot ON ot.id = aa.object_type_id
GROUP BY ot.code
ORDER BY ot.code;

-- Sample audit_actions with translations
SELECT
    aa.id,
    aa.code,
    ot.code as object_type,
    t_en.text as name_en,
    t_de.text as name_de,
    t_hu.text as name_hu,
    aa.is_active
FROM audit_actions aa
JOIN object_types ot ON ot.id = aa.object_type_id
LEFT JOIN translations t_en ON t_en.code = aa.code AND t_en.language_id = (SELECT id FROM languages WHERE code = 'en')
LEFT JOIN translations t_de ON t_de.code = aa.code AND t_de.language_id = (SELECT id FROM languages WHERE code = 'de')
LEFT JOIN translations t_hu ON t_hu.code = aa.code AND t_hu.language_id = (SELECT id FROM languages WHERE code = 'hu')
ORDER BY ot.code, aa.code
LIMIT 20;
