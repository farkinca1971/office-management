/**
 * n8n Webhook Endpoint URLs
 * 
 * This file contains all full endpoint URLs used by the application.
 * Each endpoint is on a single line for easy manual updates.
 * 
 * IMPORTANT: When paths change in n8n, update them here manually.
 * All API files should import endpoint URLs from this file.
 */

// Main API Webhook Base: https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1
export const ENDPOINTS = {
  // Persons
  PERSONS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/persons',
  PERSON_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/persons/:id',
  
  // Companies
  COMPANIES: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/companies',
  COMPANY_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/companies/:id',
  
  // Invoices
  INVOICES: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/invoices',
  INVOICE_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/invoices/:id',
  INVOICE_PAY: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/invoices/:id/pay',
  INVOICE_VOID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/invoices/:id/void',
  
  // Transactions
  TRANSACTIONS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/transactions',
  TRANSACTION_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/transactions/:id',
  
  // Object Relations
  OBJECT_RELATIONS: 'https://n8n.wolfitlab.duckdns.org/webhook/b0fc82f1-0fd7-4068-83a2-6051579b85c1/api/v1/object-relations',
  OBJECT_RELATION_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-relations/:id',
  OBJECT_RELATIONS_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/b0fc82f1-0fd7-4068-83a2-6051579b85c1/api/v1/objects/:id/relations',
  OBJECT_RELATION_UPDATE: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-relations/:id',
  OBJECT_RELATION_DELETE: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-relations/:id/delete',

  // Data quality endpoints
  RELATIONS_DATA_QUALITY_ORPHANED: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/data-quality/orphaned',
  RELATIONS_DATA_QUALITY_DUPLICATES: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/data-quality/duplicates',
  RELATIONS_DATA_QUALITY_INVALID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/data-quality/invalid',
  RELATIONS_DATA_QUALITY_MISSING_MIRRORS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/data-quality/missing-mirrors',

  // Bulk operations
  RELATIONS_BULK_DELETE: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/bulk/delete',
  RELATIONS_BULK_REASSIGN: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/bulk/reassign',
  RELATIONS_BULK_UPDATE_TYPE: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/relations/bulk/update-type',

  // Object search
  OBJECTS_SEARCH: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/objects/search',
  
  // Object Audits
  OBJECT_AUDITS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-audits',
  OBJECT_AUDIT_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/object-audits/:id',
  OBJECT_AUDITS_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/70a9a92c-360e-43bf-9235-3725f4cea7ed/api/v1/object-audits/object/:id',
  
  // Lookups (unified endpoint pattern)
  LOOKUPS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/:lookup_type',
  LOOKUP_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/:lookup_type/:id',
  TRANSLATIONS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/translations',
  TRANSLATION_BY_CODE_AND_LANGUAGE: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/lookups/translations/:code/:language_id',
  
  // Authentication
  AUTH_LOGIN: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/auth/login',
  AUTH_SIGNUP: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/auth/signup',
  AUTH_ME: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/auth/me',
  AUTH_LOGOUT: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/auth/logout',
  AUTH_REFRESH: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/auth/refresh',
  
  // Contacts (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  CONTACTS_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:id/contacts',
  CONTACT_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/contacts/:id',
  
  // Addresses (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  ADDRESSES_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:id/addresses',
  ADDRESS_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/addresses/:id',
  
  // Identifications (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  IDENTIFICATIONS_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:id/identifications',
  IDENTIFICATION_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/identifications/:id',
  
  // Notes (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  NOTES_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/objects/:id/notes',
  NOTE_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/notes/:id',
  NOTE_PIN: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/notes/:id/pin',
  
  // Users (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  USERS: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/users',
  USER_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/users/:id',
  USER_PASSWORD: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/users/:id/password',
  
  // Files (secondary webhook: 244d0b91-6c2c-482b-8119-59ac282fba4f)
  FILES: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/files',
  FILE_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/70a9a92c-360e-43bf-9235-3725f4cea7ed/api/v1/files/:id',
  FILE_DELETE: 'https://n8n.wolfitlab.duckdns.org/webhook/6054a8bf-9bcc-44c9-8e22-e78704ac2e58/api/v1/files/:id/delete',
  FILE_VERSIONS: 'https://n8n.wolfitlab.duckdns.org/webhook/70a9a92c-360e-43bf-9235-3725f4cea7ed/api/v1/files/:id/versions',
  FILE_DOCUMENTS: 'https://n8n.wolfitlab.duckdns.org/webhook/f124ecad-b97e-4bb0-818d-cb065a52b229/v1/files/:id/documents',
  FILE_DOCUMENT_COUNT: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/files/:id/documents/count',
  FILE_AVAILABLE_DOCUMENTS: 'https://n8n.wolfitlab.duckdns.org/webhook/5361050c-122d-49a0-93f3-053a0e932f58/api/v1/files/:id/documents/available',
  FILES_UNATTACHED: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/files/unattached',
  FILES_UPLOAD: 'https://n8n.wolfitlab.duckdns.org/webhook/244d0b91-6c2c-482b-8119-59ac282fba4f/api/v1/files/upload',
  
  // Documents (documents webhook: 08659efd-89f5-440f-96de-10512fda25f0)
  DOCUMENTS: 'https://n8n.wolfitlab.duckdns.org/webhook/d35779a0-d5b1-438f-be5e-52f7b29be868/api/v1/documents',
  DOCUMENT_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/70a9a92c-360e-43bf-9235-3725f4cea7ed/api/v1/documents/:id',
  DOCUMENTS_BY_OBJECT_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/70a9a92c-360e-43bf-9235-3725f4cea7ed/api/v1/documents/:id',
  DOCUMENT_DELETE: 'https://n8n.wolfitlab.duckdns.org/webhook/6054a8bf-9bcc-44c9-8e22-e78704ac2e58/api/v1/documents/:id/delete',
  DOCUMENT_FILES: 'https://n8n.wolfitlab.duckdns.org/webhook/b21d5b1d-ded1-4acf-a46d-3a1810581ed2/api/v1/documents/:id/files',
  DOCUMENT_FILES_FROM_OTHER_DOCUMENTS: 'https://n8n.wolfitlab.duckdns.org/webhook/6bc6018b-3e0c-456c-8c69-5f9e8b1d2fd7/api/v1/documents/:id/files/from-other-documents',
  DOCUMENT_FILE_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1/documents/:id/files/:file_id',
  DOCUMENT_FILE_UNLINK: 'https://n8n.wolfitlab.duckdns.org/webhook/c69ae62b-b258-4613-a1a6-f28adbd24561/api/v1/documents/:document_id/files/:file_id/unlink',
  DOCUMENT_RELATIONS: 'https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1/documents/:id/relations',
  DOCUMENT_RELATION_BY_ID: 'https://n8n.wolfitlab.duckdns.org/webhook/08659efd-89f5-440f-96de-10512fda25f0/api/v1/documents/:id/relations/:relation_id',
} as const;

/**
 * Helper function to replace path parameters in URLs
 * Example: replaceParams('https://.../persons/:id', { id: 1 }) => 'https://.../persons/1'
 */
export function replaceParams(url: string, params: Record<string, string | number>): string {
  let result = url;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value));
  }
  return result;
}

