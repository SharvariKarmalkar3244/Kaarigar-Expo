import apiClient from "./client";

export const getGoogleOAuthUrl = (role) =>
  `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/oauth2/google/start${role ? `?role=${encodeURIComponent(role)}` : ""}`;

export const registerUser = async (data) => {
  const response = await apiClient.post("/api/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await apiClient.post("/api/auth/login", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/api/auth/me");
  return response.data;
};

export const verifyEmail = async (token) => (await apiClient.post("/api/auth/verify-email", { token })).data;
export const resendVerificationEmail = async () => (await apiClient.post("/api/auth/verification/resend")).data;
export const requestPasswordReset = async (email) => (await apiClient.post("/api/auth/password-reset/request", { email })).data;
export const resetPassword = async (token, password) => (await apiClient.post("/api/auth/password-reset/confirm", { token, password })).data;
