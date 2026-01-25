import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Express Ad Rise Service is running', 200, { requestId: req.id }));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'ok', service: 'express-ad-rise' }, 'Service is healthy', 200, { requestId: req.id }));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
