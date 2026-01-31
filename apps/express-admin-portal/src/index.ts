import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

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
  const response = createSuccessResponse({ service: 'express-admin-portal' }, 'Service is healthy', 200, { requestId: req.id });
  res.status(response.statusCode).json(response);
});

// Basic Route
app.get('/', (req, res) => {
  const response = createSuccessResponse(null, 'Welcome to Review Rise Admin Portal API', 200, { requestId: req.id });
  res.status(response.statusCode).json(response);
});

import locationsRoutes from './routes/locations.routes';
import businessesRoutes from './routes/businesses.routes';
import usersRoutes from './routes/users.routes';
app.use('/locations', locationsRoutes);
app.use('/businesses', businessesRoutes);
app.use('/users', usersRoutes);

// Error Handling
app.use(errorHandler);

// Start Server
app.listen(port, () => {
  console.info(`🚀 Admin Portal Service running on port ${port}`);
});
