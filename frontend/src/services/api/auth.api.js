/**
 * Authentication API
 * All authentication-related API calls
 */

import apiClient from './client';

/**
 * Sign up a new user
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} User data
 */
export const signup = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error('EMAIL_REQUIRED');
  }

  return apiClient.post('/auth/signup', {
    email,
    password,
  });
};

/**
 * Log in a user
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} { token, user }
 */
export const login = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new Error('EMAIL_REQUIRED');
  }

  return apiClient.post('/auth/login', {
    email,
    password,
  });
};

