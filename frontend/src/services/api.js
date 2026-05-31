import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeContract = async (address) => {
  const response = await api.post('/analyze', {
    contractAddress: address,
  });
  return response.data;
};

export default api;
