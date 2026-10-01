import apiClient from "./client";

export const getEvents = async (params = {}) => {
  const response = await apiClient.get("/api/events", { params });
  return response.data;
};

export const getEventAnalytics = async () => (await apiClient.get("/api/events/admin/analytics")).data;
export const getAuditLog = async (page = 0) => (await apiClient.get("/api/events/admin/audit", { params: { page, size: 10 } })).data;

export const getUpcomingEvents = async () => {
  const response = await apiClient.get("/api/events/upcoming");
  return response.data;
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.data;
};

export const createEvent = async (data) => {
  const response = await apiClient.post("/api/events", data);
  return response.data;
};

export const updateEvent = async (id, data) => {
  const response = await apiClient.put(`/api/events/${id}`, data);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await apiClient.delete(`/api/events/${id}`);
  return response.data;
};

export const getEventParticipants = async (eventId) => {
  const response = await apiClient.get(`/api/events/${eventId}/participants`);
  return response.data;
};

export const getEventRegistrations = async (eventId) => {
  const response = await apiClient.get(`/api/events/${eventId}/registrations`);
  return response.data;
};

export const verifyEntryTicket = async (ticketCode, eventId) => {
  const response = await apiClient.post("/api/events/tickets/verify", { ticketCode, eventId: Number(eventId) });
  return response.data;
};

export const getEventTickets = async (eventId) => {
  const response = await apiClient.get(`/api/events/${eventId}/tickets`);
  return response.data;
};


