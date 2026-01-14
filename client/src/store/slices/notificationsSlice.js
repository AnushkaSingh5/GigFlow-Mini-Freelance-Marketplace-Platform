// client/src/store/slices/notificationsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    // payload should be the notification object from server (with _id)
    addNotification: (state, action) => {
      const p = action.payload;
      const existing = p.id ? state.find(n => String(n._id || n.id) === String(p.id)) : p._id ? state.find(n => String(n._id) === String(p._id)) : null;
      if (existing) return;
      state.unshift(p);
    },
    setNotifications: (state, action) => {
      return action.payload;
    },
    markRead: (state, action) => {
      const id = action.payload;
      return state.map(n => {
        if (String(n._id || n.id) === String(id)) return { ...n, read: true };
        return n;
      });
    },
    removeNotification: (state, action) => {
      return state.filter(n => (n._id || n.id) !== action.payload);
    },
    clearNotifications: () => []
  }
});

export const { addNotification, setNotifications, markRead, removeNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
