/**
 * Socket Handlers
 * Handles all Socket.IO event handlers
 */

const chatService = require('../services/chatService');

// In-memory map of userId -> socketId
const userSocketMap = new Map();

/**
 * Initialize socket handlers
 * @param {object} io - Socket.IO server instance
 */
const initializeSocketHandlers = (io) => {
  io.use(require('./socketAuth'));

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Store socket connection
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} connected. Socket ID: ${socket.id}`);

    /**
     * Handle send_message event
     */
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;

        // Validate input
        if (!receiverId || !content) {
          socket.emit('error', { message: 'Receiver ID and content are required' });
          return;
        }

        if (typeof receiverId !== 'number') {
          socket.emit('error', { message: 'Invalid receiver ID' });
          return;
        }

        if (typeof content !== 'string' || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        // Verify receiver exists
        const receiver = await chatService.getUserById(receiverId);
        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        // Save message to database
        const message = await chatService.saveMessage(userId, receiverId, content.trim());

        // Prepare message object for emission
        const messageData = {
          id: message.id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.content,
          createdAt: message.created_at,
        };

        // Emit to sender (confirmation)
        socket.emit('message_sent', messageData);

        // Emit to receiver if online
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', messageData);
        }
      } catch (error) {
        console.error('Error handling send_message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      userSocketMap.delete(userId);
      console.log(`User ${userId} disconnected. Socket ID: ${socket.id}`);
    });
  });
};

/**
 * Get socket ID for a user
 * @param {number} userId - User ID
 * @returns {string|null} Socket ID or null if user is offline
 */
const getSocketId = (userId) => {
  return userSocketMap.get(userId) || null;
};

/**
 * Check if user is online
 * @param {number} userId - User ID
 * @returns {boolean} True if user is online
 */
const isUserOnline = (userId) => {
  return userSocketMap.has(userId);
};

module.exports = {
  initializeSocketHandlers,
  getSocketId,
  isUserOnline,
};

