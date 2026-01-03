/**
 * Combined Store
 * Re-exports both auth and chat stores for backward compatibility
 * Components can import from here or directly from useAuthStore/useChatStore
 */

import useAuthStore from './useAuthStore'
import useChatStore from './useChatStore'

// Re-export for backward compatibility
export { useAuthStore, useChatStore }

// Default export combines both stores (for components that need both)
// Note: Components should prefer importing useAuthStore and useChatStore separately
const useStore = () => {
  const auth = useAuthStore()
  const chat = useChatStore()
  return { ...auth, ...chat }
}

export default useStore
