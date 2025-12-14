import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { prisma } from '@platform/db';
import { generateToken } from '@platform/auth';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.json({ message: 'Express Auth Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-auth' });
});

app.get('/db-test', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        res.json({ status: 'ok', userCount });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error });
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
        
        res.json({ 
            status: 'ok', 
            token,
            info: 'Token generated successfully using @platform/auth' 
        });
    } catch (error: any) {
        res.status(500).json({ error: 'RBAC test failed', details: error.message });
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
        
        res.json({ 
            status: 'ok', 
            token,
            info: 'Token generated successfully using @platform/auth' 
        });
    } catch (error: any) {
        res.status(500).json({ error: 'RBAC test failed', details: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        message: "The requested endpoint does not exist. Please check the URL and method.",
        requestedEndpoint: req.originalUrl
    });
});
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Auth service running on port ${PORT}`);
});
