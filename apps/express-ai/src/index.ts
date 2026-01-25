import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

import aiRoutes from './routes/ai.routes';
import contentStudioRoutes from './routes/content-studio.routes';

app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/ai/studio', contentStudioRoutes);

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Express AI Service is running', 200, { requestId: req.id }));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'ok', service: 'express-ai' }, 'Service is healthy', 200, { requestId: req.id }));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
