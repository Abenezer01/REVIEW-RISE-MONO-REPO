import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse } from '@platform/contracts';
import { requestIdMiddleware } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Express Ad Rise Service is running'));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ service: 'express-ad-rise' }, 'ok'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
