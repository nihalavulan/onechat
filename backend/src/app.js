const express = require('express');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', require('./routes/health'));
app.use('/auth', require('./routes/auth'));

module.exports = app;

