import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';

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
import { runAutoReplyJob } from './jobs/auto-reply.job';

app.post('/jobs/auto-reply', async (req, res) => {
    runAutoReplyJob()
        .then(() => console.log('Auto-reply job completed'))
        .catch(err => console.error('Auto-reply job failed:', err));
    
    res.status(202).json({ message: 'Auto-reply job started' });
});

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

import { brandRecommendationsJob } from './jobs/brand-recommendations.job';
import { visibilityPlanJob } from './jobs/visibility-plan.job';

app.post('/jobs/brand-recommendations', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        return res.status(400).json({ error: 'jobId and businessId are required' });
    }

    brandRecommendationsJob(jobId, { businessId })
        .catch(err => console.error(`Brand recommendations job ${jobId} failed:`, err));

    res.status(202).json({ message: 'Brand recommendations job started', jobId });
});

app.post('/jobs/visibility-plan', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        return res.status(400).json({ error: 'jobId and businessId are required' });
    }

    visibilityPlanJob(jobId, { businessId })
        .catch(err => console.error(`Visibility plan job ${jobId} failed:`, err));

    res.status(202).json({ message: 'Visibility plan job started', jobId });
});

import { computeBrandScoresJob } from './jobs/brand-scores.job';

app.post('/jobs/brand-scores', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) { // jobId optional if we want internal use? No, let's require it for consistency with job table
         return res.status(400).json({ error: 'jobId and businessId are required' });
    }

    computeBrandScoresJob(jobId, { businessId })
        .catch(err => console.error(`Brand scores job ${jobId} failed:`, err));

    res.status(202).json({ message: 'Brand scores job started', jobId });
});

import { runReviewSyncJob } from './jobs/review-sync.job';

app.post('/jobs/review-sync', async (req, res) => {
    runReviewSyncJob()
        .then(() => console.log('Review sync job finished'))
        .catch(err => console.error('Review sync job failed:', err));
    res.status(202).json({ message: 'Review sync job started' });
});

import { runReviewSentimentJob, reprocessReviews } from './jobs/review-sentiment.job';
import { refreshSocialTokensJob } from './jobs/refresh-social-tokens.job';

app.post('/jobs/review-sentiment', async (req, res) => {
    const { reprocess = false, batchSize = 50 } = req.body;
    
    if (reprocess) {
        reprocessReviews(batchSize)
            .then(result => console.log('Review sentiment re-processing finished:', result))
            .catch(err => console.error('Review sentiment re-processing failed:', err));
        res.status(202).json({ message: 'Review sentiment re-processing job started' });
    } else {
        runReviewSentimentJob()
            .then(result => console.log('Review sentiment analysis finished:', result))
            .catch(err => console.error('Review sentiment analysis failed:', err));
        res.status(202).json({ message: 'Review sentiment analysis job started' });
    }
});

app.post('/jobs/refresh-social-tokens', async (req, res) => {
    refreshSocialTokensJob()
        .then(() => console.log('Social token refresh job completed'))
        .catch(err => console.error('Social token refresh job failed:', err));
    res.status(202).json({ message: 'Social token refresh job started' });
});

const scheduleDaily = (hour: number = 2) => {
    const now = new Date()
    const next = new Date(now)
    next.setHours(hour, 0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
    const delay = next.getTime() - now.getTime()
    setTimeout(() => {
        runRankTrackingJob().catch(err => console.error('Scheduled rank job failed:', err))
        runReviewSyncJob().catch(err => console.error('Scheduled review sync job failed:', err))
        runReviewSentimentJob().catch(err => console.error('Scheduled review sentiment job failed:', err))
        setInterval(() => {
            runRankTrackingJob().catch(err => console.error('Scheduled rank job failed:', err))
            runReviewSyncJob().catch(err => console.error('Scheduled review sync job failed:', err))
            runReviewSentimentJob().catch(err => console.error('Scheduled review sentiment job failed:', err))
        }, 24 * 60 * 60 * 1000)
    }, delay)
}

// Schedule social token refresh every 6 hours
const scheduleSocialTokenRefresh = () => {
    // Run immediately on startup
    refreshSocialTokensJob().catch(err => console.error('Initial social token refresh failed:', err));
    
    // Then run every 6 hours
    setInterval(() => {
        refreshSocialTokensJob().catch(err => console.error('Scheduled social token refresh failed:', err));
    }, 6 * 60 * 60 * 1000); // 6 hours
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Create health check file for Docker
    try {
        const healthFile = path.join(os.tmpdir(), 'worker-healthy');
        fs.writeFileSync(healthFile, 'ok');
    } catch (e) {
        console.warn('Could not write health check file:', e);
    }
    scheduleDaily(2);
    scheduleSocialTokenRefresh();
});
