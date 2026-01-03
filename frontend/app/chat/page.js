'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '../../store/useStore'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, user, initializeAuth } = useAuthStore()

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Chat</h1>
        <p className="text-text-secondary">
          Welcome, {user?.email}! This is the chat page. Only accessible when logged in.
        </p>
      </div>
    </div>
  )
}

