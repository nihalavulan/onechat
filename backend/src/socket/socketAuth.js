/**
 * Socket Authentication Middleware
 * Authenticates Socket.IO connections using JWT
 */

const jwt = require('jsonwebtoken');

/**
 * Authenticate socket connection using JWT from handshake auth
 * @param {object} socket - Socket.IO socket instance
 * @param {function} next - Next middleware function
 */
const authenticateSocket = (socket, next) => {
  try {
    // Get token from handshake auth (sent from client)
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to socket
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;
    socket.userRole = decoded.role;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    return next(new Error('Authentication error: Authentication failed'));
  }
};

module.exports = authenticateSocket;

