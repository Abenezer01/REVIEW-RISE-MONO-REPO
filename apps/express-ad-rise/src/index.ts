import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import blueprintRoutes from './routes/blueprint.routes';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
import { requestContext } from '@platform/utils/apiClient';

app.use(express.json());

// Context Middleware
app.use((req, res, next) => {
    const store = new Map<string, any>();
    const authHeader = req.headers.authorization;
    if (authHeader) {
        console.log('[AdRise Middleware] Received Auth Header:', authHeader.substring(0, 20) + '...');
        store.set('authToken', authHeader);
    } else {
        console.warn('[AdRise Middleware] No Auth Header received');
    }
    requestContext.run(store, () => {
        next();
    });
});

// Routes
app.use('/api/v1/blueprint', blueprintRoutes);

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Express Ad Rise Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'express-ad-rise' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
