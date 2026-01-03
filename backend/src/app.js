const express = require('express');
const cors = require('cors');

const app = express();

// CORS middleware - must be before routes
app.use(
  cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', require('./routes/health'));
app.use('/auth', require('./routes/auth'));
app.use('/social', require('./routes/social')); // Social routes: /posts, /posts/:postId/comments (must be before /)
app.use('/', require('./routes/chat')); // Chat routes: /users, /chats/:userId

module.exports = app;

