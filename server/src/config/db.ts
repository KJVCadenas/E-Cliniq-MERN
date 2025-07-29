import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if DB is unreachable
      socketTimeoutMS: 45000, // Close idle sockets after 45s
      maxPoolSize: 10, // Tune this based on expected concurrency
      minPoolSize: 2, // Keep a few idle connections ready
      family: 4, // Prefer IPv4 over IPv6
    });

    logger.info('MongoDB connected');
    setupGracefulShutdown();
  } catch (err) {
    logger.error(`MongoDB connection failed: ${(err as Error).message}`);
    // DO NOT exit immediately; let service manager handle restart
  }
};

// === Graceful Shutdown ===
const setupGracefulShutdown = () => {
  const shutdown = async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during MongoDB shutdown: ${(err as Error).message}`);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown); // Ctrl+C
  process.on('SIGTERM', shutdown); // System shutdown
};
