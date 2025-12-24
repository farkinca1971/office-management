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
 *   Options: 'languages', 'object_types', 'object_statuses', 'sexes', 
 *            'salutations', 'product_categories', 'countries', 
 *            'address_types', 'address_area_types', 'contact_types',
 *            'transaction_types', 'currencies', 'object_relation_types', 'translations'
 * 
 * - object_type_id: Filter for object_statuses (optional)
 * - code: Filter for translations (optional)
 * - language_id: Filter for translations (optional)
 * - is_active: Filter by active status (optional, default: true)
 */

// Get input data from previous node or webhook
const inputData = $input.all()[0].json;

// Extract parameters from query string or body
const lookupType = inputData.lookup_type || inputData.query?.lookup_type || inputData.body?.lookup_type;
const objectTypeId = inputData.object_type_id || inputData.query?.object_type_id || inputData.body?.object_type_id;
const code = inputData.code || inputData.query?.code || inputData.body?.code;
const languageId = inputData.language_id || inputData.query?.language_id || inputData.body?.language_id;
const languageCode = inputData.language_code || inputData.query?.language_code || inputData.body?.language_code || 'en';
const isActive = inputData.is_active !== undefined ? inputData.is_active : (inputData.query?.is_active !== undefined ? inputData.query.is_active : true);

// Determine which language to use for translations
// Priority: language_id > language_code > default 'en'
let translationLanguageId = null;
let translationLanguageCode = 'en';

if (languageId) {
  translationLanguageId = parseInt(languageId);
  // We'll use language_id directly in the query
} else if (languageCode) {
  translationLanguageCode = languageCode;
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
  'currencies',
  'object_relation_types',
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
    sqlQuery = `
SELECT 
    id,
    code,
    is_active
FROM languages
WHERE is_active = 1
ORDER BY code;
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
    // Countries table only has: id, code, is_active
    // Name comes from translations table using country code
    const countryJoin = buildTranslationJoin('c');
    sqlQuery = `
SELECT 
    c.id,
    c.code,
    c.is_active,
    t.text as name
FROM countries c
${countryJoin.join}
WHERE c.is_active = 1
ORDER BY t.text;
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
WHERE aat.is_active = 1
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

  case 'object_relation_types':
    const ortJoin = buildTranslationJoin('ort');
    sqlQuery = `
SELECT 
    ort.id,
    ort.code,
    ort.is_active,
    t.text as name
FROM object_relation_types ort
${ortJoin.join}
WHERE ort.is_active = 1
ORDER BY ort.code;
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
      is_active: isActive
    }
  }
};

