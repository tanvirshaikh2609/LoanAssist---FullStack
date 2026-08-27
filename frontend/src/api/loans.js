import client from './client';

export const predictLoan = async (data) => {
  const response = await client.post('/api/loans/predict/', data);
  return response.data;
};

export const getLoanHistory = async () => {
  const response = await client.get('/api/loans/history/');
  return response.data;
};
