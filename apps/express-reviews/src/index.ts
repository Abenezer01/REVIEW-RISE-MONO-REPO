import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import routes from './routes/v1';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Express Reviews Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'express-reviews' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
