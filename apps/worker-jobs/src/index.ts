import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { requestIdMiddleware } from './middleware/request-id';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestIdMiddleware);

app.get('/', (req, res) => {
    res.json(createSuccessResponse(null, 'Worker Jobs Service is running', 200, { requestId: req.id }));
});

app.get('/health', (req, res) => {
    res.json(createSuccessResponse({ status: 'ok', service: 'worker-jobs' }, 'Service is healthy', 200, { requestId: req.id }));
});

import { runVisibilityJob } from './jobs/visibility.job';
import { runRankTrackingJob } from './jobs/rank-tracking.job';
import { runAutoReplyJob } from './jobs/auto-reply.job';

app.post('/jobs/auto-reply', async (req, res) => {
    runAutoReplyJob()
        .then(() => console.log('Auto-reply job completed'))
        .catch(err => console.error('Auto-reply job failed:', err));
    
    res.status(202).json(createSuccessResponse(null, 'Auto-reply job started', 202, { requestId: req.id }));
});

app.post('/jobs/compute-visibility', async (req, res) => {
    runVisibilityJob().catch(err => console.error('Job failed:', err));
    res.status(202).json(createSuccessResponse(null, 'Visibility computation job started', 202, { requestId: req.id }));
});

app.post('/jobs/rank-tracking/daily', async (req, res) => {
    runRankTrackingJob()
        .then(result => console.log('Rank tracking job result:', result))
        .catch(err => console.error('Rank tracking job failed:', err))
    res.status(202).json(createSuccessResponse(null, 'Rank tracking job started', 202, { requestId: req.id }));
})

import { brandRecommendationsJob } from './jobs/brand-recommendations.job';
import { visibilityPlanJob } from './jobs/visibility-plan.job';

app.post('/jobs/brand-recommendations', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        return res.status(400).json(createErrorResponse('jobId and businessId are required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id));
    }

    brandRecommendationsJob(jobId, { businessId })
        .catch(err => console.error(`Brand recommendations job ${jobId} failed:`, err));

    res.status(202).json(createSuccessResponse({ jobId }, 'Brand recommendations job started', 202, { requestId: req.id }));
});

app.post('/jobs/visibility-plan', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        return res.status(400).json(createErrorResponse('jobId and businessId are required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id));
    }

    visibilityPlanJob(jobId, { businessId })
        .catch(err => console.error(`Visibility plan job ${jobId} failed:`, err));

    res.status(202).json(createSuccessResponse({ jobId }, 'Visibility plan job started', 202, { requestId: req.id }));
});

import { computeBrandScoresJob } from './jobs/brand-scores.job';

app.post('/jobs/brand-scores', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
         return res.status(400).json(createErrorResponse('jobId and businessId are required', ErrorCode.VALIDATION_ERROR, 400, undefined, req.id));
    }

    computeBrandScoresJob(jobId, { businessId })
        .catch(err => console.error(`Brand scores job ${jobId} failed:`, err));

    res.status(202).json(createSuccessResponse({ jobId }, 'Brand scores job started', 202, { requestId: req.id }));
});

import { runReviewSyncJob } from './jobs/review-sync.job';

app.post('/jobs/review-sync', async (req, res) => {
    runReviewSyncJob()
        .then(() => console.log('Review sync job finished'))
        .catch(err => console.error('Review sync job failed:', err));
    res.status(202).json(createSuccessResponse(null, 'Review sync job started', 202, { requestId: req.id }));
});

import { runReviewSentimentJob, reprocessReviews } from './jobs/review-sentiment.job';
import { refreshSocialTokensJob } from './jobs/refresh-social-tokens.job';

app.post('/jobs/review-sentiment', async (req, res) => {
    const { reprocess = false, batchSize = 50 } = req.body;
    
    if (reprocess) {
        reprocessReviews(batchSize)
            .then(result => console.log('Review sentiment re-processing finished:', result))
            .catch(err => console.error('Review sentiment re-processing failed:', err));
        res.status(202).json(createSuccessResponse(null, 'Review sentiment re-processing job started', 202, { requestId: req.id }));
    } else {
        runReviewSentimentJob()
            .then(result => console.log('Review sentiment analysis finished:', result))
            .catch(err => console.error('Review sentiment analysis failed:', err));
        res.status(202).json(createSuccessResponse(null, 'Review sentiment analysis job started', 202, { requestId: req.id }));
    }
});

app.post('/jobs/refresh-social-tokens', async (req, res) => {
    refreshSocialTokensJob()
        .then(() => console.log('Social token refresh job completed'))
        .catch(err => console.error('Social token refresh job failed:', err));
    res.status(202).json(createSuccessResponse(null, 'Social token refresh job started', 202, { requestId: req.id }));
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

const scheduleSocialTokenRefresh = () => {
    refreshSocialTokensJob().catch(err => console.error('Initial social token refresh failed:', err));
    
    setInterval(() => {
        refreshSocialTokensJob().catch(err => console.error('Scheduled social token refresh failed:', err));
    }, 6 * 60 * 60 * 1000);
}

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${PORT}`);
    try {
        const healthFile = path.join(os.tmpdir(), 'worker-healthy');
        fs.writeFileSync(healthFile, 'ok');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('Could not write health check file:', e);
    }
    scheduleDaily(2);
    scheduleSocialTokenRefresh();
});
