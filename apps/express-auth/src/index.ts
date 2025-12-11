import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { prisma } from '@platform/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});
