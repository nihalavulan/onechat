'use client'

import { useEffect } from 'react'
import useAuthStore from '../../store/useAuthStore'

export default function SocialPage() {
  const { user, initializeAuth } = useAuthStore()

  useEffect(() => {
    // Initialize auth state from localStorage on mount
    initializeAuth()
  }, [initializeAuth])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Social Feed</h1>
        <p className="text-text-secondary">
          {user?.email ? `Welcome, ${user.email}! ` : ''}This is the social feed page. Accessible to everyone.
        </p>
      </div>
    </div>
  )
}

