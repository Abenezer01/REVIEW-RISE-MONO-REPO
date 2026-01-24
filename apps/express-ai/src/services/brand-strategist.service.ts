import { llmService } from './llm.service';
import {
    RECOMMENDATION_PROMPTS,
    VISIBILITY_PLAN_PROMPT,
    RecommendationsOutputSchema,
    VisibilityPlanSchema
} from '@platform/contracts';

export class BrandStrategistService {
    private async callAI(prompt: string): Promise<string> {
        return llmService.generateText(prompt, { jsonMode: true });
    }

    async generateRecommendations(
        category: keyof typeof RECOMMENDATION_PROMPTS,
        context: { brandDNA: any, currentMetrics: any, competitorInsights: any }
    ) {
        if (!RECOMMENDATION_PROMPTS[category]) {
            throw new Error(`Invalid category: ${String(category)}`);
        }

        const promptTemplate = RECOMMENDATION_PROMPTS[category];
        const metricsStr = JSON.stringify(context.currentMetrics || {});
        
        let finalPrompt = promptTemplate;
        
        // Helper to replace all occurrences
        const replaceAll = (str: string, find: string, replace: string) => str.split(find).join(replace);

        finalPrompt = replaceAll(finalPrompt, '{brandDNA}', JSON.stringify(context.brandDNA || {}));
        finalPrompt = replaceAll(finalPrompt, '{competitorInsights}', JSON.stringify(context.competitorInsights || []));
        finalPrompt = replaceAll(finalPrompt, '{competitorContent}', JSON.stringify(context.competitorInsights || []));
        finalPrompt = replaceAll(finalPrompt, '{currentMetrics}', metricsStr);
        finalPrompt = replaceAll(finalPrompt, '{socialMetrics}', metricsStr);
        finalPrompt = replaceAll(finalPrompt, '{reviewMetrics}', metricsStr);
        finalPrompt = replaceAll(finalPrompt, '{websiteMetrics}', metricsStr);

        const content = await this.callAI(finalPrompt);
        if (!content) throw new Error('No response from AI');

        try {
            const parsed = JSON.parse(content);
            return RecommendationsOutputSchema.parse(parsed);
        } catch (e) {
            console.error('Failed to parse AI response:', content);
            throw e;
        }
    }

    async generateVisibilityPlan(context: {
        brandDNA: any,
        visibilityScore: number,
        trustScore: number,
        consistencyScore: number,
        topRecommendations: any
    }) {
        const prompt = VISIBILITY_PLAN_PROMPT
            .replace('{brandDNA}', JSON.stringify(context.brandDNA || {}))
            .replace('{visibilityScore}', context.visibilityScore.toString())
            .replace('{trustScore}', context.trustScore.toString())
            .replace('{consistencyScore}', context.consistencyScore.toString())
            .replace('{topRecommendations}', JSON.stringify(context.topRecommendations));

        const content = await this.callAI(prompt);
        if (!content) throw new Error('No response from AI');

        const parsed = JSON.parse(content);
        return VisibilityPlanSchema.parse(parsed);
    }
}

export const brandStrategist = new BrandStrategistService();
