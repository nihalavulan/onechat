/**
 * Chat Service
 * Handles all database operations related to chat functionality
 */

const { pool } = require('../config/db');

/**
 * Get all users except the logged-in user, ordered by last message timestamp
 * @param {number} loggedInUserId - ID of the logged-in user
 * @returns {Promise<Array>} Array of users with last message info
 */
const getUsersWithLastMessage = async (loggedInUserId) => {
  const query = `
    SELECT 
      u.id,
      u.email,
      u.created_at,
      MAX(m.created_at) as last_message_at
    FROM users u
    LEFT JOIN messages m ON (
      (m.sender_id = $1 AND m.receiver_id = u.id) OR
      (m.sender_id = u.id AND m.receiver_id = $1)
    )
    WHERE u.id != $1
    GROUP BY u.id, u.email, u.created_at
    ORDER BY 
      MAX(m.created_at) DESC NULLS LAST,
      u.created_at DESC
  `;

  const result = await pool.query(query, [loggedInUserId]);
  return result.rows;
};

/**
 * Get chat history between two users
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {Promise<Array>} Array of messages
 */
const getChatHistory = async (userId1, userId2) => {
  const query = `
    SELECT 
      id,
      sender_id,
      receiver_id,
      content,
      created_at
    FROM messages
    WHERE 
      (sender_id = $1 AND receiver_id = $2) OR
      (sender_id = $2 AND receiver_id = $1)
    ORDER BY created_at ASC
  `;

  const result = await pool.query(query, [userId1, userId2]);
  return result.rows;
};

/**
 * Save a message to the database
 * @param {number} senderId - ID of the sender
 * @param {number} receiverId - ID of the receiver
 * @param {string} content - Message content
 * @returns {Promise<object>} Created message object
 */
const saveMessage = async (senderId, receiverId, content) => {
  const query = `
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, sender_id, receiver_id, content, created_at
  `;

  const result = await pool.query(query, [senderId, receiverId, content]);
  return result.rows[0];
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<object|null>} User object or null
 */
const getUserById = async (userId) => {
  const query = 'SELECT id, email, created_at FROM users WHERE id = $1';
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
};

module.exports = {
  getUsersWithLastMessage,
  getChatHistory,
  saveMessage,
  getUserById,
};

