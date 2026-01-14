// client/src/App.jsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import socket from './socket';
import { addNotification } from './store/slices/notificationsSlice';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GigList from './pages/GigList';
import GigDetail from './pages/GigDetail';
import PostGig from './pages/PostGig';
import Dashboard from './pages/Dashboard';

function App() {
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Setup Socket.io listeners and join user room when authenticated
  useEffect(() => {
    if (!socket) return;

    const onHired = (payload) => {
      // Normalize notification shape so it's consistent with server DB shape
      const notif = {
        _id: payload.id || payload._id || Date.now().toString(),
        type: 'hired',
        message: payload.message,
        data: { gigId: payload.gigId, bidId: payload.bidId },
        read: false,
        createdAt: new Date().toISOString()
      };
      dispatch(addNotification(notif));
    };

    socket.on('hired', onHired);

    const onAdminAssigned = (payload) => {
      const notif = {
        _id: payload.id || payload._id || Date.now().toString(),
        type: 'adminAssigned',
        message: payload.message,
        data: { gigId: payload.gigId },
        read: false,
        createdAt: new Date().toISOString()
      };
      dispatch(addNotification(notif));
    };

    socket.on('adminAssigned', onAdminAssigned);

    if (user && user._id) {
      socket.emit('join', user._id);
    }

    return () => {
      socket.off('hired', onHired);
      socket.off('adminAssigned', onAdminAssigned);
    };
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 
                        border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/gigs" element={<GigList />} />
          <Route path="/gigs/:id" element={<GigDetail />} />
          <Route 
            path="/post-gig" 
            element={
              <ProtectedRoute>
                <PostGig />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
