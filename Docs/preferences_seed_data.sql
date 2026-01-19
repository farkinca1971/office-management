-- ============================================
-- USER PREFERENCES SYSTEM SEED DATA
-- ============================================
-- Created: 2026-01-19
-- Description: Initial preference categories, definitions, and translations
-- Prerequisites: Run preferences_schema.sql first

-- ============================================
-- TRANSLATIONS FOR PREFERENCES
-- ============================================

-- Preference Category Translations
INSERT INTO translations (code, language_id, text) VALUES
-- UI Category
('pref_cat_ui_desc', 1, 'User Interface Preferences'),
('pref_cat_ui_desc', 2, 'Benutzeroberflächeneinstellungen'),
('pref_cat_ui_desc', 3, 'Felhasználói felület beállításai'),

-- API Category
('pref_cat_api_desc', 1, 'API Configuration Settings'),
('pref_cat_api_desc', 2, 'API-Konfigurationseinstellungen'),
('pref_cat_api_desc', 3, 'API konfigurációs beállítások'),

-- Notifications Category
('pref_cat_notifications_desc', 1, 'Notification Settings'),
('pref_cat_notifications_desc', 2, 'Benachrichtigungseinstellungen'),
('pref_cat_notifications_desc', 3, 'Értesítési beállítások'),

-- Security Category
('pref_cat_security_desc', 1, 'Security and Privacy Settings'),
('pref_cat_security_desc', 2, 'Sicherheits- und Datenschutzeinstellungen'),
('pref_cat_security_desc', 3, 'Biztonsági és adatvédelmi beállítások'),

-- Localization Category
('pref_cat_localization_desc', 1, 'Language and Regional Settings'),
('pref_cat_localization_desc', 2, 'Sprach- und Regionaleinstellungen'),
('pref_cat_localization_desc', 3, 'Nyelvi és regionális beállítások'),

-- Data Display Category
('pref_cat_data_display_desc', 1, 'Data Display Preferences'),
('pref_cat_data_display_desc', 2, 'Datenanzeigeeinstellungen'),
('pref_cat_data_display_desc', 3, 'Adatmegjelenítési beállítások'),

-- ============================================
-- UI PREFERENCE TRANSLATIONS
-- ============================================

-- Theme
('pref_ui_theme_name', 1, 'Theme'),
('pref_ui_theme_name', 2, 'Thema'),
('pref_ui_theme_name', 3, 'Téma'),
('pref_ui_theme_desc', 1, 'Color theme preference (light or dark mode)'),
('pref_ui_theme_desc', 2, 'Farbthema-Präferenz (heller oder dunkler Modus)'),
('pref_ui_theme_desc', 3, 'Színtéma preferencia (világos vagy sötét mód)'),

-- Language
('pref_ui_language_name', 1, 'Interface Language'),
('pref_ui_language_name', 2, 'Oberflächensprache'),
('pref_ui_language_name', 3, 'Felület nyelve'),
('pref_ui_language_desc', 1, 'Preferred language for the user interface'),
('pref_ui_language_desc', 2, 'Bevorzugte Sprache für die Benutzeroberfläche'),
('pref_ui_language_desc', 3, 'Előnyben részesített nyelv a felhasználói felülethez'),

-- Date Format
('pref_ui_date_format_name', 1, 'Date Format'),
('pref_ui_date_format_name', 2, 'Datumsformat'),
('pref_ui_date_format_name', 3, 'Dátumformátum'),
('pref_ui_date_format_desc', 1, 'Preferred date display format (YYYY-MM-DD, DD/MM/YYYY, etc.)'),
('pref_ui_date_format_desc', 2, 'Bevorzugtes Datumsanzeigeformat (JJJJ-MM-TT, TT/MM/JJJJ usw.)'),
('pref_ui_date_format_desc', 3, 'Előnyben részesített dátummegjelenítési formátum (ÉÉÉÉ-HH-NN, NN/HH/ÉÉÉÉ stb.)'),

-- Time Format
('pref_ui_time_format_name', 1, 'Time Format'),
('pref_ui_time_format_name', 2, 'Zeitformat'),
('pref_ui_time_format_name', 3, 'Időformátum'),
('pref_ui_time_format_desc', 1, 'Preferred time format (12-hour or 24-hour)'),
('pref_ui_time_format_desc', 2, 'Bevorzugtes Zeitformat (12-Stunden oder 24-Stunden)'),
('pref_ui_time_format_desc', 3, 'Előnyben részesített időformátum (12 órás vagy 24 órás)'),

