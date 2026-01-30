import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import emailRoutes from './routes/email.routes';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Notifications Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'notifications-service' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

// Email routes
app.use('/api/email', emailRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Notifications Service is running on port ${PORT}`);
});
