import { create } from 'zustand'
import * as authApi from '../src/services/api/auth.api'
import { setToken, getToken } from '../src/services/api/client'
import {
  createSocket,
  getSocket,
  disconnectSocket as disconnectSocketService,
  isSocketConnected,
} from '../src/services/socket'

const useAuthStore = create((set, get) => {
  // Initialize auth state from localStorage on store creation
  const initializeAuth = () => {
    const token = getToken();
    if (token) {
      // Decode JWT to get user info (basic decode, no verification)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          token,
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role || 'user',
          },
          isAuthenticated: true,
        };
      } catch (e) {
        // Invalid token, clear it
        setToken(null);
        return {
          token: null,
          user: null,
          isAuthenticated: false,
        };
      }
    }
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  };

  const initialState = {
    // UI state
    loading: false,
    error: null,
    ...initializeAuth(),
  };

  return {
    ...initialState,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Auth actions
    login: async (credentials) => {
      set({ loading: true, error: null });
      try {
        const response = await authApi.login(credentials);
        
        // Extract token and user from response
        // Backend returns: { message, token, user: { id, email } }
        const token = response.token;
        const user = response.user || {
          id: response.user?.id,
          email: response.user?.email || response.email,
          role: 'user', // Default role, can be extracted from JWT if needed
        };

        // Store token in localStorage
        setToken(token);

        // Update store
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        return { success: true, user };
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Login failed';
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    signup: async (credentials) => {
      set({ loading: true, error: null });
      try {
        // First, create the account
        const signupResponse = await authApi.signup(credentials);
        
        // After successful signup, automatically log in
        const loginResponse = await authApi.login(credentials);
        
        // Extract token and user from login response
        const token = loginResponse.token;
        const user = loginResponse.user || {
          id: loginResponse.user?.id,
          email: loginResponse.user?.email || loginResponse.email,
          role: 'user',
        };

        // Store token in localStorage
        setToken(token);

        // Update store
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        return { success: true, user, token };
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Signup failed';
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    logout: () => {
      setToken(null);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    },

    // Initialize auth state from localStorage
    initializeAuth: () => {
      const authState = initializeAuth();
      set(authState);
    },

    reset: () => set({ loading: false, error: null }),
  };
})

export default useAuthStore