-- Items Per Page
('pref_ui_items_per_page_name', 1, 'Items Per Page'),
('pref_ui_items_per_page_name', 2, 'Elemente pro Seite'),
('pref_ui_items_per_page_name', 3, 'Elemek oldalanként'),
('pref_ui_items_per_page_desc', 1, 'Default number of items to display per page in tables'),
('pref_ui_items_per_page_desc', 2, 'Standardanzahl der anzuzeigenden Elemente pro Seite in Tabellen'),
('pref_ui_items_per_page_desc', 3, 'Alapértelmezett elemszám oldalonként a táblázatokban'),

-- Sidebar Collapsed
('pref_ui_sidebar_collapsed_name', 1, 'Sidebar Collapsed'),
('pref_ui_sidebar_collapsed_name', 2, 'Seitenleiste eingeklappt'),
('pref_ui_sidebar_collapsed_name', 3, 'Oldalsáv összecsukva'),
('pref_ui_sidebar_collapsed_desc', 1, 'Whether the sidebar should be collapsed by default'),
('pref_ui_sidebar_collapsed_desc', 2, 'Ob die Seitenleiste standardmäßig eingeklappt sein soll'),
('pref_ui_sidebar_collapsed_desc', 3, 'Hogy az oldalsáv alapértelmezetten össze legyen-e csukva'),

-- ============================================
-- DATA DISPLAY PREFERENCE TRANSLATIONS
-- ============================================

-- Default Currency
('pref_data_default_currency_name', 1, 'Default Currency'),
('pref_data_default_currency_name', 2, 'Standardwährung'),
('pref_data_default_currency_name', 3, 'Alapértelmezett pénznem'),
('pref_data_default_currency_desc', 1, 'Default currency for financial displays and forms'),
('pref_data_default_currency_desc', 2, 'Standardwährung für Finanzanzeigen und Formulare'),
('pref_data_default_currency_desc', 3, 'Alapértelmezett pénznem pénzügyi megjelenítésekhez és űrlapokhoz'),

-- Default Country
('pref_data_default_country_name', 1, 'Default Country'),
('pref_data_default_country_name', 2, 'Standardland'),
('pref_data_default_country_name', 3, 'Alapértelmezett ország'),
('pref_data_default_country_desc', 1, 'Default country selection in address forms'),
('pref_data_default_country_desc', 2, 'Standardländerauswahl in Adressformularen'),
('pref_data_default_country_desc', 3, 'Alapértelmezett országválasztás címűrlapokon'),

-- Default Address Type
('pref_data_default_address_type_name', 1, 'Default Address Type'),
('pref_data_default_address_type_name', 2, 'Standard-Adresstyp'),
('pref_data_default_address_type_name', 3, 'Alapértelmezett címtípus'),
('pref_data_default_address_type_desc', 1, 'Default address type (home, work, etc.) for new addresses'),
('pref_data_default_address_type_desc', 2, 'Standard-Adresstyp (Zuhause, Arbeit usw.) für neue Adressen'),
('pref_data_default_address_type_desc', 3, 'Alapértelmezett címtípus (otthon, munka stb.) új címekhez'),

-- Default Contact Type
('pref_data_default_contact_type_name', 1, 'Default Contact Type'),
('pref_data_default_contact_type_name', 2, 'Standard-Kontakttyp'),
('pref_data_default_contact_type_name', 3, 'Alapértelmezett kapcsolattípus'),
('pref_data_default_contact_type_desc', 1, 'Default contact type (email, phone, etc.) for new contacts'),
('pref_data_default_contact_type_desc', 2, 'Standard-Kontakttyp (E-Mail, Telefon usw.) für neue Kontakte'),
('pref_data_default_contact_type_desc', 3, 'Alapértelmezett kapcsolattípus (email, telefon stb.) új kapcsolatokhoz'),

-- ============================================
-- API PREFERENCE TRANSLATIONS
-- ============================================

