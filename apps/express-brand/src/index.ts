import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

import v1Routes from './routes/v1';
import { publishingWorker } from './services/publishing-worker.service';

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.json({ message: 'Express Brand Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'express-brand' });
});

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
    
    // Start background publishing worker
    publishingWorker.start();
});
