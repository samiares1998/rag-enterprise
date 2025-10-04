import { useRequest } from './useRequest';

const API_CONFIG = {
  baseURL: 'http://localhost:8000/api/v1/new_ingestion',
  defaultHeaders: {
    'Accept': 'application/json',
  },
  timeout: 15000,
};

export const useApi = () => {
  return useRequest(API_CONFIG);
};