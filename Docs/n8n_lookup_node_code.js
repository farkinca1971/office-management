/**
 * n8n Code Node - Dynamic Lookup Table Query Handler
 * 
 * This single node can handle all lookup/reference data queries
 * 
 * Setup:
 * 1. Add a Code node in n8n
 * 2. Set language to JavaScript
 * 3. Paste this code
 * 4. Connect a MySQL node after this code node
 * 5. Pass the query from this node to the MySQL node
 * 
 * Input Parameters (from webhook or previous node):
 * - lookup_type: Type of lookup (required)
 *   Options: 'languages', 'object_types' (or 'object-types'), 'object_statuses' (or 'object-statuses'), 
 *            'sexes', 'salutations', 'product_categories' (or 'product-categories'), 'countries', 
 *            'address_types' (or 'address-types'), 'address_area_types' (or 'address-area-types'), 
 *            'contact_types' (or 'contact-types'), 'transaction_types' (or 'transaction-types'),
 *            'currencies', 'object_relation_types' (or 'object-relation-types'), 'translations',
 *            'note_types' (or 'note-types')
 *   Note: Hyphens are automatically converted to underscores (e.g., "object-types" -> "object_types")
 * 
 * - object_type_id: Filter for object_statuses (optional)
 * - code: Filter for translations (optional)
 * - language_id: Filter for translations (optional)
 * - is_active: Filter by active status (optional, default: true)
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract lookup_type from params object (n8n webhook v2.1 provides path params in params object)
// The webhook path /api/v1/lookups/:lookup_type extracts lookup_type into params.lookup_type
let lookupType = inputData.params?.lookup_type || 
                 inputData.lookup_type || 
                 inputData.query?.lookup_type || 
                 inputData.body?.lookup_type;

// Normalize lookup_type: convert hyphens to underscores (e.g., "object-types" -> "object_types")
// This allows the frontend to use URL-friendly hyphens while n8n uses database-friendly underscores
if (lookupType && typeof lookupType === 'string') {
  lookupType = lookupType.replace(/-/g, '_');
}

// Extract all parameters - prioritize query parameters for GET requests
const objectTypeId = inputData.query?.object_type_id || inputData.object_type_id || inputData.body?.object_type_id;
const code = inputData.query?.code || inputData.code || inputData.body?.code;
const languageId = inputData.query?.language_id || inputData.language_id || inputData.body?.language_id;
// Extract language_code from query parameters (GET requests pass query params here)
// This is the current user's language preference
const languageCode = inputData.query?.language_code || inputData.language_code || inputData.body?.language_code || 'en';
const isActive = inputData.query?.is_active !== undefined ? inputData.query.is_active : (inputData.is_active !== undefined ? inputData.is_active : true);

// Determine which language to use for translations
// Priority: language_id > language_code > default 'en'
let translationLanguageId = null;
let translationLanguageCode = 'en';

if (languageId) {
  translationLanguageId = parseInt(languageId);
  // We'll use language_id directly in the query
} else if (languageCode) {
  // Use the provided language code (from user's language preference)
  translationLanguageCode = languageCode;
} else {
  // Default to 'en' if no language specified
  translationLanguageCode = 'en';
}

// Validate lookup type
const validLookupTypes = [
  'languages',
  'object_types',
  'object_statuses',
  'sexes',
  'salutations',
  'product_categories',
  'countries',
  'address_types',
  'address_area_types',
  'contact_types',
  'transaction_types',
  'identification_types',
  'audit_actions',
  'currencies',
  'object_relation_types',
  'note_types',
  'translations'
];

if (!lookupType || !validLookupTypes.includes(lookupType)) {
  return {
    success: false,
    error: {
      code: 'INVALID_LOOKUP_TYPE',
      message: `Invalid lookup_type. Must be one of: ${validLookupTypes.join(', ')}`,
      details: {
        provided: lookupType,
        params_lookup_type: inputData.params?.lookup_type,
        valid_types: validLookupTypes
      }
    }
  };
}

// Build SQL query based on lookup type
let sqlQuery = '';
let queryParams = [];

// Helper function to build WHERE clause
const buildWhereClause = (conditions) => {
  const clauses = conditions.filter(c => c !== null);
  return clauses.length > 0 ? 'WHERE ' + clauses.join(' AND ') : '';
};

// Helper function to build translation join with dynamic language
const buildTranslationJoin = (tableAlias, isActiveFilter = true) => {
  let languageCondition = '';
  if (translationLanguageId) {
    languageCondition = `t.language_id = ${translationLanguageId}`;
  } else {
    languageCondition = `t.language_id = (SELECT id FROM languages WHERE code = '${translationLanguageCode}')`;
  }
  
  const activeFilter = isActiveFilter ? `${tableAlias}.is_active = 1` : '';
  return {
    join: `LEFT JOIN translations t ON t.code = ${tableAlias}.code AND ${languageCondition}`,
    where: activeFilter ? `WHERE ${activeFilter}` : ''
  };
};

switch (lookupType) {
  case 'languages':
    // Languages: join with translations to get translated language names
    // The language code (e.g., 'ar') matches the translation code in the translations table
    const langJoin = buildTranslationJoin('l');
    sqlQuery = `
SELECT 
    l.id,
    l.code,
    l.is_active,
    COALESCE(t.text, UPPER(l.code)) as name
FROM languages l
${langJoin.join}
WHERE l.is_active = 1
ORDER BY COALESCE(t.text, l.code);
    `;
    break;

  case 'object_types':
    const objTypeJoin = buildTranslationJoin('ot');
    sqlQuery = `
SELECT 
    ot.id,
    ot.code,
    ot.is_active,
    t.text as name
FROM object_types ot
${objTypeJoin.join}
WHERE ot.is_active = 1
ORDER BY ot.code;
    `;
    break;

 case 'identification_types':
    // Identification Types: similar to contact_types, includes optional object_type_id filter
    // This lookup is scoped by object type (person, company, employee, etc.)
    const idTypeWhere = [];
    idTypeWhere.push('it.is_active = 1');
    if (objectTypeId) {
      idTypeWhere.push(`it.object_type_id = ${parseInt(objectTypeId)}`);
    }
    const idTypeJoin = buildTranslationJoin('it');
    
    sqlQuery = `
SELECT 
    it.id,
    it.code,
    it.is_active,
    it.object_type_id,
    t.text as name
FROM identification_types it
${idTypeJoin.join}
WHERE ${idTypeWhere.join(' AND ')}
ORDER BY t.text;
    `;
    break;    

  case 'object_statuses':
    const statusWhere = [];
    statusWhere.push('os.is_active = 1');
    if (objectTypeId) {
      statusWhere.push(`os.object_type_id = ${parseInt(objectTypeId)}`);
    }
    const statusJoin = buildTranslationJoin('os');
    
    sqlQuery = `
SELECT 
    os.id,
    os.code,
    os.is_active,
    os.object_type_id,
    t.text as name
FROM object_statuses os
${statusJoin.join}
WHERE ${statusWhere.join(' AND ')}
ORDER BY os.code;
    `;
    break;

  case 'sexes':
    const sexesJoin = buildTranslationJoin('s');
    sqlQuery = `
SELECT 
    s.id,
    s.code,
    s.is_active,
    t.text as name
FROM sexes s
${sexesJoin.join}
WHERE s.is_active = 1
ORDER BY s.code;
    `;
    break;

  case 'salutations':
    const salJoin = buildTranslationJoin('sal');
    sqlQuery = `
SELECT 
    sal.id,
    sal.code,
    sal.is_active,
    t.text as name
FROM salutations sal
${salJoin.join}
WHERE sal.is_active = 1
ORDER BY sal.code;
    `;
    break;

  case 'product_categories':
    const pcJoin = buildTranslationJoin('pc');
    sqlQuery = `
SELECT 
    pc.id,
    pc.code,
    pc.is_active,
    t.text as name
FROM product_categories pc
${pcJoin.join}
WHERE pc.is_active = 1
ORDER BY pc.code;
    `;
    break;

  case 'countries':
    // Countries table: id, code, is_active
    // Country codes are 3-letter ISO codes (USA, DEU, FRA, HUN, etc.)
    // Translations use the same codes
    const countriesJoin = buildTranslationJoin('c');
    sqlQuery = `
SELECT 
    c.id,
    c.code,
    c.is_active,
    COALESCE(t.text, c.code) as name
FROM countries c
${countriesJoin.join}
WHERE c.is_active = 1
ORDER BY COALESCE(t.text, c.code);
    `;
    break;

  case 'address_types':
    const atJoin = buildTranslationJoin('at');
    sqlQuery = `
SELECT 
    at.id,
    at.code,
    at.is_active,
    t.text as name
FROM address_types at
${atJoin.join}
WHERE at.is_active = 1
ORDER BY at.code;
    `;
    break;

  case 'address_area_types':
    const aatJoin = buildTranslationJoin('aat');
    sqlQuery = `
SELECT 
    aat.id,
    aat.code,
    aat.is_active,
    t.text as name
FROM address_area_types aat
${aatJoin.join}
ORDER BY aat.code;
    `;
    break;

  case 'contact_types':
    const ctJoin = buildTranslationJoin('ct');
    sqlQuery = `
SELECT 
    ct.id,
    ct.code,
    ct.is_active,
    t.text as name
FROM contact_types ct
${ctJoin.join}
WHERE ct.is_active = 1
ORDER BY ct.code;
    `;
    break;

  case 'transaction_types':
    const ttJoin = buildTranslationJoin('tt');
    sqlQuery = `
SELECT 
    tt.id,
    tt.code,
    tt.is_active,
    t.text as name
FROM transaction_types tt
${ttJoin.join}
WHERE tt.is_active = 1
ORDER BY tt.code;
    `;
    break;

  case 'currencies':
    const currJoin = buildTranslationJoin('c');
    sqlQuery = `
SELECT 
    c.id,
    c.code,
    c.is_active,
    t.text as name
FROM currencies c
${currJoin.join}
WHERE c.is_active = 1
ORDER BY c.code;
    `;
    break;

  case 'note_types':
    // Note Types: lookup table for categorizing notes (general, meeting, reminder, etc.)
    // Codes: note_general, note_meeting, note_reminder, note_important, note_follow_up, note_internal, note_customer_facing
    const ntJoin = buildTranslationJoin('nt');
    sqlQuery = `
SELECT 
    nt.id,
    nt.code,
    nt.is_active,
    t.text as name
FROM note_types nt
${ntJoin.join}
WHERE nt.is_active = 1
ORDER BY t.text;
    `;
    break;

case 'object_relation_types':
  const ortJoin = buildTranslationJoin('ort');
  sqlQuery = `
SELECT 
    ort.id,
    ort.code,
    ort.is_active,
    ort.parent_object_type_id,
    ort.child_object_type_id,
    ort.mirrored_type_id,
    t.text as name
FROM object_relation_types ort
${ortJoin.join}
WHERE ort.is_active = 1
ORDER BY ort.code;
  `;
  break;

 case 'audit_actions':
  // Audit Actions: similar to object_statuses, includes object_type_id filter
  const auditWhere = [];
  auditWhere.push('aa.is_active = 1');
  if (objectTypeId) {
    auditWhere.push(`aa.object_type_id = ${parseInt(objectTypeId)}`);
  }
  const auditJoin = buildTranslationJoin('aa');

  sqlQuery = `
SELECT
    aa.id,
    aa.code,
    aa.is_active,
    aa.object_type_id,
    t.text as name
FROM audit_actions aa
${auditJoin.join}
WHERE ${auditWhere.join(' AND ')}
ORDER BY aa.code;
  `;
  break;
   

  case 'translations':
    const translationWhere = [];
    if (code) {
      translationWhere.push(`t.code = '${code.replace(/'/g, "''")}'`);
    }
    if (languageId) {
      translationWhere.push(`t.language_id = ${parseInt(languageId)}`);
    }
    
    sqlQuery = `
SELECT 
    t.code,
    t.language_id,
    l.code as language_code,
    t.text
FROM translations t
JOIN languages l ON l.id = t.language_id
${translationWhere.length > 0 ? 'WHERE ' + translationWhere.join(' AND ') : ''}
ORDER BY t.code, t.language_id;
    `;
    break;

  default:
    return {
      success: false,
      error: {
        code: 'UNKNOWN_LOOKUP_TYPE',
        message: `Unknown lookup type: ${lookupType}`
      }
    };
}

// Return the SQL query and metadata for the next node
return {
  json: {
    query: sqlQuery.trim(),
    lookup_type: lookupType,
    parameters: {
      object_type_id: objectTypeId || null,
      code: code || null,
      language_id: languageId || null,
      language_code: translationLanguageCode,
      translation_language_id: translationLanguageId,
      is_active: isActive,
      // Debug info for countries specifically
      debug: lookupType === 'countries' ? {
        generated_sql: sqlQuery.trim(),
        input_language_code: languageCode,
        translation_language_code: translationLanguageCode,
        translation_language_id: translationLanguageId,
        input_data_keys: Object.keys(inputData),
        has_query: !!inputData.query,
        query_keys: inputData.query ? Object.keys(inputData.query) : []
      } : null
    }
  }
};
