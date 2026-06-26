import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get } from '../../lib/api';

// Types
export interface Transaction {
  id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  date: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  plan_name: string;
  plan_price: number;
  currency: string;
  status: string;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  last_payment: string;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_revenue: number;
  yearly_revenue: number;
  revenue_growth: number;
  revenue_by_plan: Array<{
    plan_name: string;
    revenue: number;
    subscriptions: number;
    percentage: number;
  }>;
  revenue_trends: Array<{
    period: string;
    revenue: number;
    transactions: number;
    growth_rate: number;
  }>;
}

export interface TransactionsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_transactions: number;
    per_page: number;
  };
}

// State
export interface BillingState {
  transactions: Transaction[];
  subscriptions: Subscription[];
  revenueAnalytics: RevenueAnalytics | null;
  pagination: {
    current_page: number;
    total_pages: number;
    total_transactions: number;
    per_page: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  totalTransactions: number;
}

const initialState: BillingState = {
  transactions: [],
  subscriptions: [],
  revenueAnalytics: null,
  pagination: null,
  isLoading: false,
  error: null,
  totalTransactions: 0,
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'billing/fetchTransactions',
  async (params: TransactionsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<TransactionsResponse>('/billing/transactions', params);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch transactions');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'billing/fetchRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<{ analytics: RevenueAnalytics }>('/billing/revenue');
      
      if (response.success && response.data) {
        return response.data.analytics;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch revenue analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  'billing/fetchSubscriptions',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await get<{ subscriptions: Subscription[] }>('/billing/subscriptions', params);
      
      if (response.success && response.data) {
        return response.data.subscriptions;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch subscriptions');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch subscriptions');
    }
  }
);

// Slice
const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.pagination = null;
      state.totalTransactions = 0;
    },
    clearSubscriptions: (state) => {
      state.subscriptions = [];
    },
    clearRevenueAnalytics: (state) => {
      state.revenueAnalytics = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.totalTransactions = action.payload.pagination.total_transactions;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Revenue Analytics
    builder
      .addCase(fetchRevenueAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchRevenueAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Subscriptions
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload;
        state.error = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearTransactions,
  clearSubscriptions,
  clearRevenueAnalytics,
} = billingSlice.actions;

export default billingSlice.reducer;
