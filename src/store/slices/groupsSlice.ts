import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../lib/api';
import { PaginationData } from '../../lib/api';

// Types
export interface GroupOwner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  businessWebsite?: string;
  logo?: string;
  whatsappNumber?: string;
  socialLinks?: any;
  isVerified?: number;
  emailVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupMember {
  id: number;
  name: string;
  email: string;
  role: string;
  canUpload: number;
  isBlocked: boolean;
}

export interface GroupBranding {
  name: string | null;
  logo: string | null;
  show: boolean;
  onLoginPage: boolean;
}

export interface GroupFlipbook {
  enabled: boolean;
  autoPlay: boolean;
  showPageNumbers: boolean;
  animation: string;
  backgroundColor: string;
  backgroundMusic: string | null;
}

export interface GroupMonetization {
  enabled: boolean;
  sellPhotos: boolean;
  paidDownloads: boolean;
  pricePerPhoto: number;
  pricePerAlbum: number;
  currency: string;
  watermarkText: string;
  enableClientFavorites: boolean;
  allowDownloadFavorites: boolean;
  allowShareFavorites: boolean;
  autoNotifyFavorites: boolean;
  maxFavoritesPerClient: number;
  clientAlbumSelection: boolean;
  maxSelections: number;
}

export interface GroupPrivacy {
  allowMemberEdit: boolean;
  allowJoinByLink: boolean;
  allowAnonymousView: boolean;
  requireFaceVerification: boolean;
  uploadPermission: string;
}

export interface GroupViewDownload {
  allowDownloading: boolean;
  enableSharing: boolean;
  enableScreenshots: boolean;
  downloadQuality: string;
  viewingPlatform: string;
  bulkDownloads: boolean;
}

