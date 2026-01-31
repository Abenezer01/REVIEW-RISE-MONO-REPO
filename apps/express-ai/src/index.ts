import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-ai' });
});

import aiRoutes from './routes/ai.routes';
import contentStudioRoutes from './routes/content-studio.routes';

app.use('/api/v1', aiRoutes);
app.use('/api/v1/studio', contentStudioRoutes);

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Express AI Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'express-ai' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
