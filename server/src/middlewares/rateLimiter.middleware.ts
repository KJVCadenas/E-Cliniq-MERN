// src/middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// Basic IP-based rate limiter
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Send RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    error: 'Too many requests, please try again later.',
  },
});
