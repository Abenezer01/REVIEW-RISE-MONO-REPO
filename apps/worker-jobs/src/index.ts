import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import { requestIdMiddleware, errorHandler } from '@platform/middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

app.use(cors());
app.use(requestIdMiddleware);
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    const response = createSuccessResponse(null, 'Worker Jobs Service is running', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.get('/health', (req, res) => {
    const response = createSuccessResponse({ service: 'worker-jobs' }, 'Service is healthy', 200, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

import { runVisibilityJob } from './jobs/visibility.job';
import { runRankTrackingJob } from './jobs/rank-tracking.job';
import { runAutoReplyJob } from './jobs/auto-reply.job';

app.post('/jobs/auto-reply', async (req, res) => {
    runAutoReplyJob()
        .then(() => console.log('Auto-reply job completed'))
        .catch(err => console.error('Auto-reply job failed:', err));
    
    const response = createSuccessResponse(null, 'Auto-reply job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.post('/jobs/compute-visibility', async (req, res) => {
    runVisibilityJob().catch(err => console.error('Job failed:', err));

    const response = createSuccessResponse(null, 'Visibility computation job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.post('/jobs/rank-tracking/daily', async (req, res) => {
    runRankTrackingJob()
        .then(result => console.log('Rank tracking job result:', result))
        .catch(err => console.error('Rank tracking job failed:', err))

    const response = createSuccessResponse(null, 'Rank tracking job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
})

import { brandRecommendationsJob } from './jobs/brand-recommendations.job';
import { visibilityPlanJob } from './jobs/visibility-plan.job';

app.post('/jobs/brand-recommendations', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        const errorResponse = createErrorResponse('jobId and businessId are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }

    brandRecommendationsJob(jobId, { businessId })
        .catch(err => console.error(`Brand recommendations job ${jobId} failed:`, err));

    const response = createSuccessResponse({ jobId }, 'Brand recommendations job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

app.post('/jobs/visibility-plan', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
        const errorResponse = createErrorResponse('jobId and businessId are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        return res.status(errorResponse.statusCode).json(errorResponse);
    }

    visibilityPlanJob(jobId, { businessId })
        .catch(err => console.error(`Visibility plan job ${jobId} failed:`, err));

    const response = createSuccessResponse({ jobId }, 'Visibility plan job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

import { computeBrandScoresJob } from './jobs/brand-scores.job';

app.post('/jobs/brand-scores', async (req, res) => {
    const { jobId, businessId } = req.body;
    if (!jobId || !businessId) {
         const errorResponse = createErrorResponse('jobId and businessId are required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
         return res.status(errorResponse.statusCode).json(errorResponse);
    }

    computeBrandScoresJob(jobId, { businessId })
        .catch(err => console.error(`Brand scores job ${jobId} failed:`, err));

    const response = createSuccessResponse({ jobId }, 'Brand scores job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

import { runReviewSyncJob } from './jobs/review-sync.job';

app.post('/jobs/review-sync', async (req, res) => {
    runReviewSyncJob()
        .then(() => console.log('Review sync job finished'))
        .catch(err => console.error('Review sync job failed:', err));

    const response = createSuccessResponse(null, 'Review sync job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
});

import { runReviewSentimentJob, reprocessReviews } from './jobs/review-sentiment.job';
import { refreshSocialTokensJob } from './jobs/refresh-social-tokens.job';

app.post('/jobs/review-sentiment', async (req, res) => {
    const { reprocess = false, batchSize = 50 } = req.body;
    
    if (reprocess) {
        reprocessReviews(batchSize)
            .then(result => console.log('Review sentiment re-processing finished:', result))
            .catch(err => console.error('Review sentiment re-processing failed:', err));
        const response = createSuccessResponse(null, 'Review sentiment re-processing job started', 202, { requestId: req.id });
        res.status(response.statusCode).json(response);
    } else {
        runReviewSentimentJob()
            .then(result => console.log('Review sentiment analysis finished:', result))
            .catch(err => console.error('Review sentiment analysis failed:', err));
        const response = createSuccessResponse(null, 'Review sentiment analysis job started', 202, { requestId: req.id });
        res.status(response.statusCode).json(response);
    }
});

app.post('/jobs/refresh-social-tokens', async (req, res) => {
    refreshSocialTokensJob()
        .then(() => console.log('Social token refresh job completed'))
        .catch(err => console.error('Social token refresh job failed:', err));

    const response = createSuccessResponse(null, 'Social token refresh job started', 202, { requestId: req.id });
    res.status(response.statusCode).json(response);
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

app.use(errorHandler);

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
