import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // UI state only (no backend calls yet)
  loading: false,
  error: null,
  
  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set({ loading: false, error: null }),
}))

export default useAuthStore

