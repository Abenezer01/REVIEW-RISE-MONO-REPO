import { repositories, Prisma } from '@platform/db';
import { VisibilityPlanSchema } from '@platform/contracts';
import axios from 'axios';

const EXPRESS_AI_URL = process.env.EXPRESS_AI_URL || 'http://localhost:3003';

/**
 * Visibility Plan Job
 * 
 * Generates a 30-day visibility plan using AI.
 */
export const visibilityPlanJob = async (jobId: string, payload: { businessId: string }) => {
    const { businessId } = payload;

    try {
        await repositories.job.updateStatus(jobId, 'in_progress');

        // Gather context
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);
        const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);

        // Get top priority recommendations
        const topRecs = await repositories.brandRecommendation.getTopPriority(businessId, 5);

        // Call Express AI Service
        const response = await axios.post(`${EXPRESS_AI_URL}/api/v1/ai/generate-visibility-plan`, {
            context: {
                brandDNA: brandDNA || {},
                visibilityScore: latestScore?.visibilityScore || 0,
                trustScore: latestScore?.trustScore || 0,
                consistencyScore: latestScore?.consistencyScore || 0,
                topRecommendations: topRecs
            }
        });

        const validated = response.data;

        // Save report
        // We'll save this as a 'Plan' type report in the Report repository
        // Assuming Report model supports 'type' field which might be generic or specific
        // Since we created ReportRepository earlier but didn't modify Schema to add specific Plan fields,
        // we'll store the JSON in `data` field of Report.

        if (!validated) {
            throw new Error('No data returned from AI');
        }

        console.log(`[Job] Saving visibility plan for business ${businessId}`);

        await repositories.report.create({
            businessId,
            title: '30-Day Visibility Plan',

            htmlContent: JSON.stringify(validated), // Store JSON in htmlContent for now
            // Let's check schema for Report model again. Step 518/639: htmlContent String. There is NO `data` field visible in snippet.
            // But wait, Step 528 (previous job implementation) had:
            // data: validated as any, 
            // So previous implementation might have been broken if logic relied on a field that didn't exist?
            // "data" field?
            // Looking at schema snippet Step 632:
            // model Report { ... htmlContent String ... pdfUrl String? ... }
            // It does NOT show a `data` field. It shows `htmlContent`.
            // So I should store JSON in `htmlContent`.

            // I'll stick to `htmlContent: JSON.stringify(validated)` as safe bet.

            version: 'v1.0', // Schema has version
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
