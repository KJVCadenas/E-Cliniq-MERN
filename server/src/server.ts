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

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use('/api', router);

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
