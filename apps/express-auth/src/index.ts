import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { prisma } from '@platform/db';
import { generateToken } from '@platform/auth';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

app.get('/', (req, res) => {
    const response = createSuccessResponse(
        null,
        'Express Auth Service is running',
        200,
        { requestId: req.id }
    );
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse(
        { service: 'express-auth' },
        'Service is healthy',
        200,
        { requestId: req.id }
    );
    res.status(response.statusCode).json(response);
});

app.get('/db-test', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        const response = createSuccessResponse(
            { userCount },
            'Database connection successful',
            200,
            { requestId: req.id }
        );
        res.status(response.statusCode).json(response);
    } catch (error) {
        console.error('Database connection error:', error);
        const response = createErrorResponse(
            'Database connection failed',
            ErrorCode.INTERNAL_SERVER_ERROR,
            500,
            error,
            req.id
        );
        res.status(response.statusCode).json(response);
    }
});

// Test RBAC logic
app.get('/rbac-test', async (req, res) => {
    try {
        // Mock data
        const userId = 'test-user-' + Date.now();
        const email = 'test@example.com';

        // NOTE: In a real flow, we'd ensure User and Business exist first. 
        // This is just to demonstrate type usage and import success.
        // We'll catch errors if DB constraints fail.
        
        // Let's just generate a token
        const token = await generateToken({ id: userId, email });
        
        const response = createSuccessResponse(
            { token },
            'Token generated successfully using @platform/auth',
            200,
            { requestId: req.id }
        );
        res.status(response.statusCode).json(response);
    } catch (error: any) {
        const response = createErrorResponse(
            'RBAC test failed',
            ErrorCode.INTERNAL_SERVER_ERROR,
            500,
            error.message,
            req.id
        );
        res.status(response.statusCode).json(response);
    }
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Auth service running on port ${PORT}`);
});
