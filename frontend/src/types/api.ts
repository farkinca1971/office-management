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
} from './entities';
import { ApiResponse, ApiListResponse, SearchParams } from './common';

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
  is_active?: boolean;
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

// Lookup API Types
export interface LookupListResponse<T> extends ApiListResponse<T> {}

// Auth API Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
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

