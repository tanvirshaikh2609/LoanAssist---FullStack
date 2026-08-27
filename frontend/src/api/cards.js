import client from './client';

export const predictCard = async (data) => {
  const response = await client.post('/api/cards/predict/', data);
  return response.data;
};

export const getCardHistory = async () => {
  const response = await client.get('/api/cards/history/');
  return response.data;
};

export const getCardCatalog = async () => {
  const response = await client.get('/api/cards/catalog/');
  return response.data;
};
