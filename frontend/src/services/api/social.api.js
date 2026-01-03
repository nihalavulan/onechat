/**
 * Social API
 * REST API calls for social posts and comments
 */

import apiClient from './client';

/**
 * Get posts with pagination
 * @param {number} limit - Number of posts to fetch
 * @param {string|null} cursor - Cursor for pagination
 * @returns {Promise<object>} { posts, hasMore, nextCursor }
 */
export const getPosts = async (limit = 10, cursor = null) => {
  let endpoint = `/social/posts?limit=${limit}`;
  if (cursor) {
    endpoint += `&cursor=${encodeURIComponent(cursor)}`;
  }
  
  return apiClient.get(endpoint);
};

/**
 * Create a new post
 * @param {object} postData - { content?: string, image_url?: string }
 * @returns {Promise<object>} Created post
 */
export const createPost = async (postData) => {
  return apiClient.post('/social/posts', postData);
};

/**
 * Create a comment on a post
 * @param {number} postId - Post ID
 * @param {string} content - Comment content
 * @returns {Promise<object>} Created comment
 */
export const createComment = async (postId, content) => {
  return apiClient.post(`/social/posts/${postId}/comments`, { content });
};

