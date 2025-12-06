import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { AuthState, User, LoginCredentials, RegisterData, ApiResponse } from '@/types';

// Load initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    };
  }

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        credentials
      );
      
      // Check if response structure is correct
      if (!response.data || !response.data.success) {
        console.error('Invalid response structure:', response.data);
        return rejectWithValue(
          response.data?.message || 'Invalid response from server'
        );
      }

      const { user, token } = response.data.data!;
      
      if (!user || !token) {
        console.error('Missing user or token in response:', response.data);
        return rejectWithValue('Invalid response data from server');
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, token };
    } catch (error: any) {
      // Enhanced error logging
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });

      // Handle different error types
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return rejectWithValue(
          'Cannot connect to server. Please check your internet connection and ensure the backend is running.'
        );
      }

      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error ||
                           `Server error (${error.response.status})`;
        return rejectWithValue(errorMessage);
      }

      // Request was made but no response
      return rejectWithValue(
        error.message || 'Login failed. Please try again.'
      );
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/register',
        userData
      );
      const { user, token } = response.data.data!;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      return response.data.data!.user;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user data'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
