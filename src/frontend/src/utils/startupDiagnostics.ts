/**
 * Normalizes unknown thrown values into an Error-like shape
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }
  return new Error('Unknown error occurred');
}

/**
 * Sanitizes error messages by redacting sensitive information
 */
export function sanitizeErrorMessage(message: string): string {
  // Redact any token-like patterns
  let sanitized = message.replace(/caffeineAdminToken[=:]\s*[^\s&]+/gi, 'caffeineAdminToken=[REDACTED]');
  sanitized = sanitized.replace(/token[=:]\s*[^\s&]+/gi, 'token=[REDACTED]');
  sanitized = sanitized.replace(/secret[=:]\s*[^\s&]+/gi, 'secret=[REDACTED]');
  return sanitized;
}

/**
 * Creates a user-safe error summary for display
 */
export function getUserSafeErrorSummary(error: unknown): string {
  const normalized = normalizeError(error);
  const sanitized = sanitizeErrorMessage(normalized.message);

  // Provide a more user-friendly message for common errors
  if (sanitized.includes('Actor not available')) {
    return 'Failed to connect to the backend service.';
  }
  if (sanitized.includes('Unauthorized')) {
    return 'Authentication failed. Please try logging in again.';
  }
  if (sanitized.includes('network') || sanitized.includes('fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }

  // Return sanitized message for other errors
  return sanitized || 'An unexpected error occurred.';
}

/**
 * Creates a detailed error log for console debugging
 */
export function getDetailedErrorLog(error: unknown): {
  message: string;
  stack?: string;
  type: string;
} {
  const normalized = normalizeError(error);
  return {
    message: sanitizeErrorMessage(normalized.message),
    stack: normalized.stack ? sanitizeErrorMessage(normalized.stack) : undefined,
    type: normalized.name || 'Error',
  };
}

/**
 * Logs startup error to console with sanitized details
 */
export function logStartupError(context: string, error: unknown): void {
  const details = getDetailedErrorLog(error);
  console.error(`[Startup Error - ${context}]`, {
    message: details.message,
    type: details.type,
    stack: details.stack,
    timestamp: new Date().toISOString(),
  });
}
