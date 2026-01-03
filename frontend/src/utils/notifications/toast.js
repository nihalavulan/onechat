/**
 * Toast notification wrapper
 * Framework-agnostic wrapper that can be swapped later
 * Pages and components should NEVER import toast library directly
 */

let toastInstance = null;

/**
 * Initialize toast system
 * This allows us to swap the underlying library without changing component code
 * @param {object} toastLib - The toast library instance (e.g., react-hot-toast)
 */
export const initToast = (toastLib) => {
  toastInstance = toastLib;
};

/**
 * Show success notification
 */
export const success = (message, options = {}) => {
  if (!toastInstance) {
    console.warn('Toast not initialized. Call initToast() first.');
    return;
  }
  return toastInstance.success(message, options);
};

/**
 * Show error notification
 */
export const error = (message, options = {}) => {
  if (!toastInstance) {
    console.warn('Toast not initialized. Call initToast() first.');
    return;
  }
  return toastInstance.error(message, options);
};

/**
 * Show info notification
 */
export const info = (message, options = {}) => {
  if (!toastInstance) {
    console.warn('Toast not initialized. Call initToast() first.');
    return;
  }
  // react-hot-toast uses the default export for info messages
  return toastInstance(message, options);
};

/**
 * Show loading notification
 */
export const loading = (message, options = {}) => {
  if (!toastInstance) {
    console.warn('Toast not initialized. Call initToast() first.');
    return;
  }
  return toastInstance.loading(message, options);
};

/**
 * Dismiss a specific toast
 */
export const dismiss = (toastId) => {
  if (!toastInstance) {
    return;
  }
  return toastInstance.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
  if (!toastInstance) {
    return;
  }
  return toastInstance.dismiss();
};

