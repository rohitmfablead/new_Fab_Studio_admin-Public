import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, put } from '../../lib/api';

// Types
export interface User {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar?: string;
  status?: string | number;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  max_photos: number;
  max_events: number;
  max_storage_bytes: number;
  max_videos: number;
  has_face_recognition: boolean;
  has_custom_watermark: boolean;
  role: string;
}

export interface Enquiry {
  id: number;
  user_id: number;
  plan_id: number;
  subject: string | null;
  priority: string;
  message: string;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to: number | null;
  protocol_id: string;
  user: User;
  plan: Plan;
  assignee: any | null;
}

export interface EnquiriesState {
  enquiries: Enquiry[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  } | null;
}

const initialState: EnquiriesState = {
  enquiries: [],
  isLoading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const fetchEnquiries = createAsyncThunk(
  'enquiries/fetchEnquiries',
  async (params: { page?: number; limit?: number; search?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status && params.status !== 'All Status') {
        queryParams.append('status', params.status.toLowerCase().replace(' ', '_'));
      }

      const response = await get<any>(`/admin/inquiries${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
      
      if (response.success) {
        return {
          enquiries: response.data || [],
          pagination: (response as any).pagination || null,
        };
      } else {
        return rejectWithValue(response.error?.message || 'Failed to fetch enquiries');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch enquiries');
    }
  }
);

export const updateEnquiryStatus = createAsyncThunk(
  'enquiries/updateStatus',
  async ({ id, status }: { id: number; status: string }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/inquiries/${id}/status`, { status });
      
      if (response.success) {
        return { id, status };
      } else {
        return rejectWithValue(response.error?.message || 'Failed to update enquiry status');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update enquiry status');
    }
  }
);

export const activateEnquiry = createAsyncThunk(
  'enquiries/activate',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/inquiries/${id}/activate`, {});
      
      if (response.success) {
        return { id };
      } else {
        return rejectWithValue(response.error?.message || 'Failed to activate enquiry');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to activate enquiry');
    }
  }
);

export const assignEnquiry = createAsyncThunk(
  'enquiries/assign',
  async ({ id, assigned_to }: { id: number; assigned_to: number }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/inquiries/${id}/assign`, { assigned_to });
      
      if (response.success) {
        return { id, assigned_to };
      } else {
        return rejectWithValue(response.error?.message || 'Failed to assign enquiry');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign enquiry');
    }
  }
);

export const assignPlanToEnquiry = createAsyncThunk(
  'enquiries/assignPlan',
  async ({ id, plan_id, user_id }: { id: number; plan_id: number; user_id: number }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/users/${user_id}/subscription`, { planId: plan_id });
      
      if (response.success) {
        return { id, plan_id };
      } else {
        return rejectWithValue(response.error?.message || 'Failed to assign plan');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign plan');
    }
  }
);

// Slice
const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Enquiries
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = action.payload.enquiries;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Enquiry Status
    builder
      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        const index = state.enquiries.findIndex(enq => enq.id === action.payload.id);
        if (index !== -1) {
          state.enquiries[index].status = action.payload.status;
        }
      });

    // Activate Enquiry
    builder
      .addCase(activateEnquiry.fulfilled, (state, action) => {
        // Optionally update local state if needed
      });

    // Assign Enquiry
    builder
      .addCase(assignEnquiry.fulfilled, (state, action) => {
        const index = state.enquiries.findIndex(enq => enq.id === action.payload.id);
        if (index !== -1) {
          state.enquiries[index].assigned_to = action.payload.assigned_to;
        }
      });

    // Assign Plan to Enquiry
    builder
      .addCase(assignPlanToEnquiry.fulfilled, (state, action) => {
        const index = state.enquiries.findIndex(enq => enq.id === action.payload.id);
        if (index !== -1) {
          state.enquiries[index].plan_id = action.payload.plan_id;
        }
      });
  },
});

export const { clearError } = enquiriesSlice.actions;
export default enquiriesSlice.reducer;
