/**
 * Error mapper utility
 * Maps API errors and error codes to user-friendly messages
 */

const errorMessages = {
  // Authentication errors
  'INVALID_CREDENTIALS': 'Invalid email or password',
  'INVALID EMAIL OR PASSWORD': 'Invalid email or password',
  'EMAIL_EXISTS': 'This email is already registered',
  'EMAIL ALREADY EXISTS': 'This email is already registered',
  'EMAIL_REQUIRED': 'Email is required',
  'EMAIL AND PASSWORD ARE REQUIRED': 'Email and password are required',
  'PASSWORD_REQUIRED': 'Password is required',
  'PASSWORD_TOO_SHORT': 'Password must be at least 6 characters long',
  'PASSWORD MUST BE AT LEAST 6 CHARACTERS LONG': 'Password must be at least 6 characters long',
  'INVALID_EMAIL': 'Please enter a valid email address',
  'PASSWORDS_DONT_MATCH': 'Passwords do not match',
  
  // Network errors
  'NETWORK_ERROR': 'Network error. Please check your connection',
  'TIMEOUT': 'Request timed out. Please try again',
  
  // Server errors
  'SERVER_ERROR': 'Something went wrong. Please try again later',
  'INTERNAL SERVER ERROR': 'Something went wrong. Please try again later',
  'UNAUTHORIZED': 'You are not authorized to perform this action',
  'FORBIDDEN': 'Access denied',
  'NOT_FOUND': 'Resource not found',
  
  // Comment moderation errors
  'COMMENT_REJECTED': 'Comment rejected',
  'COMMENT REJECTED': 'Comment rejected',
  
  // Generic
  'UNKNOWN_ERROR': 'An unexpected error occurred',
  'LOGIN FAILED': 'Login failed. Please try again',
  'SIGNUP FAILED': 'Signup failed. Please try again',
};

/**
 * Map error to user-friendly message
 * @param {Error|string|object} error - The error to map
 * @returns {string} User-friendly error message
 */
export const mapError = (error) => {
  // If it's already a string, check if it's a known error code
  if (typeof error === 'string') {
    return errorMessages[error] || error || errorMessages.UNKNOWN_ERROR;
  }

  // If it's an Error object
  if (error instanceof Error) {
    // Check if error message matches a known code
    const errorCode = error.message.toUpperCase().replace(/\s+/g, '_');
    if (errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }
    // Return the error message if it's user-friendly
    return error.message || errorMessages.UNKNOWN_ERROR;
  }

  // If it's an object with a message property
  if (error && typeof error === 'object') {
    // Check for comment rejection with reason
    if (error.error === 'Comment rejected' && error.reason) {
      return `Comment rejected: ${error.reason}`;
    }
    
    if (error.message) {
      const errorCode = error.message.toUpperCase().replace(/\s+/g, '_');
      if (errorMessages[errorCode]) {
        return errorMessages[errorCode];
      }
      return error.message;
    }
    
    if (error.error) {
      // Check if error.error is a string that matches known errors
      const errorCode = error.error.toUpperCase().replace(/\s+/g, '_');
      if (errorMessages[errorCode]) {
        // If there's a reason, include it
        if (error.reason) {
          return `${errorMessages[errorCode]}: ${error.reason}`;
        }
        return errorMessages[errorCode];
      }
      // If error.error is a string, return it (might be user-friendly)
      if (typeof error.error === 'string') {
        if (error.reason) {
          return `${error.error}: ${error.reason}`;
        }
        return error.error;
      }
      return mapError(error.error);
    }
  }

  return errorMessages.UNKNOWN_ERROR;
};

/**
 * Add custom error message mapping
 * @param {string} code - Error code
 * @param {string} message - User-friendly message
 */
export const addErrorMapping = (code, message) => {
  errorMessages[code] = message;
};

