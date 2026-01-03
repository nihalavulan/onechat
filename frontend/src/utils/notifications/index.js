/**
 * Centralized notification system
 * 
 * Usage:
 * import notify from '@/src/utils/notifications';
 * 
 * notify.success("Logged in successfully");
 * notify.error("Invalid credentials");
 */

import * as toast from './toast';
import { mapError } from './errorMapper';

/**
 * Show success notification
 */
const success = (message, options = {}) => {
  return toast.success(message, options);
};

/**
 * Show error notification
 * Automatically maps error to user-friendly message
 */
const error = (error, options = {}) => {
  const message = mapError(error);
  return toast.error(message, options);
};

/**
 * Show info notification
 */
const info = (message, options = {}) => {
  return toast.info(message, options);
};

/**
 * Show loading notification
 */
const loading = (message, options = {}) => {
  return toast.loading(message, options);
};

/**
 * Dismiss a specific toast
 */
const dismiss = (toastId) => {
  return toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
const dismissAll = () => {
  return toast.dismissAll();
};

const notify = {
  success,
  error,
  info,
  loading,
  dismiss,
  dismissAll,
};

export default notify;

