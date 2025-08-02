import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Configuration options for the MongoDB sanitization middleware
 */
interface SanitizationOptions {
  /** Remove null bytes that can cause issues with MongoDB */
  removeNullBytes?: boolean;
  /** Remove MongoDB operators like $where, $regex, etc. */
  removeMongoOperators?: boolean;
  /** Remove JavaScript functions and eval attempts */
  removeJavaScript?: boolean;
  /** Maximum depth for nested objects to prevent deep injection */
  maxDepth?: number;
  /** Maximum string length to prevent buffer overflow attacks */
  maxStringLength?: number;
  /** Whitelist of allowed MongoDB operators (if any) */
  allowedOperators?: string[];
  /** Custom sanitization functions */
  customSanitizers?: Array<(value: any) => any>;
  /** Enable logging of sanitization actions */
  enableLogging?: boolean;
}

/**
 * Default configuration for the sanitization middleware
 */
const DEFAULT_OPTIONS: Required<SanitizationOptions> = {
  removeNullBytes: true,
  removeMongoOperators: true,
  removeJavaScript: true,
  maxDepth: 10,
  maxStringLength: 10000,
  allowedOperators: [],
  customSanitizers: [],
  enableLogging: false,
};

/**
 * Dangerous MongoDB operators that should be removed/sanitized
 */
const DANGEROUS_MONGO_OPERATORS = [
  '$where',
  '$regex',
  '$expr',
  '$jsonSchema',
  '$function',
  '$accumulator',
  '$addFields',
  '$bucket',
  '$bucketAuto',
  '$collStats',
  '$count',
  '$currentOp',
  '$facet',
  '$geoNear',
  '$graphLookup',
  '$group',
  '$indexStats',
  '$limit',
  '$listLocalSessions',
  '$listSessions',
  '$lookup',
  '$match',
  '$merge',
  '$out',
  '$planCacheStats',
  '$project',
  '$redact',
  '$replaceRoot',
  '$replaceWith',
  '$sample',
  '$skip',
  '$sort',
  '$sortByCount',
  '$unionWith',
  '$unset',
  '$unwind',
];

/**
 * JavaScript-related patterns that should be sanitized
 */
