/**
 * Object Audit API - CRUD operations for object audits
 */

import apiClient from './client';
import type {
  ObjectAudit,
  CreateObjectAuditRequest,
} from '@/types/entities';
import type {
  ObjectAuditListResponse,
  ObjectAuditResponse,
  ObjectAuditListParams,
} from '@/types/api';

export const auditApi = {
  /**
   * Get all audit records with pagination and filtering
   */
  getAll: async (params?: ObjectAuditListParams): Promise<ObjectAuditListResponse> => {
    return apiClient.get('/object-audits', { params });
  },

  /**
   * Get single audit record by ID
   */
  getById: async (id: number): Promise<ObjectAuditResponse> => {
    return apiClient.get(`/object-audits/${id}`);
  },

  /**
   * Get audit records for a specific object
   */
  getByObjectId: async (objectId: number, params?: Omit<ObjectAuditListParams, 'object_id'>): Promise<ObjectAuditListResponse> => {
    return apiClient.get(`/object-audits/object/${objectId}`, { params });
  },

  /**
   * Create a new audit record
   */
  create: async (data: CreateObjectAuditRequest): Promise<ObjectAuditResponse> => {
    return apiClient.post('/object-audits', data);
  },
};

