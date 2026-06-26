import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { get, post, put, del } from '../../lib/api';

// Types
export interface Photographer {
  id: number;
  name: string;
  avatar: string;
}

export interface Photo {
  id: number;
  group_id: number;
  filename: string;
  url: string;
  thumbnail_url: string;
  photographer: Photographer;
  size_bytes: number;
  size_formatted: string;
  resolution: string | null;
  width: number | null;
  height: number | null;
  format: string;
  status: string;
  uploaded_at: string;
  created_at: string;
  metadata: any[];
  tags: string[];
  likes_count: number;
  comments_count: number;
}

export interface Video {
  id: number;
  group_id: number;
  uploader_id: number;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string | null;
  file_type: string;
  size: number;
  size_formatted: string;
  duration: string | null;
  status: string;
  created_at: string;
  uploader: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface PhotosPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

export interface PhotosStats {
  total_photos: number;
  total_size_bytes: string;
  total_size_formatted: string;
}

export interface FetchPhotosParams {
  groupId: number;
  page?: number;
  limit?: number;
  search?: string;
  photographer?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UploadPhotosParams {
  groupId: number;
  files: File[];
  folder?: string;
}

export interface UpdatePhotoStatusParams {
  groupId: number;
  photoId: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
}

export interface BulkDeletePhotosParams {
  groupId: number;
  photo_ids: number[];
}

export interface BulkDownloadPhotosParams {
  groupId: number;
  photo_ids: number[];
}

// State
export interface PhotosState {
  photos: Photo[];
  videos: Video[];
  pagination: PhotosPagination | null;
  stats: PhotosStats | null;
  isLoading: boolean;
  isUploading: boolean;
  isDownloading: boolean;
  error: string | null;
  uploadProgress: number;
}

const initialState: PhotosState = {
  photos: [],
  videos: [],
  pagination: null,
  stats: null,
  isLoading: false,
  isUploading: false,
  isDownloading: false,
  error: null,
  uploadProgress: 0,
};

// Async thunks
export const fetchPhotos = createAsyncThunk(
  'photos/fetchPhotos',
  async (params: FetchPhotosParams, { rejectWithValue }) => {
    try {
      const { groupId, ...queryParams } = params;
      const response = await get<any>(`/groups/${groupId}/photos`, queryParams);
      
      if (response.success && response.data) {
        return {
          photos: response.data.photos || [],
          pagination: response.data.pagination || null,
          stats: response.data.stats || null,
        };
      }
      
      throw new Error('Failed to fetch photos');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photos');
    }
  }
);

export interface FetchVideosParams {
  groupId: number;
  search?: string;
}

export const fetchVideos = createAsyncThunk(
  'photos/fetchVideos',
  async (params: FetchVideosParams, { rejectWithValue }) => {
    try {
      const { groupId, search } = params;
      const response = await get<any>(`/groups/${groupId}/videos`, { search });
      
      if (response.success && response.data) {
        return response.data.videos || [];
      }
      
      throw new Error('Failed to fetch videos');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch videos');
    }
  }
);



export const uploadPhotos = createAsyncThunk(
  'photos/uploadPhotos',
  async (params: UploadPhotosParams, { rejectWithValue }) => {
    try {
      const { groupId, files, folder } = params;
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files[]', file);
      });
      
      if (folder) {
        formData.append('folder', folder);
      }
      
      // Use fetch for file upload with progress tracking
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://stag.fablead-studio.com/services/api'}/groups/${groupId}/photos/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: formData,
        }
      );
      
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          photos: result.data.photos || [],
          pagination: result.data.pagination || null,
          stats: result.data.stats || null,
        };
      }
      
      throw new Error(result.message || 'Failed to upload photos');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload photos');
    }
  }
);

