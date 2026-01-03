'use client'

import { Toaster as HotToaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { initToast } from '../utils/notifications/toast'
import toast from 'react-hot-toast'

/**
 * Toast provider component
 * Initializes the toast system and renders the toast container
 */
export default function Toaster() {
  useEffect(() => {
    // Initialize toast wrapper with react-hot-toast
    initToast(toast)
  }, [])

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#000',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}

