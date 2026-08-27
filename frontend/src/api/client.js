import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000' : '');

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('loanassist_access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops on refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/token/refresh/') {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('loanassist_refresh');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}/api/token/refresh/`, { refresh: refreshToken });
          const { access } = response.data;
          
          localStorage.setItem('loanassist_access', access);
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          
          return client(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and let the auth store/app handle redirect
          localStorage.removeItem('loanassist_access');
          localStorage.removeItem('loanassist_refresh');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('loanassist_access');
        localStorage.removeItem('loanassist_refresh');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
