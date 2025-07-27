import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGO_URI = process.env.MONGO_URI || '';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection failed');
    process.exit(1);
  }
};
