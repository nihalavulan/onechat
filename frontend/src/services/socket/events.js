/**
 * Socket Event Names
 * Centralized event name constants to avoid typos
 */

export const SOCKET_EVENTS = {
  // Client emits
  SEND_MESSAGE: 'send_message',

  // Server emits
  MESSAGE_SENT: 'message_sent',
  NEW_MESSAGE: 'new_message',
  ERROR: 'error',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
};

