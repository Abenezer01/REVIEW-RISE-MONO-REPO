import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';
import emailRoutes from './routes/email.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Notifications Service is running', 200, { requestId: req.id }));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'ok', service: 'notifications-service' }, 'Service is healthy', 200, { requestId: req.id }));
});

// Email routes
app.use('/api/email', emailRoutes);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Notifications Service is running on port ${PORT}`);
});
