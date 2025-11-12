// src/api/axiosClient.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 900000, // 15 min
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // clave plana 'token'
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
