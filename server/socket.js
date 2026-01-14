// server/socket.js
let io = null;

exports.init = (server, options = {}) => {
  const { Server } = require('socket.io');
  if (!process.env.CLIENT_URL) {
    throw new Error("CLIENT_URL is not defined in environment variables");
  }
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    },
    ...options
  });

  io.on('connection', (socket) => {
    // Join a room scoped to the user id
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // You could handle cleanup here if needed
    });
  });

  return io;
};

exports.getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
