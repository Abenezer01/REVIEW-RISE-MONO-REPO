import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecommendationsOutputSchema, RECOMMENDATION_PROMPTS } from '@platform/contracts';
import { repositories, Prisma } from '@platform/db';

export class RecommendationGeneratorService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    /**
     * Generates recommendations for a specific category using Gemini AI
     */
    async generateRecommendations(
        businessId: string,
        category: 'search' | 'local' | 'social' | 'reputation' | 'conversion' | 'content'
    ) {
        // Gather context
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);
        const brandProfile = await repositories.brandProfile.findByBusinessId(businessId);

        // We access delegate directly for limit if needed, or use base repo method
        // Since base repo findMany accepts options, we use that
        const competitors = await repositories.competitor.findMany({
            where: { businessId },
            take: 5
        });

        const latestScore = await repositories.brandScore.findLatestByBusinessId(businessId);

        // Build prompt
        const prompt = RECOMMENDATION_PROMPTS[category]
            .replace('{brandDNA}', JSON.stringify(brandDNA || {}))
            .replace('{currentMetrics}', JSON.stringify(latestScore || {}))
            .replace('{competitorInsights}', JSON.stringify(competitors));

        // Call Gemini
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json',
            },
        });

        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);

        // Validate
        const validated = RecommendationsOutputSchema.parse(parsed);

        // Normalize category in case AI hallucinates (force it to match requested)
        validated.recommendations = validated.recommendations.map(r => ({
            ...r,
            category // Enforce correct category
        }));

        return validated.recommendations;
    }

    /**
     * Generate recommendations for all categories
     */
    async generateAllRecommendations(businessId: string) {
        const categories = ['search', 'local', 'social', 'reputation', 'conversion', 'content'] as const;
        const allRecommendations = [];

        for (const category of categories) {
            try {
                const recs = await this.generateRecommendations(businessId, category);
                allRecommendations.push(...recs);
            } catch (error) {
                console.error(`Failed to generate ${category} recommendations:`, error);
                // Continue with other categories even if one fails
            }
        }

        return allRecommendations;
    }

    /**
     * Save recommendations to database
     */
    async saveRecommendations(businessId: string, recommendations: any[]) {
        const saved = [];

        for (const rec of recommendations) {
            // Calculate priority score
            const impactScore = { low: 1, medium: 2, high: 3, critical: 4 }[rec.impact as string] || 1;
            const effortScore = { low: 3, medium: 2, high: 1 }[rec.effort as string] || 1;
            const priorityScore = (impactScore * rec.confidence) / effortScore;

            const created = await repositories.brandRecommendation.create({
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
            } as any); // using any to bypass strict type check due to missing Prisma types in env

            saved.push(created);
        }

        return saved;
    }
}

export const recommendationGeneratorService = new RecommendationGeneratorService();
