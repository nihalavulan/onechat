/**
 * Social Routes
 * REST API routes for social posts and comments
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createPost, getPosts, createComment } = require('../controllers/socialController');

// GET /social/posts - Get posts (public, no auth required)
router.get('/posts', getPosts);

// POST /social/posts - Create post (requires authentication)
router.post('/posts', authMiddleware, createPost);

// POST /social/posts/:postId/comments - Create comment (requires authentication)
router.post('/posts/:postId/comments', authMiddleware, createComment);

module.exports = router;

