/**
 * Socket.IO Client Instance
 * Manages socket connection with JWT authentication
 */

import { io } from 'socket.io-client';
import { getToken } from '../api/client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let socketInstance = null;

/**
 * Create and configure socket instance
 * @param {string} token - JWT token for authentication
 * @returns {object} Socket.IO client instance
 */
export const createSocket = (token) => {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // Disconnect existing socket if any
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socketInstance;
};

/**
 * Get current socket instance
 * @returns {object|null} Socket instance or null
 */
export const getSocket = () => {
  return socketInstance;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is connected
 * @returns {boolean} True if connected
 */
export const isSocketConnected = () => {
  return socketInstance?.connected || false;
};

/**
 * Initialize socket with token from localStorage
 * @returns {object|null} Socket instance or null
 */
export const initializeSocket = () => {
  const token = getToken();
  if (!token) {
    return null;
  }
  return createSocket(token);
};

