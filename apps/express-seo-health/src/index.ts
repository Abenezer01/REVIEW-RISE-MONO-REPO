import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3012;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.json({ 
        message: 'SEO Health Checker Service is running',
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'express-seo-health',
        timestamp: new Date().toISOString()
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'The requested endpoint does not exist. Please check the URL and method.',
        requestedEndpoint: req.originalUrl
    });
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`SEO Health Checker Service running on port ${PORT}`);
});
