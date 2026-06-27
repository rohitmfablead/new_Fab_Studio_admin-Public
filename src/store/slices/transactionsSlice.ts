import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TransactionUser {
  id: number;
  name: string | null;
  email: string | null;
}

export interface Transaction {
  id: number;
  user_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  amount: string;          // comes as string from API e.g. "2298.00"
  currency: string;
  status: string;          // 'pending' | 'successful' | 'failed'
  receipt: string | null;
  created_at: string;
  updated_at: string;
  user: TransactionUser | null;
  // Optional related data
  features?: {
    id: number;
    feature_name: string;
    value: string | null;
    icon: string;
    created_at: string;
    updated_at: string;
  }[];
  addons_id?: {
    id: number;
    subscription_feature_id: number;
    feature_value: string | null;
    addon_price: number;
    created_at: string;
    updated_at: string;
  }[];}

export interface TransactionsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: TransactionsState = {
  transactions: [],
  isLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

// GET /admin/transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params: TransactionsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<any>('/admin/transactions', params);
      // API returns { status: "success", data: [...] } — handle both shapes
      const isSuccess = response.success === true || (response as any).status === 'success';
      if (isSuccess) {
        // data is a flat array
        const transactions: Transaction[] = (response as any).data ?? [];
        return Array.isArray(transactions) ? transactions : [];
      } else {
        throw new Error(
          (response as any).message || response.error?.message || 'Failed to fetch transactions'
        );
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch transactions');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = transactionsSlice.actions;
export default transactionsSlice.reducer;
