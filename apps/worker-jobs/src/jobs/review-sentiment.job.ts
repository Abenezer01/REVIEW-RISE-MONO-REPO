import { reviewRepository } from '@platform/db';
import axios from 'axios';

interface ReviewAnalysisResult {
    sentiment: string;
    confidence: number;
    reasoning: string;
    emotions: string[];
    primaryEmotion: string;
    keywords: string[];
    topics: string[];
}

export const runReviewSentimentJob = async () => {
    console.log('Starting review sentiment analysis job...');
    try {
        // Fetch reviews that haven't been analyzed yet (sentiment is null)
        const unanalyzedReviews = await reviewRepository.findMany({
            where: {
                sentiment: null
            },
            take: 50, // Process in batches to avoid rate limits
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${unanalyzedReviews.length} unanalyzed reviews to process.`);

        if (unanalyzedReviews.length === 0) {
            console.log('No reviews to analyze. Job completed.');
            return { processed: 0, failed: 0 };
        }

        // Default to localhost:3002 (express-ai default port)
        const expressAiUrl = process.env.EXPRESS_AI_URL || 'http://localhost:3002';
        let processed = 0;
        let failed = 0;

        // Process reviews one at a time to avoid overwhelming the AI service
        for (const review of unanalyzedReviews) {
            try {
                console.log(`Analyzing review ${review.id}...`);

                // Call the AI service to analyze the review
                const response = await axios.post<ReviewAnalysisResult>(
                    `${expressAiUrl}/api/v1/reviews/analyze`,
                    {
                        content: review.content || '',
                        rating: review.rating
                    },
                    {
                        timeout: 30000 // 30 second timeout
                    }
                );

                const analysis = response.data;

                // Combine emotions and keywords into tags array
                const tags = [
                    ...analysis.emotions,
                    ...analysis.keywords
                ];

                // Update the review with analysis results
                await reviewRepository.update(review.id, {
                    sentiment: analysis.sentiment,
                    tags: tags,
                    aiSuggestions: {
                        confidence: analysis.confidence,
                        reasoning: analysis.reasoning,
                        primaryEmotion: analysis.primaryEmotion,
                        topics: analysis.topics,
                        analyzedAt: new Date().toISOString()
                    }
                });

                processed++;
                console.log(`✓ Review ${review.id} analyzed: ${analysis.sentiment} (${analysis.confidence}% confidence)`);

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                failed++;
                const message = error instanceof Error ? error.message : String(error);
                console.error(`✗ Failed to analyze review ${review.id}:`, message);

                // Continue processing other reviews even if one fails
                continue;
            }
        }

        console.log(`Review sentiment analysis job completed. Processed: ${processed}, Failed: ${failed}`);
        return { processed, failed };

    } catch (e) {
        console.error('Error in review sentiment analysis job:', e);
        throw e;
    }
};

/**
 * Re-process existing reviews (useful when algorithm is updated)
 * @param batchSize - Number of reviews to process per run
 */
export const reprocessReviews = async (batchSize: number = 50) => {
    console.log(`Starting review re-processing job (batch size: ${batchSize})...`);
    
    try {
        // Fetch reviews that were analyzed more than 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const reviewsToReprocess = await reviewRepository.findMany({
            where: {
                sentiment: { not: null },
                createdAt: { lt: thirtyDaysAgo }
            },
            take: batchSize,
            orderBy: {
                createdAt: 'asc' // Oldest first
            }
        });

        console.log(`Found ${reviewsToReprocess.length} reviews to re-process.`);

        if (reviewsToReprocess.length === 0) {
            console.log('No reviews to re-process. Job completed.');
            return { processed: 0, failed: 0 };
        }

        // Temporarily set sentiment to null to trigger re-analysis
        for (const review of reviewsToReprocess) {
            await reviewRepository.update(review.id, { sentiment: null });
        }

        // Run the standard analysis job
        return await runReviewSentimentJob();

    } catch (e) {
        console.error('Error in review re-processing job:', e);
        throw e;
    }
};
