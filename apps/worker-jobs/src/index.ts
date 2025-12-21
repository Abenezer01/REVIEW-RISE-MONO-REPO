import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Worker Jobs Service is running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'worker-jobs' });
});

import { runVisibilityJob } from './jobs/visibility.job';

app.post('/jobs/compute-visibility', async (req, res) => {
    // Run async, don't wait for completion? Or wait?
    // For cron triggers (HTTP), usually better to wait if < timeout, or return 202 Accepted.
    // Computation might take long. Return 202.
    
    runVisibilityJob().catch(err => console.error('Job failed:', err));
    
    res.status(202).json({ message: 'Visibility computation job started' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
