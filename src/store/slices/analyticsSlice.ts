import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get } from '../../lib/api';

// Types
export interface OverviewData {
  total_users: number;
  active_users: number;
  total_groups: number;
  total_photos: number;
  total_videos: number;
  storage_used: number;
  revenue: number;
  storageUsed?: string;
}

export interface UserGrowthData {
  date: string;
  new_users: number;
  active_users: number;
}

export interface ContentStatsData {
  date: string;
  photos_uploaded: number;
  videos_uploaded: number;
  storage_used: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
}

export interface StorageDistribution {
  label: string;
  value: string;
  raw_bytes: string | number;
  color: string;
}

export interface SystemHealthItem {
  value: string;
  status: string;
}

export interface RecentActivityItem {
  type: string;
  title: string;
  description: string;
  time: string;
}

export interface DashboardAnalytics {
  overview: OverviewData;
  user_growth: UserGrowthData[];
  content_stats: ContentStatsData[];
  revenue_data: RevenueData[];
  storageDistribution?: StorageDistribution[];
  systemHealth?: Record<string, SystemHealthItem>;
  recentActivity?: RecentActivityItem[];
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_registrations: number;
  user_retention: number;
  top_countries: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
  user_activity: Array<{
    date: string;
    active_users: number;
    new_users: number;
  }>;
}

export interface ContentAnalytics {
  total_photos: number;
  total_videos: number;
  total_storage: number;
  avg_file_size: number;
  upload_trends: Array<{
    date: string;
    photos: number;
    videos: number;
    storage: number;
  }>;
  popular_categories: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}

export interface EngagementAnalytics {
  total_interactions: number;
  avg_session_duration: number;
  bounce_rate: number;
  page_views: number;
  engagement_trends: Array<{
    date: string;
    interactions: number;
    sessions: number;
    duration: number;
  }>;
}

export interface RevenueAnalytics {
  total_revenue: number;
  monthly_recurring_revenue: number;
  average_revenue_per_user: number;
  subscription_growth: Array<{
    period: string;
    revenue: number;
    subscriptions: number;
    growth_rate: number;
  }>;
  revenue_by_plan: Array<{
    plan: string;
    revenue: number;
    subscriptions: number;
    percentage: number;
  }>;
}

// State
export interface AnalyticsState {
  dashboard: DashboardAnalytics | null;
  userAnalytics: UserAnalytics | null;
  contentAnalytics: ContentAnalytics | null;
  engagementAnalytics: EngagementAnalytics | null;
  revenueAnalytics: RevenueAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboard: null,
  userAnalytics: null,
  contentAnalytics: null,
  engagementAnalytics: null,
  revenueAnalytics: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardAnalytics = createAsyncThunk(
  'analytics/fetchDashboardAnalytics',
  async (_period: string = '30d', { rejectWithValue }) => {
    try {
      const response = await get<any>('/admin/dashboard');

      if (response.success && response.data) {
        const d = response.data;

        // Map API response to DashboardAnalytics shape
        const mapped: DashboardAnalytics = {
          overview: {
            total_users: d.summary?.totalUsers?.value ?? 0,
            active_users: d.summary?.totalUsers?.value ?? 0,
            total_groups: d.summary?.activeGroups?.value ?? 0,
            total_photos: d.summary?.totalPhotos?.value ?? 0,
            total_videos: 0,
            storage_used: 0,
            revenue: d.summary?.revenue?.value ?? 0,
            storageUsed: d.summary?.storageUsed?.value ?? '0 MB',
          },
          user_growth: (d.userGrowth || []).map((g: any) => ({
            date: g.date,
            new_users: g.count,
            active_users: g.count,
          })),
          content_stats: [],
          revenue_data: [],
          storageDistribution: d.storageDistribution || [],
          systemHealth: d.systemHealth || {},
          recentActivity: d.recentActivity || [],
        };

        return mapped;
      } else {
        throw new Error((response as any).message || response.error?.message || 'Failed to fetch dashboard analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard analytics');
    }
  }
);

export const fetchUserAnalytics = createAsyncThunk(
  'analytics/fetchUserAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<UserAnalytics>('/analytics/users');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch user analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user analytics');
    }
  }
);

export const fetchContentAnalytics = createAsyncThunk(
  'analytics/fetchContentAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<ContentAnalytics>('/analytics/content');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch content analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch content analytics');
    }
  }
);

export const fetchEngagementAnalytics = createAsyncThunk(
  'analytics/fetchEngagementAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<EngagementAnalytics>('/analytics/engagement');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch engagement analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch engagement analytics');
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'analytics/fetchRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<RevenueAnalytics>('/analytics/revenue');
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch revenue analytics');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch revenue analytics');
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.dashboard = null;
    },
    clearUserAnalytics: (state) => {
      state.userAnalytics = null;
    },
    clearContentAnalytics: (state) => {
      state.contentAnalytics = null;
    },
    clearEngagementAnalytics: (state) => {
      state.engagementAnalytics = null;
    },
    clearRevenueAnalytics: (state) => {
      state.revenueAnalytics = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Dashboard Analytics
    builder
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch User Analytics
    builder
      .addCase(fetchUserAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Content Analytics
    builder
      .addCase(fetchContentAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchContentAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contentAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchContentAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Engagement Analytics
    builder
      .addCase(fetchEngagementAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEngagementAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.engagementAnalytics = action.payload;
        state.error = null;
      })
      .addCase(fetchEngagementAnalytics.rejected, (state, action) => {
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
  },
});

export const {
  clearError,
  clearDashboardData,
  clearUserAnalytics,
  clearContentAnalytics,
  clearEngagementAnalytics,
  clearRevenueAnalytics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
