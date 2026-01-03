import { create } from 'zustand'
import * as chatApi from '../src/services/api/chat.api'
import {
  createSocket,
  getSocket,
  disconnectSocket as disconnectSocketService,
  isSocketConnected,
  SOCKET_EVENTS,
} from '../src/services/socket'
import useAuthStore from './useAuthStore'

const useChatStore = create((set, get) => {
  return {
    // Chat state
    activeChatUser: null,
    messages: {}, // { [userId]: Array<message> }
    onlineUsers: new Set(),
    socketConnected: false,
    pendingOptimisticMessages: new Map(), // Track optimistic messages by content+receiver to replace them

    // Chat actions
    connectSocket: () => {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || !authState.token) {
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

      const socket = createSocket(authState.token);

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

      const authState = useAuthStore.getState();
      const trimmedContent = content.trim();
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      
      // Optimistically add message to UI
      const optimisticMessage = {
        id: tempId,
        senderId: authState.user.id,
        receiverId: receiverId,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      // Track this optimistic message so we can replace it later
      const optimisticKey = `${authState.user.id}-${receiverId}-${trimmedContent}`;
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
      const authState = useAuthStore.getState();
      const { senderId, receiverId, id, content } = message;
      const currentUserId = authState.user?.id;

      if (!currentUserId) {
        return;
      }

      // Determine the other user in the conversation
      const otherUserId = senderId === currentUserId ? receiverId : senderId;

      // Get existing messages for this user
      const state = get();
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

    clearChatState: () => {
      set({
        activeChatUser: null,
        messages: {},
        onlineUsers: new Set(),
        socketConnected: false,
        pendingOptimisticMessages: new Map(),
      });
    },
  };
})

export default useChatStore

