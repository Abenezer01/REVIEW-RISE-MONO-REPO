import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import v1Routes from './routes/v1';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(requestIdMiddleware);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Mount routes at root to align with Nginx proxy behavior (which strips /api/seo/ but doesn't rewrite to /api/v1)
app.use('/', v1Routes);
// Also keep /api/v1 for internal consistency/direct access
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    const response = createSuccessResponse({ version: '1.0.0' }, 'SEO Health Checker Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'express-seo-health' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.use((req, res) => {
    const response = createErrorResponse(
        'The requested endpoint does not exist. Please check the URL and method.',
        ErrorCode.NOT_FOUND,
        404,
        { requestedEndpoint: req.originalUrl },
        req.id
    );
    res.status(response.statusCode).json(response);
});

app.use(errorHandler);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SEO Health Checker Service running on port ${PORT}`);
});