export const fetchPhotoById = createAsyncThunk(
  'photos/fetchPhotoById',
  async ({ groupId, photoId }: { groupId: number; photoId: number }, { rejectWithValue }) => {
    try {
      const response = await get<any>(`/groups/${groupId}/photos/${photoId}`);
      
      if (response.success && response.data) {
        return response.data.photo;
      }
      
      throw new Error('Failed to fetch photo');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch photo');
    }
  }
);

export const updatePhotoStatus = createAsyncThunk(
  'photos/updatePhotoStatus',
  async (params: UpdatePhotoStatusParams, { rejectWithValue }) => {
    try {
      const { groupId, photoId, status } = params;
      const response = await put<any>(`/groups/${groupId}/photos/${photoId}/status`, { status });
      
      if (response.success && response.data) {
        return response.data.photo;
      }
      
      throw new Error('Failed to update photo status');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update photo status');
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'photos/deletePhoto',
  async ({ groupId, photoId }: { groupId: number; photoId: number }, { rejectWithValue }) => {
    try {
      const response = await del<any>(`/groups/${groupId}/photos/${photoId}`);
      
      if (response.success) {
        return photoId;
      }
      
      throw new Error('Failed to delete photo');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete photo');
    }
  }
);

export const bulkDeletePhotos = createAsyncThunk(
  'photos/bulkDeletePhotos',
  async (params: BulkDeletePhotosParams, { rejectWithValue }) => {
    try {
      const { groupId, photo_ids } = params;
      const response = await post<any>(`/groups/${groupId}/photos/bulk-delete`, { photo_ids });
      
      if (response.success && response.data) {
        return {
          deleted_ids: photo_ids,
          deleted_count: response.data.deleted_count,
        };
      }
      
      throw new Error('Failed to delete photos');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete photos');
    }
  }
);

export const bulkDownloadPhotos = createAsyncThunk(
  'photos/bulkDownloadPhotos',
  async (params: BulkDownloadPhotosParams, { rejectWithValue }) => {
    try {
      const { groupId, photo_ids } = params;
      
      // Make request to download endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://stag.fablead-studio.com/services/api'}/photos/download`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            photo_ids,
            download_type: 'specific'
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to download photos');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photos_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true, count: photo_ids.length };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to download photos');
    }
  }
);

// Slice
const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPhotos: (state) => {
      state.photos = [];
      state.pagination = null;
      state.stats = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Photos
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.photos = action.payload.photos;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        state.error = null;
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Videos
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload;
        state.error = null;
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });



    // Upload Photos
    builder
      .addCase(uploadPhotos.pending, (state) => {
        state.isUploading = true;
        state.error = null;
        state.uploadProgress = 0;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.isUploading = false;
        state.photos = action.payload.photos;
        state.pagination = action.payload.pagination;
        state.stats = action.payload.stats;
        state.error = null;
        state.uploadProgress = 100;
      })
      .addCase(uploadPhotos.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
        state.uploadProgress = 0;
      });

    // Update Photo Status
    builder
      .addCase(updatePhotoStatus.fulfilled, (state, action) => {
        const index = state.photos.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.photos[index] = action.payload;
        }
      });

    // Delete Photo
    builder
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter(p => p.id !== action.payload);
        if (state.stats) {
          state.stats.total_photos -= 1;
        }
      });

    // Bulk Delete Photos
    builder
      .addCase(bulkDeletePhotos.fulfilled, (state, action) => {
        state.photos = state.photos.filter(p => !action.payload.deleted_ids.includes(p.id));
        if (state.stats) {
          state.stats.total_photos -= action.payload.deleted_count;
        }
      });

    // Bulk Download Photos
    builder
      .addCase(bulkDownloadPhotos.pending, (state) => {
        state.isDownloading = true;
        state.error = null;
      })
      .addCase(bulkDownloadPhotos.fulfilled, (state) => {
        state.isDownloading = false;
        state.error = null;
      })
      .addCase(bulkDownloadPhotos.rejected, (state, action) => {
        state.isDownloading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearPhotos, setUploadProgress } = photosSlice.actions;

export default photosSlice.reducer;
