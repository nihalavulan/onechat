/**
 * Chat API
 * REST API calls for chat functionality
 */

import apiClient from './client';

/**
 * Get all users except logged-in user, ordered by last message
 * @returns {Promise<object>} { users: Array }
 */
export const getUsers = async () => {
  return apiClient.get('/users');
};

/**
 * Get chat history between logged-in user and another user
 * @param {number} userId - Other user's ID
 * @returns {Promise<object>} { userId, messages: Array }
 */
export const getChatHistory = async (userId) => {
  return apiClient.get(`/chats/${userId}`);
};