export interface GroupMedia {
  id: string;
  type: string;
  url: string;
  thumbnail: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface GroupSettings {
  allow_public_upload: boolean;
  require_approval: boolean;
  max_file_size: number;
}

export interface Group {
  id: number;
  name: string;
  type: string;
  status: string;
  eventType: string;
  eventDate: string | null;
  description: string | null;
  coverImage: string | null;
  joinCode: string;
  inviteLink: string;
  owner: GroupOwner;
  memberCount: number;
  photoCount: number;
  participants: GroupMember[];
  branding: GroupBranding;
  flipbook: GroupFlipbook;
  monetization: GroupMonetization;
  privacy: GroupPrivacy;
  viewDownload: GroupViewDownload;
  sponsors: any[];
  team_members: any[];
  albumDownloadPin: string | null;
  enableWatermark: boolean;
  sortBy: string;
  createdAt: string;
  updatedAt: string;
  // legacy fields for UI compatibility
  members?: number;
  uploads?: number;
  preview?: string;
  location?: string;
  event_type?: string;
  created?: string;
  lastActivity?: string;
  last_activity?: string;
  settings?: GroupSettings;
  recent_media?: GroupMedia[];
  is_featured?: boolean;
}

export interface GroupsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface GroupsResponse {
  groups: Group[];
  pagination: PaginationData;
}

export interface CreateGroupData {
  name: string;
  type?: string;
  event_type?: string;
  description?: string;
  location?: string;
  owner_id?: number;
  settings?: Partial<GroupSettings>;
}

export interface UpdateGroupData {
  name?: string;
  type?: string;
  event_type?: string;
  description?: string;
  location?: string;
  settings?: GroupSettings;
}

export interface AddMemberData {
  user_id: number;
  role: string;
}

// State
export interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  pagination: PaginationData | null;
  isLoading: boolean;
  error: string | null;
  totalGroups: number;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  pagination: null,
  isLoading: false,
  error: null,
  totalGroups: 0,
};

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (params: GroupsQueryParams = {}, { rejectWithValue }) => {
    try {
      const response = await get<any>('/admin/groups', params);

      if (response.success) {
        // API returns: {success, data: [...groups], pagination: {total, page, limit, totalPages}}
        const groups = Array.isArray(response.data) ? response.data : [];
        const pagination = response.pagination || {};
        return {
          groups,
          pagination: {
            current_page: pagination.page ?? 1,
            total_pages: pagination.totalPages ?? 1,
            total_items: pagination.total ?? groups.length,
            per_page: pagination.limit ?? 9,
          }
        };
      } else {
        throw new Error((response as any).message || response.error?.message || 'Failed to fetch groups');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch groups');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await get<any>(`/admin/groups/${groupId}`);
      
      if (response.success) {
        // API returns: {success, data: {...group}}
        return response.data ?? null;
      } else {
        throw new Error((response as any).message || response.error?.message || 'Failed to fetch group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData: CreateGroupData, { rejectWithValue }) => {
    try {
      const response = await post<any>('/admin/groups', groupData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to create group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, groupData }: { groupId: number; groupData: UpdateGroupData }, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/groups/${groupId}`, groupData);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to update group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update group');
    }
  }
);

export const toggleGroupStatus = createAsyncThunk(
  'groups/toggleGroupStatus',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await put<any>(`/admin/groups/${groupId}/status`);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Failed to toggle group status');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to toggle group status');
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await del(`/admin/groups/${groupId}`);
      
      if (response.success) {
        return groupId;
      } else {
        throw new Error(response.error?.message || 'Failed to delete group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete group');
    }
  }
);

export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchGroupMembers',
  async (groupId: number, { rejectWithValue }) => {
    try {
      const response = await get<any>(`/admin/groups/${groupId}/members`);
      
      if (response.success && response.data) {
        return { groupId, members: response.data };
      } else {
        throw new Error(response.error?.message || 'Failed to fetch group members');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch group members');
    }
  }
);

export const addMemberToGroup = createAsyncThunk(
  'groups/addMemberToGroup',
  async ({ groupId, memberData }: { groupId: number; memberData: AddMemberData }, { rejectWithValue }) => {
    try {
      const response = await post<any>(`/admin/groups/${groupId}/members`, memberData);
      
      if (response.success) {
        // API returns: {success: true, message: "Member added successfully"}
        // No member data returned, so we return groupId to trigger a refetch
        return { groupId, member: memberData };
      } else {
        throw new Error(response.error?.message || 'Failed to add member to group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add member to group');
    }
  }
);

export const removeMemberFromGroup = createAsyncThunk(
  'groups/removeMemberFromGroup',
  async ({ groupId, userId }: { groupId: number; userId: number }, { rejectWithValue }) => {
    try {
      const response = await del(`/admin/groups/${groupId}/members/${userId}`);
      
      if (response.success) {
        return { groupId, userId };
      } else {
        throw new Error(response.error?.message || 'Failed to remove member from group');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove member from group');
    }
  }
);

// Slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGroup: (state) => {
      state.currentGroup = null;
    },
    updateGroupInList: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex(group => group.id === action.payload.id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    removeGroupFromList: (state, action: PayloadAction<number>) => {
      state.groups = state.groups.filter(group => group.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Groups
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups;
        state.pagination = action.payload.pagination;
        state.totalGroups = action.payload.pagination.total_items;
        state.error = null;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Group By ID
    builder
      .addCase(fetchGroupById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
        state.error = null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.currentGroup = null;
      });

    // Create Group
    builder
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups.unshift(action.payload);
        state.totalGroups += 1;
        state.error = null;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Group
    builder
      .addCase(updateGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup && state.currentGroup.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
        state.error = null;
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Toggle Group Status
    builder
      .addCase(toggleGroupStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleGroupStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.groups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup && state.currentGroup.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
        state.error = null;
      })
      .addCase(toggleGroupStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Group
    builder
      .addCase(deleteGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = state.groups.filter(group => group.id !== action.payload);
        state.totalGroups -= 1;
        if (state.currentGroup && state.currentGroup.id === action.payload) {
          state.currentGroup = null;
        }
        state.error = null;
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Group Members
    builder
      .addCase(fetchGroupMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        const { groupId, members } = action.payload;
        
        // Update current group if it matches
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.participants = members;
        }
        
        // Update in groups list if it exists
        const groupIndex = state.groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].participants = members;
        }
        
        state.error = null;
      })
      .addCase(fetchGroupMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Member to Group
    builder
      .addCase(addMemberToGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        const { groupId, member } = action.payload;
        
        // Update current group if it matches
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.participants = state.currentGroup.participants || [];
          state.currentGroup.participants.push(member);
          state.currentGroup.memberCount = (state.currentGroup.memberCount || 0) + 1;
        }
        
        // Update in groups list if it exists
        const groupIndex = state.groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].participants = state.groups[groupIndex].participants || [];
          state.groups[groupIndex].participants.push(member);
          state.groups[groupIndex].memberCount = (state.groups[groupIndex].memberCount || 0) + 1;
        }
        
        state.error = null;
      })
      .addCase(addMemberToGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove Member from Group
    builder
      .addCase(removeMemberFromGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        const { groupId, userId } = action.payload;
        
        // Remove from current group if it's the one being updated
        if (state.currentGroup && state.currentGroup.id === groupId) {
          state.currentGroup.participants = (state.currentGroup.participants || []).filter(
            member => member.id !== userId
          );
          state.currentGroup.memberCount = Math.max(0, (state.currentGroup.memberCount || 0) - 1);
        }
        
        // Remove from groups list if it's the one being updated
        const groupIndex = state.groups.findIndex(group => group.id === groupId);
        if (groupIndex !== -1) {
          state.groups[groupIndex].participants = (state.groups[groupIndex].participants || []).filter(
            member => member.id !== userId
          );
          state.groups[groupIndex].memberCount = Math.max(0, (state.groups[groupIndex].memberCount || 0) - 1);
        }
        
        state.error = null;
      })
      .addCase(removeMemberFromGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentGroup, updateGroupInList, removeGroupFromList } = groupsSlice.actions;
export default groupsSlice.reducer;
