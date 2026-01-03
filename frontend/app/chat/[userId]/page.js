'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import useAuthStore from '../../../store/useStore'
import notify from '../../../src/utils/notifications'

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const userId = parseInt(params.userId, 10)
  const messagesEndRef = useRef(null)

  const {
    isAuthenticated,
    user,
    initializeAuth,
    connectSocket,
    disconnectSocket,
    socketConnected,
    activeChatUser,
    setActiveChatUser,
    messages,
    loadChatHistory,
    sendMessage,
    loading,
    logout,
  } = useAuthStore()

  const handleLogout = () => {
    logout()
    notify.success('Logged out successfully')
    router.push('/login')
  }

  const [messageInput, setMessageInput] = useState('')
  const [chatUser, setChatUser] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
      // Only disconnect on logout
    }
  }, [isAuthenticated, connectSocket])

  // Load chat user and history
  useEffect(() => {
    if (!isAuthenticated || isNaN(userId)) {
      return
    }

    const loadChat = async () => {
      try {
        setLoadingHistory(true)
        
        // Load users to find the chat user
        const users = await useAuthStore.getState().loadUsers()
        const foundUser = users.find((u) => u.id === userId)
        
        if (!foundUser) {
          notify.error('User not found')
          router.push('/chat')
          return
        }

        setChatUser(foundUser)
        setActiveChatUser(foundUser)

        // Load chat history
        await loadChatHistory(userId)
      } catch (error) {
        console.error('Error loading chat:', error)
        notify.error('Failed to load chat')
      } finally {
        setLoadingHistory(false)
      }
    }

    loadChat()
  }, [userId, isAuthenticated, loadChatHistory, setActiveChatUser, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[userId]])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!messageInput.trim() || !socketConnected) {
      return
    }

    try {
      sendMessage(userId, messageInput)
      setMessageInput('')
    } catch (error) {
      console.error('Error sending message:', error)
      notify.error('Failed to send message')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (loadingHistory) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-text-secondary">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!chatUser) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-text-secondary">User not found</p>
        </div>
      </div>
    )
  }

  const chatMessages = messages[userId] || []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">
              {chatUser.email}
            </h1>
            {socketConnected ? (
              <p className="text-sm text-text-secondary">Online</p>
            ) : (
              <p className="text-sm text-text-muted">Connecting...</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-error text-text-inverse rounded-md font-medium hover:opacity-90 transition-colors text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {chatMessages.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              No messages yet. Start the conversation!
            </p>
          ) : (
            chatMessages.map((message) => {
              const isOwnMessage = message.senderId === user.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-primary text-text-inverse'
                        : 'bg-surface border border-border text-text-primary'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-text-inverse opacity-70' : 'text-text-muted'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-surface border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              disabled={!socketConnected}
              className="flex-1 px-4 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary"
            />
            <button
              type="submit"
              disabled={!socketConnected || !messageInput.trim()}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                socketConnected && messageInput.trim()
                  ? 'bg-primary text-text-inverse hover:opacity-90'
                  : 'bg-background-dark text-text-muted cursor-not-allowed opacity-60'
              }`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

