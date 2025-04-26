// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api', // Suponiendo que usas un proxy para apuntar a http://localhost:8080/api
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;
