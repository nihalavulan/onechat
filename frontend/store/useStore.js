import { create } from 'zustand'
import * as authApi from '../src/services/api/auth.api'
import * as chatApi from '../src/services/api/chat.api'
import { setToken, getToken } from '../src/services/api/client'
import {
  createSocket,
  getSocket,
  disconnectSocket as disconnectSocketService,
  isSocketConnected,
  SOCKET_EVENTS,
} from '../src/services/socket'

const useAuthStore = create((set, get) => {
  // Initialize auth state from localStorage on store creation
  const initializeAuth = () => {
    const token = getToken();
    if (token) {
      // Decode JWT to get user info (basic decode, no verification)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          token,
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role || 'user',
          },
          isAuthenticated: true,
        };
      } catch (e) {
        // Invalid token, clear it
        setToken(null);
        return {
          token: null,
          user: null,
          isAuthenticated: false,
        };
      }
    }
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  };

  const initialState = {
    // UI state
    loading: false,
    error: null,
    ...initializeAuth(),
  };

  return {
    ...initialState,

    // Chat state
    activeChatUser: null,
    messages: {}, // { [userId]: Array<message> }
    onlineUsers: new Set(),
    socketConnected: false,
    pendingOptimisticMessages: new Map(), // Track optimistic messages by content+receiver to replace them

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

      // Auth actions
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login(credentials);
          
          // Extract token and user from response
          // Backend returns: { message, token, user: { id, email } }
          const token = response.token;
          const user = response.user || {
            id: response.user?.id,
            email: response.user?.email || response.email,
            role: 'user', // Default role, can be extracted from JWT if needed
          };

          // Store token in localStorage
          setToken(token);

          // Update store
          set({
            token,
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          // Connect socket after login
          get().connectSocket();

          return { success: true, user };
        } catch (error) {
          const errorMessage = error.message || error.data?.error || 'Login failed';
          set({
            loading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

    signup: async (credentials) => {
      set({ loading: true, error: null });
      try {
        // First, create the account
        const signupResponse = await authApi.signup(credentials);
        
        // After successful signup, automatically log in
        const loginResponse = await authApi.login(credentials);
        
        // Extract token and user from login response
        const token = loginResponse.token;
        const user = loginResponse.user || {
          id: loginResponse.user?.id,
          email: loginResponse.user?.email || loginResponse.email,
          role: 'user',
        };

        // Store token in localStorage
        setToken(token);

        // Update store
        set({
          token,
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        // Connect socket after signup/login
        get().connectSocket();

        return { success: true, user, token };
      } catch (error) {
        const errorMessage = error.message || error.data?.error || 'Signup failed';
        set({
          loading: false,
          error: errorMessage,
        });
        throw error;
      }
    },

    logout: () => {
      // Disconnect socket before logout
      get().disconnectSocket();
      setToken(null);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        activeChatUser: null,
        messages: {},
        onlineUsers: new Set(),
        socketConnected: false,
        pendingOptimisticMessages: new Map(),
      });
    },

    // Initialize auth state from localStorage
    initializeAuth: () => {
      const authState = initializeAuth();
      set(authState);
    },

    reset: () => set({ loading: false, error: null }),

    // Chat actions
    connectSocket: () => {
      const state = get();
      if (!state.isAuthenticated || !state.token) {
        return;
      }

      const existingSocket = getSocket();
      if (existingSocket?.connected) {
        // Socket already connected, don't add duplicate listeners
        set({ socketConnected: true });
        return;
      }

      // Disconnect existing socket if any
      if (existingSocket) {
        existingSocket.removeAllListeners();
        existingSocket.disconnect();
      }

      const socket = createSocket(state.token);

      // Connection handlers (only add once)
      socket.once(SOCKET_EVENTS.CONNECT, () => {
        console.log('Socket connected');
        set({ socketConnected: true });
      });

      socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        console.log('Socket disconnected');
        set({ socketConnected: false });
      });

      socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
        console.error('Socket connection error:', error);
        set({ socketConnected: false });
      });

      // Message handlers
      // Remove any existing listeners first to prevent duplicates
      socket.off(SOCKET_EVENTS.MESSAGE_SENT);
      socket.off(SOCKET_EVENTS.NEW_MESSAGE);
      
      socket.on(SOCKET_EVENTS.MESSAGE_SENT, (message) => {
        // Message confirmation from server - replace optimistic message
        get().receiveMessage(message);
      });

      socket.on(SOCKET_EVENTS.NEW_MESSAGE, (message) => {
        // New message received (only for messages from other users)
        get().receiveMessage(message);
      });

      socket.on(SOCKET_EVENTS.ERROR, (error) => {
        console.error('Socket error:', error);
        // Silently handle errors - don't spam user
      });
    },

    disconnectSocket: () => {
      const socket = getSocket();
      if (socket) {
        socket.removeAllListeners();
        disconnectSocketService();
      }
      set({ socketConnected: false });
    },

    sendMessage: (receiverId, content) => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        throw new Error('Socket not connected');
      }

      const trimmedContent = content.trim();
      const state = get();
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      // Optimistically add message to UI
      const optimisticMessage = {
        id: tempId,
        senderId: state.user.id,
        receiverId: receiverId,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      // Track this optimistic message so we can replace it later
      const optimisticKey = `${state.user.id}-${receiverId}-${trimmedContent}`;
      set((state) => {
        const newPending = new Map(state.pendingOptimisticMessages);
        newPending.set(optimisticKey, tempId);
        return { pendingOptimisticMessages: newPending };
      });

      get().receiveMessage(optimisticMessage);

      // Emit to server
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, {
        receiverId: receiverId,
        content: trimmedContent,
      });
    },

    receiveMessage: (message) => {
      const state = get();
      const { senderId, receiverId, id, content } = message;
      const currentUserId = state.user?.id;

      if (!currentUserId) {
        return;
      }

      // Determine the other user in the conversation
      const otherUserId = senderId === currentUserId ? receiverId : senderId;

      // Get existing messages for this user
      const existingMessages = state.messages[otherUserId] || [];

      // STRICT: First check if message with this exact ID already exists (prevents all duplicates)
      const exactMatchIndex = existingMessages.findIndex((m) => m.id === id);
      if (exactMatchIndex !== -1) {
        // Message with this ID already exists - don't add duplicate
        return;
      }

      // Check if this is a real message ID (not temp) - means it's from server
      const isRealMessage = typeof id === 'number' || (typeof id === 'string' && !id.startsWith('temp-'));

      // If this is a real message from server and we're the sender, try to replace optimistic message
      if (isRealMessage && senderId === currentUserId) {
        // Check if we have a pending optimistic message for this
        const optimisticKey = `${senderId}-${receiverId}-${content.trim()}`;
        const pendingTempId = state.pendingOptimisticMessages.get(optimisticKey);
        
        if (pendingTempId) {
          // Find and replace the optimistic message
          const optimisticIndex = existingMessages.findIndex((m) => m.id === pendingTempId);
          
          if (optimisticIndex !== -1) {
            // Replace optimistic message with real one
            const updatedMessages = [...existingMessages];
            updatedMessages[optimisticIndex] = { ...message, optimistic: false };
            
            // Remove from pending map
            const newPending = new Map(state.pendingOptimisticMessages);
            newPending.delete(optimisticKey);
            
            set({
              messages: {
                ...state.messages,
                [otherUserId]: updatedMessages,
              },
              pendingOptimisticMessages: newPending,
            });
            return;
          }
        }
        
        // Fallback: Try to find optimistic message by content matching
        const optimisticIndex = existingMessages.findIndex((m) => {
          if (!m.optimistic) return false;
          return (
            m.content.trim() === content.trim() &&
            m.senderId === senderId &&
            m.receiverId === receiverId
          );
        });

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real one
          const updatedMessages = [...existingMessages];
          updatedMessages[optimisticIndex] = { ...message, optimistic: false };
          set({
            messages: {
              ...state.messages,
              [otherUserId]: updatedMessages,
            },
          });
          return;
        }
      }

      // If we get here, it's a completely new message
      // Add it to the messages array
      set({
        messages: {
          ...state.messages,
          [otherUserId]: [...existingMessages, { ...message, optimistic: false }],
        },
      });
    },

    setActiveChatUser: (user) => {
      set({ activeChatUser: user });
    },

    loadChatHistory: async (userId) => {
      try {
        const response = await chatApi.getChatHistory(userId);
        const messages = response.messages || [];

        set((state) => ({
          messages: {
            ...state.messages,
            [userId]: messages,
          },
        }));

        return messages;
      } catch (error) {
        console.error('Error loading chat history:', error);
        throw error;
      }
    },

    loadUsers: async () => {
      try {
        const response = await chatApi.getUsers();
        return response.users || [];
      } catch (error) {
        console.error('Error loading users:', error);
        throw error;
      }
    },
  };
})

export default useAuthStore

