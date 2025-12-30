/**
 * API request and response type definitions
 */

import {
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  Contact,
  CreateContactRequest,
  UpdateContactRequest,
  Identification,
  CreateIdentificationRequest,
  UpdateIdentificationRequest,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  Transaction,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  ObjectRelation,
  CreateObjectRelationRequest,
  ObjectAudit,
  CreateObjectAuditRequest,
} from './entities';
import { ApiResponse, ApiListResponse, SearchParams } from './common';

// Re-export common types for convenience
export type { ApiResponse, ApiListResponse, SearchParams } from './common';

// Person API Types
export type PersonListResponse = ApiListResponse<Person>;
export type PersonResponse = ApiResponse<Person>;
export type PersonListParams = SearchParams & {
  object_status_id?: number;
};

// Company API Types
export type CompanyListResponse = ApiListResponse<Company>;
export type CompanyResponse = ApiResponse<Company>;
export type CompanyListParams = SearchParams;

// User API Types
export type UserListResponse = ApiListResponse<User>;
export type UserResponse = ApiResponse<User>;
export type UserListParams = SearchParams;

// Employee API Types
export type EmployeeListResponse = ApiListResponse<Employee>;
export type EmployeeResponse = ApiResponse<Employee>;
export type EmployeeListParams = SearchParams & {
  object_status_id?: number;
  person_id?: number;
};

// Address API Types
export type AddressListResponse = ApiListResponse<Address>;
export type AddressResponse = ApiResponse<Address>;
export type AddressListParams = {
  is_active?: boolean;
};

// Contact API Types
export type ContactListResponse = ApiListResponse<Contact>;
export type ContactResponse = ApiResponse<Contact>;
export type ContactListParams = {
  is_active?: number; // 0 = false, 1 = true
  contact_type_id?: number;
};

// Identification API Types
export type IdentificationListResponse = ApiListResponse<Identification>;
export type IdentificationResponse = ApiResponse<Identification>;
export type IdentificationListParams = {
  is_active?: boolean;
};

// Invoice API Types
export type InvoiceListResponse = ApiListResponse<Invoice>;
export type InvoiceResponse = ApiResponse<Invoice>;
export type InvoiceListParams = SearchParams & {
  partner_id?: number;
  is_paid?: boolean;
  is_void?: boolean;
  date_from?: string;
  date_to?: string;
};

// Transaction API Types
export type TransactionListResponse = ApiListResponse<Transaction>;
export type TransactionResponse = ApiResponse<Transaction>;
export type TransactionListParams = SearchParams & {
  transaction_type_id?: number;
  date_from?: string;
  date_to?: string;
};

// Audit API Types
export type ObjectAuditListResponse = ApiListResponse<ObjectAudit>;
export type ObjectAuditResponse = ApiResponse<ObjectAudit>;
export type ObjectAuditListParams = SearchParams & {
  object_id?: number;
  audit_action_id?: number;
  created_by?: number;
  date_from?: string;
  date_to?: string;
};

// Lookup API Types
export interface LookupListResponse<T> extends ApiListResponse<T> {}

// Auth API Types
export interface LoginRequest {
  username: string;
  password: string;
}

// LoginResponse supports multiple formats from the API:
// Format 1 (standard): { success: true, data: { token, user } }
// Format 2 (direct): { token, user }
// Format 3 (flat): { success: true, token, user }
export interface LoginResponse {
  success?: boolean;
  data?: {
    token: string;
    user: User;
  };
  token?: string;
  user?: User;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface SignupResponse {
  success: true;
  data: User;
}

export interface AuthErrorResponse {
  success: false;
  error: {
    code: 'AUTHENTICATION_FAILED' | 'INVALID_CREDENTIALS' | 'USERNAME_EXISTS' | 'SIGNUP_FAILED';
    message: string;
  };
}

