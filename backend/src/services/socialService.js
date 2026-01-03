/**
 * Social Service
 * Handles all database operations related to social posts and comments
 */

const { pool } = require('../config/db');

/**
 * Create a new post
 * @param {number} userId - ID of the user creating the post
 * @param {string|null} content - Post content (optional)
 * @param {string|null} imageUrl - Post image URL (optional)
 * @returns {Promise<object>} Created post object
 */
const createPost = async (userId, content, imageUrl) => {
  const query = `
    INSERT INTO posts (user_id, content, image_url)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, content, image_url, created_at
  `;

  const result = await pool.query(query, [userId, content || null, imageUrl || null]);
  return result.rows[0];
};

/**
 * Get posts with cursor-based pagination
 * @param {number} limit - Number of posts to fetch
 * @param {string|null} cursor - Cursor for pagination (created_at timestamp ISO string)
 * @returns {Promise<object>} { posts, hasMore, nextCursor }
 */
const getPosts = async (limit = 10, cursor = null) => {
  // Fetch limit + 1 to determine if there are more posts
  const fetchLimit = limit + 1;

  let query;
  let params;

  if (cursor) {
    // Cursor is a timestamp (ISO string)
    // Use created_at and id for stable pagination when timestamps are identical
    query = `
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as author_id,
        u.email as author_email
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      WHERE p.created_at < $1
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $2
    `;
    params = [cursor, fetchLimit];
  } else {
    // No cursor - get first page
    query = `
      SELECT 
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as author_id,
        u.email as author_email
      FROM posts p
      INNER JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $1
    `;
    params = [fetchLimit];
  }

  const result = await pool.query(query, params);
  const posts = result.rows;

  // Determine if there are more posts
  const hasMore = posts.length > limit;

  // Return only the requested limit
  const returnedPosts = hasMore ? posts.slice(0, limit) : posts;

  // Get post IDs to fetch comments
  const postIds = returnedPosts.map((post) => post.id);

  // Fetch comments for all posts
  let commentsMap = {};
  if (postIds.length > 0) {
    const commentsQuery = `
      SELECT 
        c.id,
        c.post_id,
        c.content,
        c.created_at,
        u.id as author_id,
        u.email as author_email
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ANY($1::int[])
      ORDER BY c.created_at ASC
    `;
    const commentsResult = await pool.query(commentsQuery, [postIds]);
    
    // Group comments by post_id
    commentsResult.rows.forEach((comment) => {
      if (!commentsMap[comment.post_id]) {
        commentsMap[comment.post_id] = [];
      }
      commentsMap[comment.post_id].push({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: comment.author_id,
          email: comment.author_email,
        },
      });
    });
  }

  // Format posts with comments
  const formattedPosts = returnedPosts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.image_url,
    createdAt: post.created_at,
    author: {
      id: post.author_id,
      email: post.author_email,
    },
    comments: commentsMap[post.id] || [],
  }));

  return {
    posts: formattedPosts,
    hasMore,
    nextCursor: hasMore && returnedPosts.length > 0
      ? returnedPosts[returnedPosts.length - 1].created_at.toISOString()
      : null,
  };
};

/**
 * Get post by ID
 * @param {number} postId - Post ID
 * @returns {Promise<object|null>} Post object or null if not found
 */
const getPostById = async (postId) => {
  const query = `
    SELECT 
      p.id,
      p.user_id,
      p.content,
      p.image_url,
      p.created_at,
      u.id as author_id,
      u.email as author_email
    FROM posts p
    INNER JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
  `;

  const result = await pool.query(query, [postId]);
  return result.rows[0] || null;
};

/**
 * Create a comment on a post
 * @param {number} postId - ID of the post
 * @param {number} userId - ID of the user creating the comment
 * @param {string} content - Comment content
 * @returns {Promise<object>} Created comment object
 */
const createComment = async (postId, userId, content) => {
  const query = `
    INSERT INTO comments (post_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, post_id, user_id, content, created_at
  `;

  const result = await pool.query(query, [postId, userId, content]);
  return result.rows[0];
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  createComment,
};

