import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { requestIdMiddleware } from '@platform/middleware';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3012;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(morgan('combined'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'express-admin-portal' });
});

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Review Rise Admin Portal API' });
});

import locationsRoutes from './routes/locations.routes';
import businessesRoutes from './routes/businesses.routes';
import usersRoutes from './routes/users.routes';
app.use('/locations', locationsRoutes);
app.use('/businesses', businessesRoutes);
app.use('/users', usersRoutes);

// Error Handling
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start Server
app.listen(port, () => {
  console.info(`🚀 Admin Portal Service running on port ${port}`);
});
