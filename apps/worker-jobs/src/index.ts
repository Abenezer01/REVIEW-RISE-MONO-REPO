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
import { runRankTrackingJob } from './jobs/rank-tracking.job';

app.post('/jobs/compute-visibility', async (req, res) => {
    // Run async, don't wait for completion? Or wait?
    // For cron triggers (HTTP), usually better to wait if < timeout, or return 202 Accepted.
    // Computation might take long. Return 202.
    
    runVisibilityJob().catch(err => console.error('Job failed:', err));
    
    res.status(202).json({ message: 'Visibility computation job started' });
});

app.post('/jobs/rank-tracking/daily', async (req, res) => {
    runRankTrackingJob()
        .then(result => console.log('Rank tracking job result:', result))
        .catch(err => console.error('Rank tracking job failed:', err))
    res.status(202).json({ message: 'Rank tracking job started' })
})

const scheduleDaily = (hour: number = 2) => {
    const now = new Date()
    const next = new Date(now)
    next.setHours(hour, 0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const delay = next.getTime() - now.getTime()
    setTimeout(() => {
        runRankTrackingJob().catch(err => console.error('Scheduled rank job failed:', err))
        setInterval(() => {
            runRankTrackingJob().catch(err => console.error('Scheduled rank job failed:', err))
        }, 24 * 60 * 60 * 1000)
    }, delay)
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    scheduleDaily(2)
});
