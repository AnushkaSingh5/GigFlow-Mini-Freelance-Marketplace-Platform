// client/src/api/notifications.js
import api from './axios';

export const fetchNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
