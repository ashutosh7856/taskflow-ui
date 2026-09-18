import axios from "axios";
import { useAuthStore } from "../store/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const state = useAuthStore.getState();
    if (
      error.response?.status !== 401 ||
      request?._retry ||
      !state.refreshToken
    ) {
      return Promise.reject(error);
    }

    request._retry = true;
    refreshPromise ??= api
      .post("/auth/refresh", { refreshToken: state.refreshToken })
      .then(({ data }) => {
        state.setTokens(data.accessToken, data.refreshToken);
        return data.accessToken as string;
      })
      .catch((refreshError) => {
        state.logout();
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    request.headers.Authorization = `Bearer ${await refreshPromise}`;
    return api(request);
  },
);

export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message;
  }
  return "Something went wrong";
}
