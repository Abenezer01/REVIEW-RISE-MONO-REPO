import { repositories } from '@platform/db';
import axios from 'axios';

const EXPRESS_AI_URL = process.env.EXPRESS_AI_URL || 'http://localhost:3002';
const EXPRESS_REVIEWS_URL = process.env.EXPRESS_REVIEWS_URL || 'http://localhost:3001';

/**
 * Auto-Reply Job
 * 
 * Scans for new reviews and automatically generates/posts AI replies
 * based on business-specific auto-reply settings.
 */
export const runAutoReplyJob = async () => {
    console.log('[AutoReplyJob] Starting auto-reply processing...');
    
    try {
        // 1. Find reviews that haven't been processed for auto-reply yet
        // We look for reviews where replyStatus is null and there's no manual response yet
        const pendingProcessing = await repositories.review.findMany({
            where: {
                replyStatus: null,
                respondedAt: null,
                response: null
            } as any,
            take: 50 // Process in batches
        });

        console.log(`[AutoReplyJob] Found ${pendingProcessing.length} reviews to process.`);

        for (const review of pendingProcessing) {
            try {
                await processReviewAutoReply(review);
            } catch (err) {
                console.error(`[AutoReplyJob] Failed to process review ${review.id}:`, err);
            }
        }

        // 2. Find reviews that are 'approved' and need to be posted
        const approvedReviews = await repositories.review.findMany({
            where: {
                replyStatus: 'approved',
                respondedAt: null
            } as any,
            take: 50
        });

        console.log(`[AutoReplyJob] Found ${approvedReviews.length} approved reviews to post.`);

        for (const review of approvedReviews) {
            try {
                await postApprovedReply(review);
            } catch (err) {
                console.error(`[AutoReplyJob] Failed to post approved reply for review ${review.id}:`, err);
            }
        }

        console.log('[AutoReplyJob] Auto-reply job completed.');
    } catch (error) {
        console.error('[AutoReplyJob] Job failed:', error);
    }
};

async function postApprovedReply(review: any) {
    if (!review.response) {
        console.error(`[AutoReplyJob] Cannot post approved reply for review ${review.id} - no response text.`);
        return;
    }

    console.log(`[AutoReplyJob] Posting approved reply for review ${review.id}...`);

    try {
        // Call express-reviews API to post the reply
        await axios.post(`${EXPRESS_REVIEWS_URL}/api/v1/reviews/${review.id}/reply`, {
            comment: review.response
        });
        console.log(`[AutoReplyJob] Successfully posted reply for review ${review.id}.`);
    } catch (err: any) {
        console.error(`[AutoReplyJob] Failed to post reply for review ${review.id}:`, err.response?.data || err.message);
        await repositories.review.update(review.id, {
            replyError: `Posting failed: ${err.response?.data?.error || err.message}`
        } as any);
    }
}

async function processReviewAutoReply(review: any) {
    const businessId = review.businessId;

    // 1. Fetch Brand Profile and Auto-Reply Settings
    const brandProfile = await repositories.brandProfile.findFirst({
        where: { businessId }
    }) as any;

    if (!brandProfile || !brandProfile.autoReplySettings) {
        // Mark as skipped if no settings found
        await repositories.review.update(review.id, {
            replyStatus: 'skipped',
            replyError: 'No auto-reply settings found for business'
        } as any);
        return;
    }

    const settings = brandProfile.autoReplySettings as any;

    if (!settings.enabled) {
        await repositories.review.update(review.id, {
            replyStatus: 'skipped',
            replyError: 'Auto-reply disabled for business'
        } as any);
        return;
    }

    // 2. Check Delay Safeguard (Task 4.5.4)
    const publishedAt = new Date(review.publishedAt);
    const now = new Date();
    const delayHours = settings.delayHours || 0;
    const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSincePublished < delayHours) {
        console.log(`[AutoReplyJob] Skipping review ${review.id} - waiting for ${delayHours}h delay (${hoursSincePublished.toFixed(1)}h elapsed)`);
        return; // Don't mark as skipped, let it be picked up in next run
    }

    // 3. Check Daily Limit Safeguard (Task 4.5.4) - Per Location
    const maxRepliesPerDay = settings.maxRepliesPerDay || 50;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const repliesToday = await repositories.review.count({
        where: {
            businessId,
            locationId: review.locationId,
            replyStatus: { in: ['approved', 'posted'] },
            updatedAt: { gte: today }
        }
    } as any);

    if (repliesToday >= maxRepliesPerDay) {
        await repositories.review.update(review.id, {
            replyStatus: 'skipped',
            replyError: `Daily auto-reply limit reached for this location (${repliesToday}/${maxRepliesPerDay})`
        } as any);
        return;
    }

    // 4. Check Rules (Rating/Sentiment)
    const rating = review.rating;
    const isPositive = rating >= 4;
    const isNeutral = rating === 3;
    const isNegative = rating <= 2;

    let shouldReply = false;
    if (settings.mode === 'positive' && isPositive) {
        shouldReply = true;
    } else if (settings.mode === 'positive_neutral' && (isPositive || isNeutral)) {
        shouldReply = true;
    } else if (isNegative) {
        // We always process negative reviews if enabled, but they might need manual approval
        shouldReply = true;
    }

    if (!shouldReply) {
        await repositories.review.update(review.id, {
            replyStatus: 'skipped',
            replyError: `Review rating (${rating}) does not match auto-reply mode (${settings.mode})`
        } as any);
        return;
    }

    // 3. Generate AI Reply
    console.log(`[AutoReplyJob] Generating AI reply for review ${review.id} (Rating: ${rating})`);
    
    try {
        const aiResponse = await axios.post(`${EXPRESS_AI_URL}/api/v1/ai/generate-review-replies`, {
            reviewId: review.id,
            options: {
                // We can use the first descriptor as the tone if available
                tonePreset: (brandProfile.tone as any)?.descriptors?.[0] || 'Professional'
            }
        });

        const { suggestedReply, variations, analysis } = aiResponse.data;

        // 4. Determine Status (Approved vs Pending Approval)
        let finalStatus = 'pending_approval';

        if (isNegative && settings.manualNegativeApproval) {
            finalStatus = 'pending_approval';
        } else if (isPositive || isNeutral) {
            // For positive/neutral, we can auto-approve if enabled
            // (Assuming 'enabled' means auto-post for positive/neutral unless negative manual approval is ON)
            finalStatus = 'approved';
        }

        // 5. Update Review
        await repositories.review.update(review.id, {
            aiSuggestions: {
                suggestedReply,
                variations,
                analysis
            },
            replyStatus: finalStatus,
            // If auto-approved, we set the response but don't mark as respondedAt yet 
            // until the actual posting job picks it up and sends it to the platform.
            response: finalStatus === 'approved' ? suggestedReply : null
        } as any);

        console.log(`[AutoReplyJob] Review ${review.id} processed. Status: ${finalStatus}`);

    } catch (err: any) {
        console.error(`[AutoReplyJob] AI Generation failed for review ${review.id}:`, err.message);
        await repositories.review.update(review.id, {
            replyStatus: 'failed',
            replyError: `AI Generation failed: ${err.message}`
        } as any);
    }
}
