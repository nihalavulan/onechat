'use client'

import { useState, useEffect } from 'react'
import useAuthStore from '../../../store/useAuthStore'
import useSocialStore from '../../../store/useSocialStore'
import notify from '../../../src/utils/notifications'

export default function CreatePost() {
  const { isAuthenticated } = useAuthStore()
  const { createPost, loading } = useSocialStore()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render if not authenticated (only after mount to prevent hydration error)
  if (!mounted || !isAuthenticated) {
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      notify.error('Post content cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      await createPost({ content: content.trim() })
      setContent('')
      notify.success('Post created successfully')
    } catch (error) {
      notify.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-4 mb-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          disabled={isSubmitting || loading}
          rows={3}
          className="w-full px-4 py-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading || !content.trim()}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              isSubmitting || loading || !content.trim()
                ? 'bg-background-dark text-text-muted cursor-not-allowed opacity-60'
                : 'bg-primary text-text-inverse hover:opacity-90'
            }`}
          >
            {isSubmitting || loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}

