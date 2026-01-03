'use client'

import { useEffect, useRef } from 'react'
import useAuthStore from '../../store/useAuthStore'
import useSocialStore from '../../store/useSocialStore'
import CreatePost from './components/CreatePost'
import PostCard from './components/PostCard'
import notify from '../../src/utils/notifications'

export default function SocialPage() {
  const { user, initializeAuth } = useAuthStore()
  const { posts, loading, loadingMore, hasMore, loadPosts, loadMorePosts } = useSocialStore()
  const observerTarget = useRef(null)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    loadPosts(10).catch((error) => {
      // Don't show "no token provided" errors for public endpoints
      const errorMessage = error?.message || error?.data?.error || String(error);
      if (errorMessage.toLowerCase().includes('no token provided')) {
        // This is a public endpoint, so this error shouldn't occur
        // Log it but don't show to user
        console.warn('Unexpected auth error on public endpoint:', errorMessage);
        return;
      }
      notify.error(error);
    });
  }, [loadPosts])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMorePosts(10).catch((error) => {
            notify.error(error)
          })
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loadingMore, loading, loadMorePosts])

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-6">Social Feed</h1>

        {/* Create Post (only for authenticated users) */}
        <CreatePost />

        {/* Posts Feed */}
        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface rounded-lg border border-border p-4 animate-pulse">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-background-dark mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-background-dark rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-background-dark rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-20 bg-background-dark rounded"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-surface rounded-lg border border-border p-8 text-center">
            <p className="text-text-secondary">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="py-4">
                {loadingMore && (
                  <div className="text-center text-text-secondary">
                    <p>Loading more posts...</p>
                  </div>
                )}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-4">
                <p className="text-text-muted text-sm">No more posts to load</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


