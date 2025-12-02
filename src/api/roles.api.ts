import { apiClient } from './client';

// Types
export interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  permissions: string[];
  allPermissions: boolean;
}

export interface RolesResponse {
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  itemsFrom: number;
  itemsTo: number;
  items: Role[];
}

export interface GetRolesParams {
  pageNumber?: number;
  pageSize?: number;
  searchPhrase?: string;
}

export interface CreateRoleDto {
  name: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  roleId: string;
  name: string;
  permissions: string[];
}

export const rolesApi = {
  // Get all roles with pagination
  getAll: async (params?: GetRolesParams) => {
    const response = await apiClient.get<RolesResponse>('/roles', { params });
    return response.data;
  },

  // Get single role by ID
  getById: async (id: string) => {
    const response = await apiClient.get<Role>(`/roles/${id}`);
    return response.data;
  },

  // Create new role
  create: async (data: CreateRoleDto) => {
    const response = await apiClient.post<Role>('/roles', data);
    return response.data;
  },

  // Update role
  update: async (id: string, data: UpdateRoleDto) => {
    const response = await apiClient.put<Role>(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  delete: async (id: string) => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },
};
