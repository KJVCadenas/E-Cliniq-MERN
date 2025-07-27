import dotenv from 'dotenv';
dotenv.config(); // Must be first!

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import router from './routes';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
