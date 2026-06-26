import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get } from '../../lib/api';
import { PaginationData } from '../../lib/api';

// Types
export interface SystemLog {
  id: number;
  action: string;
  user: string;
  module: string;
  time: string;
  status: string;
  details: string;
  ip_address: string;
}

export interface LogsQueryParams {
  page?: number;
  limit?: number;
  module?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface LogsResponse {
  logs: SystemLog[];
  pagination: PaginationData;
}

// State
export interface LogsState {
  logs: SystemLog[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  totalLogs: number;
}

const initialState: LogsState = {
  logs: [],
  pagination: null,
  isLoading: false,
  error: null,
  totalLogs: 0,
};

// Async thunks
export const fetchSystemLogs = createAsyncThunk(
  'logs/fetchSystemLogs',
  async (params: LogsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<LogsResponse>('/logs', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch system logs');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system logs');
    }
  }
);

// Slice
const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLogs: (state) => {
      state.logs = [];
      state.pagination = null;
      state.totalLogs = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch System Logs
    builder
      .addCase(fetchSystemLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs;
        state.pagination = action.payload.pagination;
        state.totalLogs = action.payload.pagination.total_items;
        state.error = null;
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
