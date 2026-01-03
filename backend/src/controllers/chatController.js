/**
 * Chat Controller
 * Handles HTTP requests for chat-related endpoints
 */

const chatService = require('../services/chatService');

/**
 * Get all users except logged-in user, ordered by last message
 * GET /users
 */
const getUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const users = await chatService.getUsersWithLastMessage(loggedInUserId);

    // Format response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      lastMessageAt: user.last_message_at,
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get chat history between logged-in user and another user
 * GET /chats/:userId
 */
const getChatHistory = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;
    const otherUserId = parseInt(req.params.userId, 10);

    // Validate userId parameter
    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Prevent users from accessing their own chat
    if (loggedInUserId === otherUserId) {
      return res.status(400).json({ error: 'Cannot access chat with yourself' });
    }

    // Verify other user exists
    const otherUser = await chatService.getUserById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get chat history
    const messages = await chatService.getChatHistory(loggedInUserId, otherUserId);

    // Format response
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      senderId: message.sender_id,
      receiverId: message.receiver_id,
      content: message.content,
      createdAt: message.created_at,
    }));

    res.json({
      userId: otherUserId,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getChatHistory,
};

