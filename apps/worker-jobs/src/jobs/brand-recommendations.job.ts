import { GoogleGenerativeAI } from '@google/generative-ai';
import { repositories, Prisma } from '@platform/db';
import { RecommendationsOutputSchema, RECOMMENDATION_PROMPTS } from '@platform/contracts';

/**
 * Brand Recommendations Job
 * 
 * Generates AI-powered recommendations for a brand.
 * This is a background job that:
 * 1. Fetches necessary context (Brand DNA, Competitors, Scores)
 * 2. Generates recommendations using Gemini AI
 * 3. Saves recommendations to the database
 * 4. Updates job status
 */
export const brandRecommendationsJob = async (jobId: string, payload: { businessId: string }) => {
    const { businessId } = payload;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    try {
        // Update job status to in_progress
        await repositories.job.updateStatus(jobId, 'in_progress');

        // Gather context
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);
        const competitors = await repositories.competitor.findMany({ where: { businessId }, take: 5 });
        const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);

        const categories = ['search', 'local', 'social', 'reputation', 'conversion', 'content'] as const;
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        for (const category of categories) {
            try {
                const prompt = RECOMMENDATION_PROMPTS[category]
                    .replace('{brandDNA}', JSON.stringify(brandDNA || {}))
                    .replace('{currentMetrics}', JSON.stringify(latestScore || {}))
                    .replace('{competitorInsights}', JSON.stringify(competitors));

                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: 'application/json',
                    },
                });

                const responseText = result.response.text();
                const parsed = JSON.parse(responseText);
                const validated = RecommendationsOutputSchema.parse(parsed);

                // Normalize inputs
                const recommendations = validated.recommendations.map(r => ({
                    ...r,
                    category
                }));

                // Save recommendations
                for (const rec of recommendations) {
                    // Calculate priority score
                    const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[rec.impact as string] || 1;
                    const effortScore = { low: 3, medium: 2, high: 1 }[rec.effort as string] || 1;
                    const priorityScore = (impactScore * rec.confidence) / effortScore;

                    await repositories.brandRecommendation.create({
                        businessId,
                        category: rec.category,
                        title: rec.title,
                        description: rec.description,
                        why: rec.why,
                        steps: rec.steps,
                        impact: rec.impact,
                        effort: rec.effort,
                        confidence: rec.confidence,
                        priorityScore,
                        kpiTarget: rec.kpiTarget ?? Prisma.JsonNull,
                        status: 'open',
                    } as any);
                }

            } catch (err) {
                console.error(`Error generating recommendations for category ${category}:`, err);
                // Continue with other categories
            }
        }

        // Update job status to completed
        await repositories.job.updateStatus(jobId, 'completed', {
            completedAt: new Date(),
            result: { success: true }
        });

    } catch (error) {
        console.error('Job failed:', error);
        await repositories.job.updateStatus(jobId, 'failed', {
            failedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
    }
};
