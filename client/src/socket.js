// client/src/socket.js
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : (import.meta.env.VITE_API_WS_URL || 'http://localhost:5000');

export const socket = io(API_BASE, {
  withCredentials: true
});

export default socket;