-- API Timeout
('pref_api_timeout_name', 1, 'API Timeout'),
('pref_api_timeout_name', 2, 'API-Zeitüberschreitung'),
('pref_api_timeout_name', 3, 'API időtúllépés'),
('pref_api_timeout_desc', 1, 'Request timeout in milliseconds for API calls'),
('pref_api_timeout_desc', 2, 'Anforderungszeitlimit in Millisekunden für API-Aufrufe'),
('pref_api_timeout_desc', 3, 'Kérés időtúllépése milliszekundumban API hívásokhoz'),

-- API Retry Attempts
('pref_api_retry_attempts_name', 1, 'Retry Attempts'),
('pref_api_retry_attempts_name', 2, 'Wiederholungsversuche'),
('pref_api_retry_attempts_name', 3, 'Újrapróbálkozási kísérletek'),
('pref_api_retry_attempts_desc', 1, 'Number of retry attempts for failed API requests'),
('pref_api_retry_attempts_desc', 2, 'Anzahl der Wiederholungsversuche für fehlgeschlagene API-Anfragen'),
('pref_api_retry_attempts_desc', 3, 'Újrapróbálkozási kísérletek száma sikertelen API kérésekhez'),

-- API Cache Enabled
('pref_api_cache_enabled_name', 1, 'Enable API Cache'),
('pref_api_cache_enabled_name', 2, 'API-Cache aktivieren'),
('pref_api_cache_enabled_name', 3, 'API gyorsítótár engedélyezése'),
('pref_api_cache_enabled_desc', 1, 'Enable caching of API responses for improved performance'),
('pref_api_cache_enabled_desc', 2, 'Caching von API-Antworten für verbesserte Leistung aktivieren'),
('pref_api_cache_enabled_desc', 3, 'API válaszok gyorsítótárazásának engedélyezése a jobb teljesítményért'),

-- ============================================
-- NOTIFICATION PREFERENCE TRANSLATIONS
-- ============================================

-- Email Notifications
('pref_notif_email_enabled_name', 1, 'Email Notifications'),
('pref_notif_email_enabled_name', 2, 'E-Mail-Benachrichtigungen'),
('pref_notif_email_enabled_name', 3, 'Email értesítések'),
('pref_notif_email_enabled_desc', 1, 'Receive notifications via email'),
('pref_notif_email_enabled_desc', 2, 'Benachrichtigungen per E-Mail erhalten'),
('pref_notif_email_enabled_desc', 3, 'Értesítések fogadása emailben'),

-- Push Notifications
('pref_notif_push_enabled_name', 1, 'Push Notifications'),
('pref_notif_push_enabled_name', 2, 'Push-Benachrichtigungen'),
('pref_notif_push_enabled_name', 3, 'Push értesítések'),
('pref_notif_push_enabled_desc', 1, 'Receive push notifications in the browser'),
('pref_notif_push_enabled_desc', 2, 'Push-Benachrichtigungen im Browser erhalten'),
('pref_notif_push_enabled_desc', 3, 'Push értesítések fogadása a böngészőben'),

-- Sound Notifications
('pref_notif_sound_enabled_name', 1, 'Notification Sounds'),
('pref_notif_sound_enabled_name', 2, 'Benachrichtigungstöne'),
('pref_notif_sound_enabled_name', 3, 'Értesítési hangok'),
('pref_notif_sound_enabled_desc', 1, 'Play sounds for notifications'),
('pref_notif_sound_enabled_desc', 2, 'Töne für Benachrichtigungen abspielen'),
('pref_notif_sound_enabled_desc', 3, 'Hangok lejátszása értesítésekhez');

-- ============================================
-- PREFERENCE CATEGORIES
-- ============================================

INSERT INTO preference_categories (code, description_code) VALUES
('ui', 'pref_cat_ui_desc'),
('api', 'pref_cat_api_desc'),
('notifications', 'pref_cat_notifications_desc'),
('security', 'pref_cat_security_desc'),
('localization', 'pref_cat_localization_desc'),
('data_display', 'pref_cat_data_display_desc');

-- ============================================
-- PREFERENCE DEFINITIONS
-- ============================================

-- UI Preferences
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, group_name, is_user_editable, scope, sort_order)
VALUES
-- Theme
(1, 'ui.theme', 'pref_ui_theme_name', 'pref_ui_theme_desc', 'string', 'light', 'appearance', TRUE, 'user', 10),

