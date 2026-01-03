/**
 * Social Controller
 * Handles HTTP requests for social posts and comments
 */

const socialService = require('../services/socialService');
const { moderateComment } = require('../services/moderation');

/**
 * Create a new post
 * POST /social/posts
 */
const createPost = async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const userId = req.user.userId;

    // Validate that at least one field is present
    if (!content && !image_url) {
      return res.status(400).json({
        error: 'Post must have either content or image_url',
      });
    }

    // Validate content if provided
    if (content && typeof content !== 'string') {
      return res.status(400).json({ error: 'Content must be a string' });
    }

    // Validate image_url if provided
    if (image_url && typeof image_url !== 'string') {
      return res.status(400).json({ error: 'Image URL must be a string' });
    }

    // Create post
    const post = await socialService.createPost(userId, content || null, image_url || null);

    // Format response
    res.status(201).json({
      id: post.id,
      content: post.content,
      imageUrl: post.image_url,
      createdAt: post.created_at,
      userId: post.user_id,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get posts with pagination
 * GET /social/posts
 */
const getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const cursor = req.query.cursor || null;

    // Validate limit
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Limit must be between 1 and 100' });
    }

    const result = await socialService.getPosts(limit, cursor);

    res.json({
      posts: result.posts,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a comment on a post
 * POST /social/posts/:postId/comments
 */
const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { postId } = req.params;
    const userId = req.user.userId;

    // Validate postId
    const postIdNum = parseInt(postId, 10);
    if (isNaN(postIdNum)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required and cannot be empty' });
    }

    // Verify post exists
    const post = await socialService.getPostById(postIdNum);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Moderate comment using AI
    const trimmedContent = content.trim();
    const moderationResult = await moderateComment(trimmedContent);

    // If comment is not allowed, reject it
    if (!moderationResult.allowed) {
      return res.status(400).json({
        error: 'Comment rejected',
        reason: moderationResult.reason,
      });
    }

    // Create comment (only if moderation passed)
    const comment = await socialService.createComment(postIdNum, userId, trimmedContent);

    // Format response
    res.status(201).json({
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      content: comment.content,
      createdAt: comment.created_at,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPost,
  getPosts,
  createComment,
};

