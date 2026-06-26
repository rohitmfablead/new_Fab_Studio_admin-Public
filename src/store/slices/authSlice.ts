import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { post, del } from '../../lib/api';

// Types
export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  avatar: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  expiresIn: number | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,
  expiresIn: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Login attempt with:', credentials.email);
      const response = await post('/auth/admin-login', credentials);
      console.log('Login response:', response);
      
      if (response.success) {
        const response_data = response as any;
        const { token, user, expires_in } = response_data;
        
        console.log('Token received:', token ? 'YES' : 'NO');
        console.log('User data:', user);
        
        // Store tokens in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('refresh_token', token); // Using same token as refresh for simplicity
        
        console.log('Token stored in localStorage');
        
        return {
          user,
          token,
          refreshToken: token,
          expiresIn: expires_in,
        };
      } else {
        console.log('Login failed:', response.error?.message || 'Login failed');
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: any) {
      console.log('Login error:', error);
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('refresh_token');
      if (!token) {
        throw new Error('No refresh token available');
      }

      // For now, just validate the existing token is still valid
      // In a real implementation, you might call a validation endpoint
      return {
        token: token,
        refreshToken: token,
        expiresIn: 3600, // 1 hour default
      };
    } catch (error: any) {
      // Clear tokens on refresh failure
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API endpoint
      const response = await post('/auth/logout', {});
      
      // Clear tokens from localStorage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      if (response.success) {
        return true;
      } else {
        // Even if API fails, we still logout locally
        return true;
      }
    } catch (error: any) {
      // Even if API call fails, clear local tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      // Don't reject, just return success since local logout is done
      return true;
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.expiresIn = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.expiresIn = action.payload.expiresIn;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.expiresIn = action.payload.expiresIn;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.expiresIn = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.expiresIn = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.expiresIn = null;
      });
  },
});

export const { clearError, setCredentials, logoutUser } = authSlice.actions;
export default authSlice.reducer;
