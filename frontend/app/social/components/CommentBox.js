'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import useAuthStore from '../../../store/useAuthStore'
import useSocialStore from '../../../store/useSocialStore'
import notify from '../../../src/utils/notifications'

export default function CommentBox({ postId }) {
  const { isAuthenticated } = useAuthStore()
  const { createComment, loading } = useSocialStore()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show login prompt for guests (only after mount to prevent hydration error)
  if (!mounted) {
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-sm text-text-secondary text-center">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Login to comment
          </Link>
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      notify.error('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      await createComment(postId, content.trim())
      setContent('')
      notify.success('Comment added successfully')
    } catch (error) {
      // Handle moderation rejection with specific message
      if (error?.data?.error === 'Comment rejected' && error?.data?.reason) {
        notify.error(`Comment rejected: ${error.data.reason}`)
      } else {
        notify.error(error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          disabled={isSubmitting || loading}
          className="w-full px-4 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary text-sm"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || loading || !content.trim()}
            className={`px-4 py-1.5 rounded-md font-medium text-sm transition-colors ${
              isSubmitting || loading || !content.trim()
                ? 'bg-background-dark text-text-muted cursor-not-allowed opacity-60'
                : 'bg-primary text-text-inverse hover:opacity-90'
            }`}
          >
            {isSubmitting || loading ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}

