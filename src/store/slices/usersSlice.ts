import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../lib/api';
import { PaginationData } from '../../lib/api';

// Types
export interface PlanDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  max_photos: number;
  max_videos: number;
  max_storage_bytes: number;
  max_events: number;
  has_custom_watermark: boolean;
  has_face_recognition: boolean;
  is_active: boolean;
  role: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string | number;
  avatar: string | null;
  plan_id: number | null;
  plan_expires_at: string | null;
  is_verified: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Professional fields
  institutional_role: string | null;
  professional_title: string | null;
  executive_region: string | null;
  bio: string | null;
  
  // Plan details
  plan?: PlanDetails;
  plan_details?: PlanDetails;

  // legacy fields used in UI
  joined?: string;
  groups?: string[];
  uploads?: number;
  storage_used?: number;
  last_login?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  can_manage_photo_resize?: boolean;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  groups?: string[];
  send_invite?: boolean;
}

export interface UpdateUserData {
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

// State
export interface UsersState {
  users: User[];
  currentUser: User | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  totalUsers: number;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  pagination: null,
  isLoading: false,
  error: null,
  totalUsers: 0,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

// GET /admin/users
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UsersQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<any>('/admin/users', params);
      if (response.success || (response as any).data) {
        // Handle both standard wrapped { success: true, data: [...] }
        // and Laravel Resource format { data: [...], meta: {...} }
        const dataObj = response.data || (response as any);
        const users = dataObj.data || dataObj || [];
        const pagination = (response as any).meta || (response as any).pagination || dataObj.meta || dataObj.pagination || {};
        
        return {
          users: Array.isArray(users) ? users : [],
          pagination: {
            current_page: pagination.current_page ?? pagination.page ?? 1,
            total_pages: pagination.last_page ?? pagination.totalPages ?? pagination.total_pages ?? 1,
            total_items: pagination.total ?? pagination.total_items ?? (Array.isArray(users) ? users.length : 0),
            total_users: pagination.total ?? pagination.total_users ?? pagination.total_items ?? (Array.isArray(users) ? users.length : 0),
            limit: pagination.per_page ?? pagination.limit ?? params.limit ?? 20
          },
        };
      } else {
        throw new Error((response as any).message || response.error?.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

// GET /admin/users/:id
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await get<any>(`/admin/users/${userId}`);
      if (response.success) {
        return response.data?.user ?? response.data ?? null;
      } else {
        throw new Error((response as any).message || response.error?.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

// POST /admin/users
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserData, { rejectWithValue }) => {
    try {
      // Backend typically expects snake_case keys
      const apiPayload = {
        // Send both camelCase and snake_case to be compatible across API variants
        firstName: userData.firstName,
        lastName: userData.lastName,
        first_name: userData.firstName,
        last_name: userData.lastName,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role,
        groups: userData.groups,
        send_invite: userData.send_invite,
      };

      const response = await post<any>('/admin/users', apiPayload);
      if (response.success) {
        return response.data?.user ?? response.data ?? userData;
      } else {
        // Extract validation errors from response.errors object
        const apiErrors = (response as any).errors;
        if (apiErrors && typeof apiErrors === 'object') {
          const firstError = Object.values(apiErrors)[0];
          const errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
          throw new Error(errorMsg);
        }
        throw new Error((response as any).message || response.error?.message || 'Failed to create user');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

// PUT /admin/users/:id  — Update name, role
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }: { userId: number; userData: UpdateUserData }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/users/${userId}`, userData);
      if (response.success) {
        return { userId, userData };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to update user';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user');
    }
  }
);

// PUT /admin/users/:id/status  — Block / Unblock
export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ userId, status }: { userId: number; status: string }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/users/${userId}/status`, { status });
      if (response.success) {
        return { userId, status };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to update user status';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user status');
    }
  }
);

// POST /admin/users/:id/activate
export const activateUser = createAsyncThunk(
  'users/activateUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await post<any>(`/admin/users/${userId}/activate`, {});
      if (response.success) {
        return { userId, status: 'active' };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to activate user';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to activate user');
    }
  }
);

// POST /admin/users/:id/suspend
export const suspendUser = createAsyncThunk(
  'users/suspendUser',
  async ({ userId, reason }: { userId: number; reason: string }, { rejectWithValue }) => {
    try {
      const response = await post<any>(`/admin/users/${userId}/suspend`, { reason });
      if (response.success) {
        return { userId, status: 'suspended' };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to suspend user';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to suspend user');
    }
  }
);

// PUT /admin/users/:id/subscription  — Assign plan
export const updateUserSubscription = createAsyncThunk(
  'users/updateUserSubscription',
  async ({ userId, planId }: { userId: number; planId: number }, { rejectWithValue, getState }) => {
    try {
      const response = await put<any>(`/admin/users/${userId}/subscription`, { planId });
      if (response.success) {
        // Try to get the full plan details from the plans slice so we can update the user optimistically
        const state = getState() as any;
        const plan = (state.plans?.plans as any[])?.find((p: any) => p.id === planId) ?? null;
        return { userId, planId, plan };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to update subscription';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update subscription');
    }
  }
);

// PUT /admin/users/:id/photo-resize-permission
export const updateUserPhotoResizePermission = createAsyncThunk(
  'users/updateUserPhotoResizePermission',
  async ({ userId, canManagePhotoResize }: { userId: number; canManagePhotoResize: boolean }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/users/${userId}/photo-resize-permission`, { can_manage_photo_resize: canManagePhotoResize });
      if (response.success) {
        return { userId, canManagePhotoResize };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to update photo resize permission';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update photo resize permission');
    }
  }
);

// DELETE /admin/users/:id
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await del(`/admin/users/${userId}`);
      if (response.success) {
        return userId;
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to delete user';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    clearCurrentUser: (state) => { state.currentUser = null; },
    updateUserInList: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) state.users[index] = action.payload;
    },
    removeUserFromList: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
  },
  extraReducers: (builder) => {

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination;
        state.totalUsers = action.payload.pagination?.total_users ?? action.payload.pagination?.total_items ?? 0;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Fetch User By ID
    builder
      .addCase(fetchUserById.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchUserById.fulfilled, (state, action) => { state.isLoading = false; state.currentUser = action.payload; state.error = null; })
      .addCase(fetchUserById.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; state.currentUser = null; });

    // Create User
    builder
      .addCase(createUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) state.users.unshift(action.payload);
        state.totalUsers += 1;
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Update User (name, role)
    builder
      .addCase(updateUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { userId, userData } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          const current = state.users[index];

          // Map camelCase payload fields → snake_case User fields
          const update: Partial<typeof current> = {};
          if (userData.role !== undefined)      update.role       = userData.role;
          if (userData.firstName !== undefined) update.first_name = userData.firstName;
          if (userData.lastName  !== undefined) update.last_name  = userData.lastName;

          // Recompute the display name so the list card refreshes immediately
          const fn = update.first_name ?? current.first_name ?? '';
          const ln = update.last_name  ?? current.last_name  ?? '';
          update.name = userData.name ?? (`${fn} ${ln}`.trim() || current.name);

          state.users[index] = { ...current, ...update };
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });

    // Update User Status (block/unblock)
    builder
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) state.users[index].status = status;
        if (state.currentUser?.id === userId) state.currentUser.status = status;
      })
      .addCase(updateUserStatus.rejected, (state, action) => { state.error = action.payload as string; });

    // Activate User
    builder
      .addCase(activateUser.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) state.users[index].status = status;
        if (state.currentUser?.id === userId) state.currentUser.status = status;
      })
      .addCase(activateUser.rejected, (state, action) => { state.error = action.payload as string; });

    // Suspend User
    builder
      .addCase(suspendUser.fulfilled, (state, action) => {
        const { userId, status } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) state.users[index].status = status;
        if (state.currentUser?.id === userId) state.currentUser.status = status;
      })
      .addCase(suspendUser.rejected, (state, action) => { state.error = action.payload as string; });

    // Update User Subscription
    builder
      .addCase(updateUserSubscription.fulfilled, (state, action) => {
        const { userId, planId, plan } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          state.users[index].plan_id = planId;
          if (plan) {
            state.users[index].plan = plan;
            state.users[index].plan_details = plan;
          }
        }
        if (state.currentUser?.id === userId) {
          state.currentUser.plan_id = planId;
          if (plan) {
            state.currentUser.plan = plan;
            state.currentUser.plan_details = plan;
          }
        }
      })
      .addCase(updateUserSubscription.rejected, (state, action) => { state.error = action.payload as string; });

    // Update Photo Resize Permission
    builder
      .addCase(updateUserPhotoResizePermission.fulfilled, (state, action) => {
        const { userId, canManagePhotoResize } = action.payload;
        const index = state.users.findIndex(u => u.id === userId);
        if (index !== -1) {
          state.users[index].can_manage_photo_resize = canManagePhotoResize;
        }
        if (state.currentUser?.id === userId) {
          state.currentUser.can_manage_photo_resize = canManagePhotoResize;
        }
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(u => u.id !== action.payload);
        state.totalUsers -= 1;
        if (state.currentUser?.id === action.payload) state.currentUser = null;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string; });
  },
});

export const { clearError, clearCurrentUser, updateUserInList, removeUserFromList } = usersSlice.actions;
export default usersSlice.reducer;
