import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // 30 s — si una op tarda más, es problema del backend
});

api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
