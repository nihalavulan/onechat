'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useAuthStore from '../../store/useAuthStore'
import useChatStore from '../../store/useChatStore'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout, initializeAuth } = useAuthStore()
  const { disconnectSocket, clearChatState } = useChatStore()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    initializeAuth()
  }, [initializeAuth])

  const handleLogout = () => {
    // Disconnect socket and clear chat state
    disconnectSocket()
    clearChatState()
    
    // Logout and clear auth state
    logout()
    
    // Redirect to social page
    router.push('/social')
  }

  // Don't render navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/social" className="flex items-center">
            <h1 className="text-xl font-bold text-primary">OneChat</h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {mounted && (
              <>
                {/* Public Links */}
                <Link
                  href="/social"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/social'
                      ? 'text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Social
                </Link>

                {/* Authenticated Links */}
                {isAuthenticated && (
                  <Link
                    href="/chat"
                    className={`text-sm font-medium transition-colors ${
                      pathname?.startsWith('/chat')
                        ? 'text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Chat
                  </Link>
                )}

                {/* Auth Section */}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-text-inverse text-xs font-medium">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm text-text-primary hidden sm:inline">
                        {user?.email || 'User'}
                      </span>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm font-medium text-text-primary bg-background-dark hover:bg-background-darker rounded-md transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-text-primary hover:text-primary transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-medium bg-primary text-text-inverse rounded-md hover:opacity-90 transition-opacity"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

