/**
 * Chat Routes
 * REST API routes for chat functionality
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUsers, getChatHistory } = require('../controllers/chatController');

// GET /users - Get all users except logged-in user, ordered by last message
router.get('/users', authMiddleware, getUsers);

// GET /chats/:userId - Get chat history between logged-in user and userId
router.get('/chats/:userId', authMiddleware, getChatHistory);

module.exports = router;

