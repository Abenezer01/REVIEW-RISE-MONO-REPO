import { GoogleGenerativeAI } from '@google/generative-ai';
import { repositories, Prisma } from '@platform/db';
import { VisibilityPlanSchema, VISIBILITY_PLAN_PROMPT } from '@platform/contracts';

/**
 * Visibility Plan Job
 * 
 * Generates a 30-day visibility plan using AI.
 */
export const visibilityPlanJob = async (jobId: string, payload: { businessId: string }) => {
    const { businessId } = payload;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    try {
        await repositories.job.updateStatus(jobId, 'in_progress');

        // Gather context
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);
        const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);

        // Get top priority recommendations
        const topRecs = await repositories.brandRecommendation.getTopPriority(businessId, 5);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const prompt = VISIBILITY_PLAN_PROMPT
            .replace('{brandDNA}', JSON.stringify(brandDNA || {}))
            .replace('{visibilityScore}', latestScore?.visibilityScore?.toString() || '0')
            .replace('{trustScore}', latestScore?.trustScore?.toString() || '0')
            .replace('{consistencyScore}', latestScore?.consistencyScore?.toString() || '0')
            .replace('{topRecommendations}', JSON.stringify(topRecs));

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        const validated = VisibilityPlanSchema.parse(parsed);

        // Save report
        // We'll save this as a 'Plan' type report in the Report repository
        // Assuming Report model supports 'type' field which might be generic or specific
        // Since we created ReportRepository earlier but didn't modify Schema to add specific Plan fields,
        // we'll store the JSON in `data` field of Report.

        await repositories.report.create({
            businessId,
            title: validated.title,
            type: 'visibility_plan_30d',
            data: validated as any, // Store the full validated plan object
            format: 'json',
            generatedAt: new Date(),
        } as any);

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
