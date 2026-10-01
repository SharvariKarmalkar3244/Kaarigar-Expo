import axios from "axios";
import { showToast } from "../utils/toast";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.config?.skipGlobalErrorToast && (!error.response || error.response.status >= 500)) {
      showToast(error.response?.data?.message || "The service is temporarily unavailable. Please try again.", "error");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
