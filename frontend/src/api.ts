import axios from "axios";

const BASE = "http://127.0.0.1:8000/api";

// Authenticated API — attaches JWT token to every request
export const API = axios.create({ baseURL: BASE });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public API — no token attached (for login and register)
export const PublicAPI = axios.create({ baseURL: BASE });
