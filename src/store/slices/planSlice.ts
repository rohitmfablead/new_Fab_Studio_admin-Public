import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../lib/api';

// Types
export interface Plan {
  id: number;
  role: string;
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
  has_business_branding: boolean;
  has_view_client_favorites: boolean;
  has_switch_downloads: boolean;
  has_bulk_download: boolean;
  has_portfolio_website: boolean;
  has_team_login: boolean;
  has_digital_album: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  features?: string[];
}

export interface CreatePlanData {
  role: string;
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
  has_business_branding: boolean;
  has_view_client_favorites: boolean;
  has_switch_downloads: boolean;
  has_bulk_download: boolean;
  has_portfolio_website: boolean;
  has_team_login: boolean;
  has_digital_album: boolean;
  features: string[];
}

export interface UpdatePlanData {
  role?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  currency?: string;
  max_photos?: number;
  max_videos?: number;
  max_storage_bytes?: number;
  max_events?: number;
  has_custom_watermark?: boolean;
  has_face_recognition?: boolean;
  has_business_branding?: boolean;
  has_view_client_favorites?: boolean;
  has_switch_downloads?: boolean;
  has_bulk_download?: boolean;
  has_portfolio_website?: boolean;
  has_team_login?: boolean;
  has_digital_album?: boolean;
  features?: string[];
}

// State
export interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanState = {
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<Plan[]>('/admin/plans');

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      } else {
        throw new Error(response.error?.message || 'Failed to fetch plans');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch plans');
    }
  }
);

export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (planData: CreatePlanData, { rejectWithValue }) => {
    try {
      const response = await post<Plan>('/admin/plans', planData);

      if (response.success && response.data) {
        // API returns data directly as plan object
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create plan');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ planId, planData }: { planId: number; planData: UpdatePlanData }, { rejectWithValue }) => {
    try {
      const response = await put<Plan>(`/admin/plans/${planId}`, planData);

      if (response.success && response.data) {
        // API returns data directly as plan object
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update plan');
    }
  }
);

export const deletePlan = createAsyncThunk(
  'plans/deletePlan',
  async (planId: number, { rejectWithValue }) => {
    try {
      const response = await del(`/admin/plans/${planId}`);

      if (response.success) {
        return planId;
      } else {
        throw new Error(response.error?.message || 'Failed to delete plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete plan');
    }
  }
);

// Slice
const planSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    updatePlanInList: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.plans[index] = action.payload;
      }
    },
    removePlanFromList: (state, action: PayloadAction<number>) => {
      state.plans = state.plans.filter(plan => plan.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Plans
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Plan
    builder
      .addCase(createPlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans.push(action.payload);
        state.error = null;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Plan
    builder
      .addCase(updatePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.plans.findIndex(plan => plan.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
        if (state.currentPlan && state.currentPlan.id === action.payload.id) {
          state.currentPlan = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Plan
    builder
      .addCase(deletePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = state.plans.filter(plan => plan.id !== action.payload);
        if (state.currentPlan && state.currentPlan.id === action.payload) {
          state.currentPlan = null;
        }
        state.error = null;
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentPlan, updatePlanInList, removePlanFromList } = planSlice.actions;
export default planSlice.reducer;