-- Language
(1, 'ui.language', 'pref_ui_language_name', 'pref_ui_language_desc', 'number', '1', 'localization', TRUE, 'user', 20),

-- Date Format
(1, 'ui.date_format', 'pref_ui_date_format_name', 'pref_ui_date_format_desc', 'string', 'YYYY-MM-DD', 'appearance', TRUE, 'user', 30),

-- Time Format
(1, 'ui.time_format', 'pref_ui_time_format_name', 'pref_ui_time_format_desc', 'string', '24h', 'appearance', TRUE, 'user', 40),

-- Items Per Page
(1, 'ui.items_per_page', 'pref_ui_items_per_page_name', 'pref_ui_items_per_page_desc', 'number', '20', 'behavior', TRUE, 'user', 50),

-- Sidebar Collapsed
(1, 'ui.sidebar_collapsed', 'pref_ui_sidebar_collapsed_name', 'pref_ui_sidebar_collapsed_desc', 'boolean', 'false', 'layout', TRUE, 'user', 60);

-- Data Display Preferences
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, group_name, is_user_editable, scope, sort_order)
VALUES
-- Default Currency
(6, 'data.default_currency', 'pref_data_default_currency_name', 'pref_data_default_currency_desc', 'number', '1', 'defaults', TRUE, 'user', 10),

-- Default Country
(6, 'data.default_country', 'pref_data_default_country_name', 'pref_data_default_country_desc', 'number', '1', 'defaults', TRUE, 'user', 20),

-- Default Address Type
(6, 'data.default_address_type', 'pref_data_default_address_type_name', 'pref_data_default_address_type_desc', 'number', '1', 'defaults', TRUE, 'user', 30),

-- Default Contact Type
(6, 'data.default_contact_type', 'pref_data_default_contact_type_name', 'pref_data_default_contact_type_desc', 'number', '1', 'defaults', TRUE, 'user', 40);

-- API Preferences
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, group_name, is_user_editable, scope, sort_order)
VALUES
-- API Timeout
(2, 'api.timeout', 'pref_api_timeout_name', 'pref_api_timeout_desc', 'number', '30000', 'performance', TRUE, 'user', 10),

-- Retry Attempts
(2, 'api.retry_attempts', 'pref_api_retry_attempts_name', 'pref_api_retry_attempts_desc', 'number', '3', 'performance', TRUE, 'user', 20),

-- Cache Enabled
(2, 'api.cache_enabled', 'pref_api_cache_enabled_name', 'pref_api_cache_enabled_desc', 'boolean', 'true', 'performance', TRUE, 'user', 30);

-- Notification Preferences
INSERT INTO preference_definitions
(category_id, key_name, display_name_code, description_code, data_type, default_value, group_name, is_user_editable, scope, sort_order)
VALUES
-- Email Notifications
(3, 'notifications.email_enabled', 'pref_notif_email_enabled_name', 'pref_notif_email_enabled_desc', 'boolean', 'true', 'channels', TRUE, 'user', 10),

-- Push Notifications
(3, 'notifications.push_enabled', 'pref_notif_push_enabled_name', 'pref_notif_push_enabled_desc', 'boolean', 'false', 'channels', TRUE, 'user', 20),

-- Sound Notifications
(3, 'notifications.sound_enabled', 'pref_notif_sound_enabled_name', 'pref_notif_sound_enabled_desc', 'boolean', 'true', 'behavior', TRUE, 'user', 30);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify translations were inserted (should return 96 rows)
-- SELECT COUNT(*) as translation_count FROM translations WHERE code LIKE 'pref_%';

-- Verify categories (should return 6 rows)
-- SELECT pc.id, pc.code, t.text as description
-- FROM preference_categories pc
-- LEFT JOIN translations t ON t.code = pc.description_code AND t.language_id = 1
-- ORDER BY pc.id;

-- Verify definitions (should return 16 rows)
-- SELECT pd.id, pd.key_name, dn.text as display_name, dd.text as description, pd.data_type, pd.default_value
-- FROM preference_definitions pd
-- LEFT JOIN translations dn ON dn.code = pd.display_name_code AND dn.language_id = 1
-- LEFT JOIN translations dd ON dd.code = pd.description_code AND dd.language_id = 1
-- ORDER BY pd.category_id, pd.sort_order;
