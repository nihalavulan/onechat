'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import useAuthStore from '../../store/useStore'
import notify from '../../src/utils/notifications'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, user, initializeAuth, loadUsers, connectSocket, logout } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    logout()
    notify.success('Logged out successfully')
    router.push('/login')
  }

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
      loadUsersList()
    }
  }, [isAuthenticated, connectSocket])

  const loadUsersList = async () => {
    try {
      setLoading(true)
      const usersList = await loadUsers()
      setUsers(usersList)
    } catch (error) {
      console.error('Error loading users:', error)
      notify.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Chat</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-error text-text-inverse rounded-md font-medium hover:opacity-90 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {loading ? (
          <p className="text-text-secondary">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-text-secondary">No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map((chatUser) => (
              <Link
                key={chatUser.id}
                href={`/chat/${chatUser.id}`}
                className="block p-4 bg-surface rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-text-primary">{chatUser.email}</p>
                    {chatUser.lastMessageAt && (
                      <p className="text-sm text-text-secondary">
                        Last message: {new Date(chatUser.lastMessageAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <span className="text-text-muted">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

