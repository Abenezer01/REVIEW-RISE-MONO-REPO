import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import helmet from 'helmet';
import routes from './routes/v1';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(helmet());

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

// Routes
app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Express Reviews Service is running', 200, { requestId: req.id }));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'ok', service: 'express-reviews' }, 'Service is healthy', 200, { requestId: req.id }));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
