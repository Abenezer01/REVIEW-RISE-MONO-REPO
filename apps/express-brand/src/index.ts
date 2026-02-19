import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createSuccessResponse, SystemMessageCode } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-brand' });
});

import v1Routes from './routes/v1';
import uploadRoutes from './routes/v1/upload.routes';
import path from 'path';
import { publishingWorker } from './services/publishing-worker.service';

app.use('/api/v1', v1Routes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Express Brand Service is running', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'express-brand' }, 'Service is healthy', 200, { requestId: req.id }, SystemMessageCode.SUCCESS);
    res.status(response.statusCode).json(response);
});

app.use(errorHandler);

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);

    // Start background publishing worker
    publishingWorker.start();
});
