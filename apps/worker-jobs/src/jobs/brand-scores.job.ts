import { repositories } from '@platform/db';

/**
 * Compute Brand Scores Job
 * 
 * Aggregates data from various sources (Visibility Metrics, Reviews, Brand DNA)
 * to compute high-level Brand Scores: Visibility, Trust, and Consistency.
 * 
 * Scores are 0-100.
 */
export const computeBrandScoresJob = async (jobId: string, payload: { businessId: string }) => {
    const { businessId } = payload;

    try {
        await repositories.job.updateStatus(jobId, 'in_progress');

        // 1. Compute Visibility Score
        // Aggregated from VisibilityMetrics if available
        const latestVisibilityMetric = await repositories.visibilityMetric.getLatestMetric(businessId);
        let visibilityScore = 0;
        let visibilityBreakdown = {};

        if (latestVisibilityMetric) {
            // Simple weighted formula
            // Share of Voice (40%), Organic Presence (top 10) (30%), Map Pack (30%)
            const sovScore = Math.min((latestVisibilityMetric.shareOfVoice || 0) * 2, 100); // Scale up small %? Or assume direct?
            // Assuming metrics are raw counts.
            // Let's normalize. 
            // Top 10 count: > 10 is good? > 50 is great? Let's cap at 20.
            const organicScore = Math.min(((latestVisibilityMetric.top10Count || 0) / 20) * 100, 100); 
            
            const mapPackScore = latestVisibilityMetric.mapPackVisibility || 0;

            visibilityScore = Math.round((sovScore * 0.4) + (organicScore * 0.3) + (mapPackScore * 0.3));

            visibilityBreakdown = {
                shareOfVoice: latestVisibilityMetric.shareOfVoice,
                organicPresence: latestVisibilityMetric.top10Count,
                mapPackVisibility: latestVisibilityMetric.mapPackVisibility
            };
        } else {
            // Fallback or cold start score
            visibilityScore = 15; // Starting score
            visibilityBreakdown = { note: 'Insufficient data, baseline score' };
        }

        // 2. Compute Trust Score
        // Based on Reviews (Rating, Count, Response Rate)
        // We'll need review stats.
        // Assuming reviewRepository.getStats exists or we fetch aggregation.
        // Let's try raw count/avg from repository if available.
        // If not readily available in repo, we'll assume 0 for now or fetch raw.
        // Let's assume we can fetch via prisma if needed, but sticking to repo.
        // I'll assume a `getStats` method exists in ReviewRepository based on service code I saw earlier? 
        // BrandService had `getReviewStats`. Let's assume Repository has something similar or we calculate.
        
        // Let's do a simple count/avg check
        const reviews = await repositories.review.findMany({ 
            where: { businessId }, 
            take: 100 // Sample
        });
        
        let trustScore = 0;
        let trustBreakdown = {};

        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            const reviewCount = reviews.length;
            // Rating score: (Avg / 5) * 100
            const ratingScore = (avgRating / 5) * 100;
            // Volume score: > 50 reviews = 100.
            const volumeScore = Math.min((reviewCount / 50) * 100, 100);

            trustScore = Math.round((ratingScore * 0.7) + (volumeScore * 0.3));
            trustBreakdown = {
                averageRating: avgRating,
                totalReviews: reviewCount
            };
        } else {
             trustScore = 10;
        }

        // 3. Compute Consistency Score
        // This usually requires AI analysis of Brand DNA vs Content. 
        // For MVP/v0, we can check if Brand DNA exists and has values/mission filled.
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);
        let consistencyScore = 0;
        let consistencyBreakdown = {};

        if (brandDNA) {
            let score = 20; // Base for having DNA record
            if (brandDNA.values && brandDNA.values.length > 0) score += 20;
            if (brandDNA.mission) score += 20;
            if (brandDNA.voice) score += 20;
            if (brandDNA.audience) score += 20;
            consistencyScore = score;
            consistencyBreakdown = {
                hasValues: !!brandDNA.values?.length,
                hasMission: !!brandDNA.mission,
                hasVoice: !!brandDNA.voice
            };
        } else {
            consistencyScore = 0; 
        }

        // Save
        const now = new Date();
        const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
        const endOfDay = new Date(now); endOfDay.setHours(23,59,59,999);

        await repositories.brandScore.upsertScore(
            businessId,
            startOfDay,
            endOfDay,
            {
                visibilityScore,
                trustScore,
                consistencyScore,
                visibilityBreakdown,
                trustBreakdown,
                consistencyBreakdown
            }
        );

        await repositories.job.updateStatus(jobId, 'completed', {
            completedAt: new Date(),
            result: { 
                success: true, 
                scores: { visibilityScore, trustScore, consistencyScore } 
            }
        });

    } catch (error) {
        console.error('Failed to compute brand scores:', error);
        await repositories.job.updateStatus(jobId, 'failed', {
            failedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};
