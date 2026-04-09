import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";

const BASE = "http://127.0.0.1:8000/api";
const REFRESH_ENDPOINT = "/token/refresh/";

const getAccessToken = () => localStorage.getItem("token");
const getRefreshToken = () => localStorage.getItem("refreshToken");
const setAccessToken = (token: string) => localStorage.setItem("token", token);
const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isAdmin");
  localStorage.removeItem("phone");
};

export const API = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const PublicAPI = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!config.headers) {
    config.headers = {} as AxiosRequestHeaders;
  }

  const token = getAccessToken();
  if (token) {
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
    console.debug("✓ Token attached to request:", config.url);
  } else {
    console.warn("⚠ No token found in localStorage for:", config.url);
  }

  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const refreshToken = getRefreshToken();

    if (status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          if (token && originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token as string}`;
          }
          return API(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await PublicAPI.post(REFRESH_ENDPOINT, { refresh: refreshToken });
        const newToken = refreshResponse.data.access;
        setAccessToken(newToken);
        processQueue(null, newToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }

        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthStorage();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
