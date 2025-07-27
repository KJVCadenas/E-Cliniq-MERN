import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db';
import router from './src/routes';
import { logger } from './src/utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

connectDB();

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
