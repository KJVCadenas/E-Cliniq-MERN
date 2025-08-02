/**
 * Client-side sanitization utilities
 * Provides functions to sanitize user inputs and prevent XSS attacks
 */

/**
 * Escapes HTML entities to prevent XSS when rendering user content
 * @param str - String to escape
 * @returns Sanitized string safe for HTML rendering
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') {
    return String(str);
  }

  const htmlEntities: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, s => htmlEntities[s]);
}

/**
 * Removes potentially dangerous JavaScript patterns from strings
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeJavaScript(str: string): string {
  if (typeof str !== 'string') {
    return String(str);
  }

  // Remove common JavaScript injection patterns
  return str
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/on\w+=[^\s>]+/gi, '');
}

/**
 * Removes null bytes and other potentially dangerous characters
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function removeNullBytes(str: string): string {
  if (typeof str !== 'string') {
    return String(str);
  }

  return str.replace(/\0/g, '');
}

/**
 * Sanitizes user input strings by applying multiple sanitization techniques
 * @param str - String to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
  str: string,
  options: {
    escapeHtml?: boolean;
    removeJavaScript?: boolean;
    removeNullBytes?: boolean;
  } = {}
): string {
  const {
    escapeHtml: shouldEscapeHtml = true,
    removeJavaScript = true,
    removeNullBytes: shouldRemoveNullBytes = true,
  } = options;

  if (typeof str !== 'string') {
    str = String(str);
  }

  // Apply sanitization based on options
  if (shouldRemoveNullBytes) {
    str = removeNullBytes(str);
  }

  if (removeJavaScript) {
    str = sanitizeJavaScript(str);
  }

  if (shouldEscapeHtml) {
    str = escapeHtml(str);
  }

  return str;
}

/**
 * Sanitizes an object recursively, applying sanitization to all string values
 * @param obj - Object to sanitize
 * @param options - Sanitization options
 * @returns Sanitized object
 */
export function sanitizeObject<T>(
  obj: T,
  options?: {
    escapeHtml?: boolean;
    removeJavaScript?: boolean;
    removeNullBytes?: boolean;
  }
): T {
  // Handle null or undefined
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options)) as unknown as T;
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeInput(obj, options) as unknown as T;
    }
    return obj;
  }

  // Handle objects
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // Sanitize the key (remove dangerous characters)
    const sanitizedKey = sanitizeInput(key, {
      escapeHtml: true,
      removeJavaScript: true,
      removeNullBytes: true,
    });

    // Recursively sanitize the value
    sanitized[sanitizedKey] = sanitizeObject(value, options);
  }

  return sanitized as T;
}

/**
 * Sanitizes form data before sending to the server
 * @param data - Form data object
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T
): T {
  return sanitizeObject(data, {
    escapeHtml: false, // Don't escape HTML for form data being sent to server
    removeJavaScript: true,
    removeNullBytes: true,
  });
}

/**
 * Sanitizes data for safe display in the UI
 * @param data - Data to sanitize for display
 * @returns Sanitized data for safe display
 */
export function sanitizeForDisplay<T extends Record<string, unknown>>(
  data: T
): T {
  return sanitizeObject(data, {
    escapeHtml: true, // Escape HTML for safe display
    removeJavaScript: true,
    removeNullBytes: true,
  });
}

// Export default sanitize function for simple string sanitization
export default sanitizeInput;
