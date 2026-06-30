import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, put, post, del, PaginationData } from '../../lib/api';

// Types
export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: string | {
    title: string;
    body: string;
    type: string;
    extra?: any;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
  // UI fields computed after parsing
  parsedData?: {
    title: string;
    body: string;
    type: string;
    extra?: any;
  };
  read?: boolean;
  title?: string;
  message?: string;
  timestamp?: string;
}

export interface SendNotificationData {
  user_ids: number[];
  title: string;
  body: string;
  type?: string;
  data?: any;
}

export interface FetchNotificationsParams {
  page?: number;
  per_page?: number;
  silent?: boolean;
}

// State
export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  isSending: boolean;
  pagination: PaginationData | null;
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isSending: false,
  pagination: null,
};

// API Response interface
interface NotificationsApiResponse {
  success: boolean;
  data: Notification[];  // Array of notifications directly
  unread_count: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: FetchNotificationsParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, per_page = 20 } = params;
      const response = await get<Notification[]>(
        '/admin/notifications',
        { page, limit: per_page }  // Changed per_page to limit
      );
      
      if (response.success) {
        // Cast the full response to access pagination and unread_count
        const fullResponse = response as any as NotificationsApiResponse;
        
        const notifications = (fullResponse.data || []).map((notif: any) => {
          let parsedData = { title: 'Notification', body: '', type: 'info' };
          try {
            if (typeof notif.data === 'string') {
              parsedData = JSON.parse(notif.data);
            } else {
              parsedData = notif.data;
            }
          } catch (e) {
            console.error('Failed to parse notification data', e);
          }

          return {
            ...notif,
            parsedData,
            read: !!notif.read_at,
            title: parsedData.title,
            message: parsedData.body,
            type: parsedData.type || 'info',
            timestamp: new Date(notif.created_at).toLocaleString(),
          };
        });

        return {
          notifications,
          unreadCount: fullResponse.unread_count || 0,
          pagination: {
            current_page: fullResponse.pagination?.page || 1,
            total_pages: fullResponse.pagination?.totalPages || 1,
            total_items: fullResponse.pagination?.total || 0,
            per_page: fullResponse.pagination?.limit || 20,
          },
        };
      } else {
        throw new Error(response.error?.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await put(`/admin/notifications/${notificationId}/read`);
      
      if (response.success) {
        return notificationId;
      } else {
        throw new Error(response.error?.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await put('/admin/notifications/read-all');
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to mark all notifications as read');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async (notificationData: SendNotificationData, { rejectWithValue }) => {
    try {
      const response = await post('/admin/notifications/send', notificationData);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to send notification');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send notification');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await del(`/admin/notifications/${notificationId}`);
      if (response.success) {
        return notificationId;
      } else {
        throw new Error(response.error?.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete notification');
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(
        notification => notification.id === action.payload.id
      );
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read;
        const isNowRead = action.payload.read;
        
        state.notifications[index] = action.payload;
        
        // Update unread count if read status changed
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        if (!action.meta.arg.silent) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
        state.unreadCount = action.payload.unreadCount;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark Notification as Read
    builder
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.notifications.findIndex(
          notification => notification.id === action.payload
        );
        if (index !== -1 && !state.notifications[index].read) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.error = null;
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark All Notifications as Read
    builder
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Send Notification
    builder
      .addCase(sendNotification.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state) => {
        state.isSending = false;
        state.error = null;
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      })
      // Delete Notification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        const index = state.notifications.findIndex(n => n.id === deletedId);
        if (index !== -1 && !state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== deletedId);
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearNotifications,
  addNotification,
  updateNotification,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