const JAVASCRIPT_PATTERNS = [
  /javascript:/gi,
  /eval\s*\(/gi,
  /function\s*\(/gi,
  /=>\s*{/gi,
  /new\s+Function/gi,
  /setTimeout/gi,
  /setInterval/gi,
  /console\./gi,
  /document\./gi,
  /window\./gi,
  /process\./gi,
  /require\(/gi,
  /import\s+/gi,
  /__proto__/gi,
  /constructor/gi,
];

/**
 * MongoDB Injection Sanitization Middleware
 *
 * This middleware provides comprehensive protection against:
 * - NoSQL injection attacks
 * - JavaScript injection in MongoDB queries
 * - Buffer overflow attacks
 * - Null byte injection
 * - Deep object nesting attacks
 * - Prototype pollution
 */
class MongoSanitizer {
  private options: Required<SanitizationOptions>;
  private sanitizationStats = {
    totalRequests: 0,
    sanitizedRequests: 0,
    blockedRequests: 0,
  };

  constructor(options: SanitizationOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Express middleware function
   */
  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        this.sanitizationStats.totalRequests++;
        let hasSanitized = false;

        // Sanitize request body
        if (req.body && typeof req.body === 'object') {
          const originalBody = JSON.stringify(req.body);
          req.body = this.sanitizeObject(req.body, 0);

          if (JSON.stringify(req.body) !== originalBody) {
            hasSanitized = true;
            if (this.options.enableLogging) {
              console.log(
                `[MongoSanitizer] Sanitized request body for ${req.method} ${req.path}`
              );
            }
          }
        }

        // Sanitize query parameters (Express 5 compatible)
        if (req.query && typeof req.query === 'object') {
          const originalQuery = JSON.stringify(req.query);
          const sanitizedQuery = this.sanitizeObject(req.query, 0);

          if (JSON.stringify(sanitizedQuery) !== originalQuery) {
            // Use Object.defineProperty to replace the query getter in Express 5
            Object.defineProperty(req, 'query', {
              value: sanitizedQuery,
              writable: true,
              enumerable: true,
              configurable: true,
            });
            hasSanitized = true;
            if (this.options.enableLogging) {
              console.log(
                `[MongoSanitizer] Sanitized query parameters for ${req.method} ${req.path}`
              );
            }
          }
        }

        // Sanitize URL parameters (Express 5 compatible)
        if (req.params && typeof req.params === 'object') {
          const originalParams = JSON.stringify(req.params);
          const sanitizedParams = this.sanitizeObject(req.params, 0);

          if (JSON.stringify(sanitizedParams) !== originalParams) {
            // Use Object.defineProperty to replace the params getter in Express 5
            Object.defineProperty(req, 'params', {
              value: sanitizedParams,
              writable: true,
              enumerable: true,
              configurable: true,
            });
            hasSanitized = true;
            if (this.options.enableLogging) {
              console.log(
                `[MongoSanitizer] Sanitized URL parameters for ${req.method} ${req.path}`
              );
            }
          }
        }

        if (hasSanitized) {
          this.sanitizationStats.sanitizedRequests++;
        }

        next();
      } catch (error) {
        if (this.options.enableLogging) {
          console.error('[MongoSanitizer] Error during sanitization:', error);
        }

        this.sanitizationStats.blockedRequests++;
        res.status(400).json({
          error: 'Invalid request data',
          message: 'Request contains potentially malicious content',
        });
      }
    };
  }

  /**
   * Recursively sanitize an object
   */
  private sanitizeObject(obj: any, depth: number): any {
    // Prevent deep nesting attacks
    if (depth > this.options.maxDepth) {
      throw new Error('Maximum object depth exceeded');
    }

    // Handle null or undefined
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
      return this.sanitizeValue(obj);
    }

    // Handle objects
    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      // Sanitize the key
      const sanitizedKey = this.sanitizeKey(key);

      // Skip dangerous keys entirely
      if (this.isDangerousKey(sanitizedKey)) {
        if (this.options.enableLogging) {
          console.warn(`[MongoSanitizer] Removed dangerous key: ${key}`);
        }
        continue;
      }

      // Recursively sanitize the value
      sanitized[sanitizedKey] = this.sanitizeObject(value, depth + 1);
    }

    return sanitized;
  }

  /**
   * Sanitize individual values
   */
  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // For other types, convert to string and sanitize
    return this.sanitizeString(String(value));
  }

  /**
   * Sanitize string values
   */
  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    // Check string length
    if (str.length > this.options.maxStringLength) {
      throw new Error(
        `String length exceeds maximum allowed length of ${this.options.maxStringLength}`
      );
    }

    let sanitized = str;

    // Remove null bytes
    if (this.options.removeNullBytes) {
      sanitized = sanitized.replace(/\0/g, '');
    }

    // Remove JavaScript patterns
    if (this.options.removeJavaScript) {
      JAVASCRIPT_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
      });
    }

    // Apply custom sanitizers
    this.options.customSanitizers.forEach(sanitizer => {
      sanitized = sanitizer(sanitized);
    });

    return sanitized;
  }

  /**
   * Sanitize object keys
   */
  private sanitizeKey(key: string): string {
    if (typeof key !== 'string') {
      return String(key);
    }

    let sanitized = key;

    // Remove null bytes from keys
    if (this.options.removeNullBytes) {
      sanitized = sanitized.replace(/\0/g, '');
    }

    // Remove dangerous characters from keys
    sanitized = sanitized.replace(/[.$]/g, '');

    return sanitized;
  }

  /**
   * Check if a key is dangerous
   */
  private isDangerousKey(key: string): boolean {
    if (!this.options.removeMongoOperators) {
      return false;
    }

    // Check if key starts with $ (MongoDB operator)
    if (key.startsWith('$')) {
      // Allow whitelisted operators
      if (this.options.allowedOperators.includes(key)) {
        return false;
      }

      // Block dangerous operators
      return DANGEROUS_MONGO_OPERATORS.includes(key);
    }

    // Check for prototype pollution attempts
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return true;
    }

    return false;
  }

  /**
   * Get sanitization statistics
   */
  public getStats() {
    return { ...this.sanitizationStats };
  }

  /**
   * Reset statistics
   */
  public resetStats() {
    this.sanitizationStats = {
      totalRequests: 0,
      sanitizedRequests: 0,
      blockedRequests: 0,
    };
  }

  /**
   * Create a Zod schema for additional validation
   */
  public static createValidationSchema() {
    return z
      .object({
        // Prevent MongoDB operators in top-level fields
        body: z.any().refine(
          data => {
            if (typeof data === 'object' && data !== null) {
              const keys = Object.keys(data);
              return !keys.some(key => key.startsWith('$'));
            }
            return true;
          },
          {
            message: 'MongoDB operators not allowed in request body',
          }
        ),
      })
      .partial();
  }
}

/**
 * Factory function to create the middleware with options
 */
export function createMongoSanitizer(options?: SanitizationOptions) {
  return new MongoSanitizer(options);
}

/**
 * Quick setup function for basic protection
 */
export function mongoSanitizer(options?: SanitizationOptions) {
  const sanitizer = new MongoSanitizer(options);
  return sanitizer.middleware();
}

/**
 * Enhanced setup with Zod validation
 */
export function mongoSanitizerWithValidation(options?: SanitizationOptions) {
  const sanitizer = new MongoSanitizer(options);
  const schema = MongoSanitizer.createValidationSchema();

  return (req: Request, res: Response, next: NextFunction) => {
    // First apply sanitization
    sanitizer.middleware()(req, res, error => {
      if (error) {
        return next(error);
      }

      // Then apply Zod validation
      try {
        schema.parse({ body: req.body });
        next();
      } catch (validationError) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Request data failed security validation',
          details:
            validationError instanceof z.ZodError
              ? validationError.stack
              : 'Invalid data format',
        });
      }
    });
  };
}

// Export the main class and utility functions
export { MongoSanitizer, SanitizationOptions };

// Default export for convenience
export default mongoSanitizer;
