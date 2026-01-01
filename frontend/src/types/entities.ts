/**
 * Entity type definitions matching the database schema
 */

import { BaseEntity } from './common';

// Object Types
export interface ObjectType extends BaseEntity {
  code: string;
  is_active: boolean;
}

export interface ObjectStatus extends BaseEntity {
  code: string;
  is_active: boolean;
  object_type_id: number;
}

// Person
export interface Person extends BaseEntity {
  id: number; // References objects.id
  first_name: string;
  middle_name?: string;
  last_name: string;
  mother_name?: string;
  sex_id?: number;
  salutation_id?: number;
  birth_date?: string; // ISO date string
  // Extended fields (from objects table)
  object_type_id?: number;
  object_status_id?: number;
}

export interface CreatePersonRequest {
  object_type_id: number;
  object_status_id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  mother_name?: string;
  sex_id?: number;
  salutation_id?: number;
  birth_date?: string;
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {}

// Company
export interface Company extends BaseEntity {
  id: number; // References objects.id
  company_id: string;
  company_name: string;
  object_type_id?: number;
  object_status_id?: number;
}

export interface CreateCompanyRequest {
  object_type_id: number;
  object_status_id: number;
  company_id: string;
  company_name: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

// User
export interface User extends BaseEntity {
  id: number; // References objects.id
  username?: string;
  object_type_id?: number;
  object_status_id?: number;
}

export interface CreateUserRequest {
  object_type_id: number;
  object_status_id: number;
  username: string;
  password: string;
}

export interface UpdateUserRequest {
  username?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Employee
export interface Employee extends BaseEntity {
  id: number; // References objects.id
  person_id: number; // References persons.id
  // Extended fields (from objects table)
  object_type_id?: number;
  object_status_id?: number;
  // Extended fields (from persons table via person_id)
  person?: Person;
}

export interface CreateEmployeeRequest {
  object_type_id: number;
  object_status_id: number;
  person_id: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

// Address
export interface Address extends BaseEntity {
  id: number;
  object_id: number;
  address_type_id: number;
  street_address_1: string;
  street_address_2?: string;
  address_area_type_id?: number;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_id: number;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_by?: number;
}

export interface CreateAddressRequest {
  object_id: number;
  address_type_id: number;
  street_address_1: string;
  street_address_2?: string;
  address_area_type_id?: number;
  city: string;
  state_province?: string;
  postal_code?: string;
  country_id: number;
  latitude?: number;
  longitude?: number;
}

export interface UpdateAddressRequest {
  address_type_id_old: number;
  address_type_id_new: number;
  street_address_1_old: string;
  street_address_1_new: string;
  street_address_2_old?: string;
  street_address_2_new?: string;
  address_area_type_id_old?: number;
  address_area_type_id_new?: number;
  city_old: string;
  city_new: string;
  state_province_old?: string;
  state_province_new?: string;
  postal_code_old?: string;
  postal_code_new?: string;
  country_id_old: number;
  country_id_new: number;
  is_active_old: boolean;
  is_active_new: boolean;
}

// Contact
export interface Contact extends BaseEntity {
  id: number;
  object_id: number;
  contact_type_id: number;
  contact_value: string;
  is_active: boolean;
  created_by?: number;
}

export interface CreateContactRequest {
  object_id: number;
  contact_type_id: number;
  contact_value: string;
}

export interface UpdateContactRequest {
  contact_type_id_old: number;
  contact_type_id_new: number;
  contact_value_old: string;
  contact_value_new: string;
  is_active_old: boolean;
  is_active_new: boolean;
}

// Identification
export interface Identification extends BaseEntity {
  id: number;
  object_id: number;
  identification_type_id: number;
  identification_value: string;
  is_active: boolean;
  created_by?: number;
}

export interface CreateIdentificationRequest {
  object_id: number;
  identification_type_id: number;
  identification_value: string;
}

export interface UpdateIdentificationRequest {
  identification_type_id_old: number;
  identification_type_id_new: number;
  identification_value_old: string;
  identification_value_new: string;
  is_active_old: boolean;
  is_active_new: boolean;
}

// Invoice
export interface Invoice extends BaseEntity {
  id: number; // References objects.id
  transaction_id?: number;
  invoice_number: string;
  issue_date: string; // ISO date string
  due_date?: string;
  payment_date?: string;
  partner_id_from?: number;
  partner_id_to?: number;
  note?: string;
  reference_number?: string;
  is_mirror?: boolean;
  currency_id: number;
  netto_amount?: number;
  tax?: number;
  final_amount?: number;
  is_paid: boolean;
  is_void: boolean;
  object_type_id?: number;
  object_status_id?: number;
}

export interface CreateInvoiceRequest {
  object_type_id: number;
  object_status_id: number;
  transaction_id?: number;
  invoice_number: string;
  issue_date: string;
  due_date?: string;
  partner_id_from?: number;
  partner_id_to?: number;
  currency_id: number;
  netto_amount?: number;
  tax?: number;
  final_amount?: number;
  note?: string;
  reference_number?: string;
  is_mirror?: boolean;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

// Transaction
export interface Transaction extends BaseEntity {
  id: number; // References objects.id
  transaction_type_id: number;
  transaction_date_start: string; // ISO timestamp
  transaction_date_end?: string;
  is_active: boolean;
  note?: string;
  object_type_id?: number;
  object_status_id?: number;
}

export interface CreateTransactionRequest {
  object_type_id: number;
  object_status_id: number;
  transaction_type_id: number;
  transaction_date_start?: string;
  transaction_date_end?: string;
  note?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {}

// Object Relation
export interface ObjectRelation extends BaseEntity {
  id: number;
  object_from_id: number;
  object_to_id: number;
  object_relation_type_id: number;
  note?: string;
  is_active: boolean;
  created_by?: number;
}

export interface CreateObjectRelationRequest {
  object_from_id: number;
  object_to_id: number;
  object_relation_type_id: number;
  note?: string;
}

export interface UpdateObjectRelationRequest extends Partial<CreateObjectRelationRequest> {}

// Audit Action
export interface AuditAction extends BaseEntity {
  code: string;
  is_active: boolean;
  object_type_id: number;
}

// Object Audit
export interface ObjectAudit extends BaseEntity {
  id: number;
  object_id: number;
  audit_action_id: number;
  created_by?: number;
  created_by_username?: string; // Username from users table
  created_at: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

export interface CreateObjectAuditRequest {
  object_id: number;
  audit_action_id: number;
  created_by?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
}

// Object Note
export interface ObjectNote extends BaseEntity {
  id: number;
  object_id: number;
  note_type_id?: number;
  subject_code?: string;
  note_text_code: string;
  subject?: string; // Translated text from subject_code
  note_text: string; // Translated text from note_text_code
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  created_by_username?: string; // Username from users table
}

export interface CreateObjectNoteRequest {
  note_type_id?: number;
  subject_code?: string; // Translation code for subject (generated client-side)
  subject?: string; // Subject text (for translation creation)
  note_text_code: string; // Translation code for note text (generated client-side)
  note_text: string; // Note text (for translation creation)
  is_pinned?: boolean;
  created_by?: number;
  language_id?: number; // Optional - automatically added by API interceptor
}

export interface UpdateObjectNoteRequest {
  // Old/new pattern for inline editing (consistent with other tables)
  note_type_id_old?: number;
  note_type_id_new?: number;
  subject_old?: string;
  subject_new?: string;
  note_text_old: string;
  note_text_new: string;
  language_id?: number; // Optional - automatically added by API interceptor
}

