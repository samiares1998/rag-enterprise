import { useRequest } from './useRequest';

const API_CONFIG = {
  baseURL: 'http://localhost:8000/api/v1/rag',
  defaultHeaders: {
    'Accept': 'application/json',
  },
  timeout: 15000,
};

export const useApiChat = () => {
  return useRequest(API_CONFIG);
};