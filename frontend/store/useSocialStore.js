import { create } from 'zustand'
import * as socialApi from '../src/services/api/social.api'
import useAuthStore from './useAuthStore'

const useSocialStore = create((set, get) => {
  return {
    // Social state
    posts: [],
    loading: false,
    loadingMore: false,
    hasMore: true,
    nextCursor: null,
    error: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Load posts (initial load)
    loadPosts: async (limit = 10) => {
      set({ loading: true, error: null });
      try {
        const response = await socialApi.getPosts(limit, null);
        
        set({
          posts: response.posts || [],
          hasMore: response.hasMore || false,
          nextCursor: response.nextCursor || null,
          loading: false,
          error: null,
        });

        return response.posts || [];
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Failed to load posts';
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    // Load more posts (infinite scroll)
    loadMorePosts: async (limit = 10) => {
      const state = get();
      if (state.loadingMore || !state.hasMore || !state.nextCursor) {
        return;
      }

      set({ loadingMore: true, error: null });
      try {
        const response = await socialApi.getPosts(limit, state.nextCursor);
        
        set({
          posts: [...state.posts, ...(response.posts || [])],
          hasMore: response.hasMore || false,
          nextCursor: response.nextCursor || null,
          loadingMore: false,
          error: null,
        });

        return response.posts || [];
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Failed to load more posts';
        set({
          loadingMore: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    // Create a new post
    createPost: async (postData) => {
      set({ loading: true, error: null });
      try {
        const response = await socialApi.createPost(postData);
        const authState = useAuthStore.getState();
        
        // Format post with author info (backend doesn't return author in create response)
        const formattedPost = {
          id: response.id,
          content: response.content,
          imageUrl: response.imageUrl,
          createdAt: response.createdAt,
          author: {
            id: authState.user?.id,
            email: authState.user?.email,
          },
        };
        
        // Prepend new post to the list
        set((state) => ({
          posts: [formattedPost, ...state.posts],
          loading: false,
          error: null,
        }));

        return formattedPost;
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Failed to create post';
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    // Create a comment on a post
    createComment: async (postId, content) => {
      set({ loading: true, error: null });
      try {
        const response = await socialApi.createComment(postId, content);
        const authState = useAuthStore.getState();
        
        // Format comment with author info (backend doesn't return author in create response)
        const formattedComment = {
          id: response.id,
          content: response.content,
          createdAt: response.createdAt || new Date().toISOString(),
          author: {
            id: authState.user?.id,
            email: authState.user?.email,
          },
        };
        
        // Add comment to the post's comments array
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [...(post.comments || []), formattedComment],
                }
              : post
          ),
          loading: false,
          error: null,
        }));

        return formattedComment;
      } catch (error) {
        // Preserve the full error object for better error handling
        // This includes error.data which contains { error: "Comment rejected", reason: "..." }
        const errorData = error.data || {};
        const errorMessage = errorData.error || error.message || 'Failed to create comment';
        
        // Create error object with reason if available (for moderation rejections)
        const errorToThrow = errorData.reason 
          ? { ...error, data: { ...errorData, message: `${errorMessage}: ${errorData.reason}` } }
          : error;
        
        set({
          loading: false,
          error: errorData.reason ? `${errorMessage}: ${errorData.reason}` : errorMessage,
        });
        throw errorToThrow;
      }
    },

    // Reset social state
    reset: () => set({
      posts: [],
      loading: false,
      loadingMore: false,
      hasMore: true,
      nextCursor: null,
      error: null,
    }),
  };
})

export default useSocialStore

