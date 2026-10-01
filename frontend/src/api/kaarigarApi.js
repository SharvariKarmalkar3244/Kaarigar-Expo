import apiClient from "./client";

export const createProfile = async (data) => {
  const response = await apiClient.post(
    "/api/kaarigars/profile",
    data
  );

  return response.data;
};

export const getMyProfile = async () => {
  const response = await apiClient.get(
    "/api/kaarigars/profile"
  );

  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiClient.put(
    "/api/kaarigars/profile",
    data
  );

  return response.data;
};

export const getAllKaarigars = async (params = {}) => {
  const response = await apiClient.get(
    "/api/kaarigars",
    { params }
  );

  return response.data;
};

export const applyForEvent = async (data) => {
  const response = await apiClient.post(
    "/api/kaarigars/applications",
    data
  );

  return response.data;
};

export const getMyApplications = async () => {
  const response = await apiClient.get(
    "/api/kaarigars/applications/my"
  );

  return response.data;
};

export const getPendingApplications = async (params = {}) => {
  const response = await apiClient.get(
    "/api/admin/applications/pending",
    { params }
  );

  return response.data;
};

export const reviewApplication = async (
  id,
  data
) => {
  const response = await apiClient.put(
    `/api/admin/applications/${id}/review`,
    data
  );

  return response.data;
};
