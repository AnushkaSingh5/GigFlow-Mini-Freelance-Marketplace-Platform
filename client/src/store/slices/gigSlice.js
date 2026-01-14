// client/src/store/slices/gigSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as gigAPI from '../../api/gigs';

// Async Thunks
export const fetchAllGigs = createAsyncThunk(
  'gigs/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await gigAPI.fetchGigs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gigs'
      );
    }
  }
);

export const fetchSingleGig = createAsyncThunk(
  'gigs/fetchSingle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await gigAPI.fetchGig(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gig'
      );
    }
  }
);

export const createNewGig = createAsyncThunk(
  'gigs/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await gigAPI.createGig(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create gig'
      );
    }
  }
);

export const fetchUserGigs = createAsyncThunk(
  'gigs/fetchUserGigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gigAPI.fetchMyGigs();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your gigs'
      );
    }
  }
);

// Initial State
const initialState = {
  gigs: [],
  currentGig: null,
  userGigs: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  },
  searchQuery: ''
};

// Slice
const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    updateGigStatus: (state, action) => {
      const { gigId, status } = action.payload;
      // Update in gigs array
      const gigIndex = state.gigs.findIndex(g => g._id === gigId);
      if (gigIndex !== -1) {
        state.gigs[gigIndex].status = status;
      }
      // Update current gig if it matches
      if (state.currentGig?._id === gigId) {
        state.currentGig.status = status;
      }
      // Update in userGigs array
      const userGigIndex = state.userGigs.findIndex(g => g._id === gigId);
      if (userGigIndex !== -1) {
        state.userGigs[userGigIndex].status = status;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Gigs
      .addCase(fetchAllGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload.gigs;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          total: action.payload.total
        };
      })
      .addCase(fetchAllGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Gig
      .addCase(fetchSingleGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleGig.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGig = action.payload.gig;
      })
      .addCase(fetchSingleGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Gig
      .addCase(createNewGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewGig.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs.unshift(action.payload.gig);
        state.userGigs.unshift(action.payload.gig);
      })
      .addCase(createNewGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Gigs
      .addCase(fetchUserGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.userGigs = action.payload.gigs;
      })
      .addCase(fetchUserGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const { 
  clearError, 
  clearCurrentGig, 
  setSearchQuery,
  updateGigStatus 
} = gigSlice.actions;

// Selectors
export const selectAllGigs = (state) => state.gigs.gigs;
export const selectCurrentGig = (state) => state.gigs.currentGig;
export const selectUserGigs = (state) => state.gigs.userGigs;
export const selectGigsLoading = (state) => state.gigs.loading;
export const selectGigsError = (state) => state.gigs.error;
export const selectPagination = (state) => state.gigs.pagination;

export default gigSlice.reducer;
