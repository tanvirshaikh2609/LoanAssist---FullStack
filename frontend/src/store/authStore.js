import { create } from 'zustand';
import { login as apiLogin, register as apiRegister, getProfile } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('loanassist_access') || null,
  refreshToken: localStorage.getItem('loanassist_refresh') || null,
  isLoading: false,
  isInitializing: true,
  error: null,

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await apiRegister(userData);
      // After successful registration, automatically log in
      const credentials = {
        username: userData.username,
        password: userData.password
      };
      const loginResponse = await apiLogin(credentials);
      
      const { access, refresh, user } = loginResponse;
      localStorage.setItem('loanassist_access', access);
      localStorage.setItem('loanassist_refresh', refresh);
      
      set({
        accessToken: access,
        refreshToken: refresh,
        user,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiLogin(credentials);
      const { access, refresh, user } = response;
      
      localStorage.setItem('loanassist_access', access);
      localStorage.setItem('loanassist_refresh', refresh);
      
      set({
        accessToken: access,
        refreshToken: refresh,
        user,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.detail || 'Login failed' 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('loanassist_access');
    localStorage.removeItem('loanassist_refresh');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null
    });
  },

  fetchProfile: async () => {
    try {
      const profile = await getProfile();
      set({ user: profile });
    } catch (error) {
      console.error('Failed to fetch profile', error);
      get().logout();
    }
  },

  initialize: async () => {
    const { accessToken, fetchProfile } = get();
    if (accessToken) {
      await fetchProfile();
    }
    set({ isInitializing: false });
  }
}));

export default useAuthStore;
