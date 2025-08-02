import dotenv from 'dotenv';
dotenv.config(); // Must be first!

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import router from './routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import mongoSanitize from 'express-mongo-sanitize';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';

const xssOptions = {
  // Only skip sanitization for known "safe" HTML payloads
  // (e.g. you’ve already sanitized or rendered them with DOMPurify)
  allowedKeys: ['descriptionHtml', 'bioHtml'],

  // Only allow the most common inline/formatting tags
  allowedTags: ['a', 'b', 'i', 'em', 'strong', 'p', 'ul', 'ol', 'li'],

  // Only allow href on <a> tags; all other tags get default strip or escape
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        imgSrc: ["'self'", 'data:'], // adjust according to image needs
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // adjust if you have cross-origin image/audio needs
  })
);
app.use(
  cors({
    // TODO: CORS origin is hardcoded to localhost. Should be configurable via environment variables.
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandler);
app.use(rateLimiter);
app.use(mongoSanitize()); // Mongo Sanitize (after body parsing)
app.use(xss(xssOptions)); // Sanitize all incoming req.body

app.use('/api', router);

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
