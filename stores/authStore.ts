import { create } from 'zustand';
import { apiService } from '@/services/api';
import Cookie from 'js-cookie';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  healthInsurance?: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  register: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getUserProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isInitialized: false,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.register(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Registration failed',
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(email, password);
      
      let userData = response;
      if (!userData || !userData.id || !userData.email) {
        const profileRes = await apiService.getUserProfile();
        userData = profileRes.data;
      }

      set({
        isLoading: false,
        user: userData,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Login failed',
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiService.logout();
      set({
        isLoading: false,
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = Cookie.get('accessToken');
    if (token) {
      try {
        const response = await apiService.getUserProfile();
        set({ 
          user: response.data, 
          isAuthenticated: true, 
          isInitialized: true, 
          isLoading: false 
        });
      } catch (error) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isInitialized: true, 
          isLoading: false 
        });
        Cookie.remove('accessToken');
        Cookie.remove('refreshToken');
      }
    } else {
      set({ 
        isAuthenticated: false, 
        user: null, 
        isInitialized: true, 
        isLoading: false 
      });
    }
  },

  getUserProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await apiService.getUserProfile();
      set({ user: response.data, isLoading: false, isAuthenticated: true });
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      Cookie.remove('accessToken');
      Cookie.remove('refreshToken');
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
