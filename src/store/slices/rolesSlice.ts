import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../lib/api';

// Types
export interface Permission {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  count: number;
  is_custom: boolean;
  level: number;
  permissions: Permission[];
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

// State
export interface RolesState {
  roles: Role[];
  permissions: Permission[];
  currentRole: Role | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  permissions: [],
  currentRole: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<{ roles: Role[] }>('/roles');
      
      if (response.success && response.data) {
        return response.data.roles;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch roles');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch roles');
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  'roles/fetchPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<{ permissions: Permission[] }>('/permissions');
      
      if (response.success && response.data) {
        return response.data.permissions;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch permissions');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch permissions');
    }
  }
);

export const createRole = createAsyncThunk(
  'roles/createRole',
  async (roleData: CreateRoleData, { rejectWithValue }) => {
    try {
      const response = await post<{ role: Role }>('/roles', roleData);
      
      if (response.success && response.data) {
        return response.data.role;
      } else {
        throw new Error(response.error?.message || 'Failed to create role');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'roles/updateRole',
  async ({ roleId, roleData }: { roleId: string; roleData: UpdateRoleData }, { rejectWithValue }) => {
    try {
      const response = await put<{ role: Role }>(`/roles/${roleId}`, roleData);
      
      if (response.success && response.data) {
        return response.data.role;
      } else {
        throw new Error(response.error?.message || 'Failed to update role');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'roles/deleteRole',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await del(`/roles/${roleId}`);
      
      if (response.success) {
        return roleId;
      } else {
        throw new Error(response.error?.message || 'Failed to delete role');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete role');
    }
  }
);

// Slice
const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRole: (state) => {
      state.currentRole = null;
    },
    updateRoleInList: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(role => role.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    removeRoleFromList: (state, action: PayloadAction<string>) => {
      state.roles = state.roles.filter(role => role.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Roles
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload;
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Permissions
    builder
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload;
        state.error = null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Role
    builder
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles.push(action.payload);
        state.error = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Role
    builder
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        if (state.currentRole && state.currentRole.id === action.payload.id) {
          state.currentRole = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Role
    builder
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter(role => role.id !== action.payload);
        if (state.currentRole && state.currentRole.id === action.payload) {
          state.currentRole = null;
        }
        state.error = null;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentRole, updateRoleInList, removeRoleFromList } = rolesSlice.actions;
export default rolesSlice.reducer;
