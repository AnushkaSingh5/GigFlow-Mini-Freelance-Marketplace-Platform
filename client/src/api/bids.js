// client/src/api/bids.js
import api from './axios';

export const submitBid = (data) => api.post('/bids', data);
export const fetchBidsForGig = (gigId) => api.get(`/bids/${gigId}`);
export const hireBid = (bidId) => api.patch(`/bids/${bidId}/hire`);
export const fetchMyBids = () => api.get('/bids/my-bids');
