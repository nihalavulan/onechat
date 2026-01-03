/**
 * Chat Routes
 * REST API routes for chat functionality
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUsers, getChatHistory } = require('../controllers/chatController');

// All chat routes require authentication
router.use(authMiddleware);

// GET /users - Get all users except logged-in user, ordered by last message
router.get('/users', getUsers);

// GET /chats/:userId - Get chat history between logged-in user and userId
router.get('/chats/:userId', getChatHistory);

module.exports = router;

