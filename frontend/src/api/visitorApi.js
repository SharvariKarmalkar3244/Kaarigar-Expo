import apiClient from "./client";

export const createVisitorProfile = async (data) => {
  const response = await apiClient.post(
    "/api/visitors/profile",
    data
  );

  return response.data;
};

export const getVisitorProfile = async () => {
  const response = await apiClient.get(
    "/api/visitors/profile"
  );

  return response.data;
};

export const registerForEvent = async (eventId) => {
  const response = await apiClient.post(
    "/api/visitors/registrations",
    {
      eventId,
    }
  );

  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await apiClient.get(
    "/api/visitors/registrations/my"
  );

  return response.data;
};

export const updateVisitorProfile = async (data) => {
  const response = await apiClient.put("/api/visitors/profile", data);
  return response.data;
};
