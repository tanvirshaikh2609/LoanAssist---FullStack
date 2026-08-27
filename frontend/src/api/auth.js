import client from './client';

export const register = async (userData) => {
  const response = await client.post('/api/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await client.post('/api/auth/login/', credentials);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await client.post('/api/token/refresh/', { refresh });
  return response.data;
};

export const getProfile = async () => {
  const response = await client.get('/api/auth/profile/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await client.patch('/api/auth/profile/', profileData);
  return response.data;
};
