import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put } from '../../lib/api';
import { PaginationData } from '../../lib/api';

// Types
export interface TicketUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface SupportTicket {
  id: string;
  user: TicketUser | string;
  user_id?: number;
  subject: string;
  status: string;
  priority: string;
  date: string;
  created_at?: string;
  last_updated: string;
  assigned_to: string;
  messages_count: number;
  description?: string;
}

export interface TicketDetail {
  id: string;
  user: TicketUser | string;
  user_email: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  date: string;
  last_updated: string;
  assigned_to: string;
  messages: Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    is_admin: boolean;
  }>;
}

export interface Enquiry {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subscription_id: string;
  subject: string;
  message: string;
  status: string;
  date: string;
  priority: string;
}

export interface SupportTicketsQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  search?: string;
}

export interface SupportTicketsResponse {
  tickets: SupportTicket[];
  pagination: PaginationData;
}

export interface CreateTicketData {
  user_id: number;
  subject: string;
  description: string;
  priority: string;
}

export interface UpdateTicketData {
  status?: string;
  priority?: string;
  assigned_to?: string;
  subject?: string;
  description?: string;
}

export interface CreateEnquiryData {
  user_name: string;
  user_email: string;
  user_phone: string;
  subscription_id: string;
  subject: string;
  message: string;
  priority: string;
}

// State
export interface SupportState {
  tickets: SupportTicket[];
  currentTicket: TicketDetail | null;
  enquiries: Enquiry[];
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  totalTickets: number;
}

const initialState: SupportState = {
  tickets: [],
  currentTicket: null,
  enquiries: [],
  pagination: null,
  isLoading: false,
  error: null,
  totalTickets: 0,
};

// Async thunks
export const fetchSupportTickets = createAsyncThunk(
  'support/fetchSupportTickets',
  async (params: SupportTicketsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<any>('/admin/support/tickets', params);
      
      if (response.success) {
        const apiData = response.data;
        
        // Handle case where API returns empty array directly
        if (Array.isArray(apiData)) {
          return {
            tickets: apiData,
            pagination: {
              current_page: params.page || 1,
              total_pages: apiData.length > 0 ? 1 : 0,
              total_items: apiData.length,
              per_page: params.limit || 10,
            }
          };
        }
        
        // Handle case where API returns object with tickets and pagination
        if (apiData && typeof apiData === 'object') {
          return {
            tickets: apiData.tickets || apiData,
            pagination: apiData.pagination || {
              current_page: params.page || 1,
              total_pages: 1,
              total_items: (apiData.tickets || apiData).length,
              per_page: params.limit || 10,
            }
          };
        }
        
        // Fallback: empty response
        return {
          tickets: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            per_page: params.limit || 10,
          }
        };
      } else {
        throw new Error(response.error?.message || 'Failed to fetch support tickets');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch support tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'support/fetchTicketById',
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const response = await get<{ ticket: TicketDetail }>(`/admin/support/tickets/${ticketId}`);
      
      if (response.success && response.data) {
        return response.data.ticket;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch ticket');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch ticket');
    }
  }
);

export const createSupportTicket = createAsyncThunk(
  'support/createSupportTicket',
  async (ticketData: CreateTicketData, { rejectWithValue }) => {
    try {
      const response = await post<any>('/admin/support/tickets', ticketData);
      
      if (response.success) {
        // Handle both { ticket: ... } and direct data shapes
        const ticket = response.data?.ticket ?? response.data ?? null;
        return ticket;
      } else {
        throw new Error(response.error?.message || 'Failed to create support ticket');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create support ticket');
    }
  }
);

export const updateSupportTicket = createAsyncThunk(
  'support/updateSupportTicket',
  async ({ ticketId, ticketData }: { ticketId: string; ticketData: UpdateTicketData }, { rejectWithValue }) => {
    try {
      const response = await put<{ ticket: SupportTicket }>(`/admin/support/tickets/${ticketId}`, ticketData);
      
      if (response.success && response.data) {
        return response.data.ticket;
      } else {
        throw new Error(response.error?.message || 'Failed to update support ticket');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update support ticket');
    }
  }
);

export const updateTicketStatus = createAsyncThunk(
  'support/updateTicketStatus',
  async ({ ticketId, status }: { ticketId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/support/tickets/${ticketId}/status`, { status });

      if (response.success) {
        return { ticketId, status };
      } else {
        const errorMessage = (response as any).message || response.error?.message || 'Failed to update ticket status';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update ticket status');
    }
  }
);

export const fetchEnquiries = createAsyncThunk(
  'support/fetchEnquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await get<{ enquiries: Enquiry[] }>('/admin/enquiries');
      
      if (response.success && response.data) {
        return response.data.enquiries;
      } else {
        throw new Error(response.error?.message || 'Failed to fetch enquiries');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch enquiries');
    }
  }
);

export const updateEnquiryStatus = createAsyncThunk(
  'support/updateEnquiryStatus',
  async ({ enquiryId, status }: { enquiryId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await put(`/admin/enquiries/${enquiryId}/status`, { status });
      
      if (response.success) {
        return { enquiryId, status };
      } else {
        throw new Error(response.error?.message || 'Failed to update enquiry status');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update enquiry status');
    }
  }
);

// Slice
const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    updateTicketInList: (state, action: PayloadAction<SupportTicket>) => {
      const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
      if (index !== -1) {
        state.tickets[index] = action.payload;
      }
    },
    removeTicketFromList: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
    },
    updateEnquiryInList: (state, action: PayloadAction<Enquiry>) => {
      const index = state.enquiries.findIndex(enquiry => enquiry.id === action.payload.id);
      if (index !== -1) {
        state.enquiries[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Support Tickets
    builder
      .addCase(fetchSupportTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupportTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = (action.payload.tickets || []).filter(Boolean);
        state.pagination = action.payload.pagination;
        state.totalTickets = action.payload.pagination.total_items;
        state.error = null;
      })
      .addCase(fetchSupportTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Ticket By ID
    builder
      .addCase(fetchTicketById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTicket = action.payload;
        state.error = null;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentTicket = null;
      });

    // Create Support Ticket
    builder
      .addCase(createSupportTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.unshift(action.payload);
        state.totalTickets += 1;
        state.error = null;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Support Ticket
    builder
      .addCase(updateSupportTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          // Update current ticket with new data
          state.currentTicket = {
            ...state.currentTicket,
            status: action.payload.status,
            priority: action.payload.priority,
            assigned_to: action.payload.assigned_to,
            subject: action.payload.subject,
            last_updated: action.payload.last_updated,
          };
        }
        state.error = null;
      })
      .addCase(updateSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Ticket Status
    builder
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const { ticketId, status } = action.payload;
        state.tickets = state.tickets.filter(Boolean);
        const index = state.tickets.findIndex(t => t.id === ticketId);
        if (index !== -1) {
          state.tickets[index].status = status;
        }
        if (state.currentTicket && state.currentTicket.id === ticketId) {
          state.currentTicket.status = status;
        }
      });

    // Fetch Enquiries
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enquiries = action.payload;
        state.error = null;
      })
      .addCase(fetchEnquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Enquiry Status
    builder
      .addCase(updateEnquiryStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { enquiryId, status } = action.payload;
        const index = state.enquiries.findIndex(enquiry => enquiry.id === enquiryId);
        if (index !== -1) {
          state.enquiries[index].status = status;
        }
        state.error = null;
      })
      .addCase(updateEnquiryStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentTicket,
  updateTicketInList,
  removeTicketFromList,
  updateEnquiryInList,
} = supportSlice.actions;

export default supportSlice.reducer;
