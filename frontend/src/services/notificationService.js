import API from "./api";

export const getNotifications = async () => {
  const { data } = await API.get(`/notifications`);
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await API.put(`/notifications/${id}/read`);
  return data;
};

export const clearNotifications = async () => {
  const { data } = await API.delete(`/notifications`);
  return data;
};

export default {
  getNotifications,
  markNotificationAsRead,
  clearNotifications,
};
