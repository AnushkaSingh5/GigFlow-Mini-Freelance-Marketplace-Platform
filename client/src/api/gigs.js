// client/src/api/gigs.js
import api from './axios';

export const fetchGigs = (params) => api.get('/gigs', { params });
export const fetchGig = (id) => api.get(`/gigs/${id}`);
export const createGig = (data) => api.post('/gigs', data);
export const fetchMyGigs = () => api.get('/gigs/my-gigs');
export const addAdmin = (gigId, data) => api.post(`/gigs/${gigId}/admins`, data);
export const removeAdmin = (gigId, userId) => api.delete(`/gigs/${gigId}/admins/${userId}`);
