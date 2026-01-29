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

    async generateTone(context: {
        businessName: string,
        industry?: string,
        location?: string,
        extractedData?: any
    }) {
        const prompt = `
        You are a world-class brand strategist. Based on the following information, generate a comprehensive brand tone of voice and messaging strategy.
        
        Business Name: ${context.businessName}
        Industry: ${context.industry || 'Not specified'}
        Location: ${context.location || 'Not specified'}
        Extracted Data: ${JSON.stringify(context.extractedData || {})}
        
        Please provide the following in JSON format:
        1. descriptors: An array of 4-5 adjectives describing the brand's tone (e.g., "Professional", "Friendly").
        2. writingRules: An object with "do" and "dont" arrays, each containing 4 specific writing guidelines.
        3. taglines: An array of 5 creative taglines for the brand.
        4. messagingPillars: An array of 3 objects, each with "pillar" (title), "description" (1-2 sentences), and "ctas" (array of 2 call-to-actions).
        
        Return ONLY the JSON object.
        `;

        const content = await this.callAI(prompt);
        if (!content) throw new Error('No response from AI');

        try {
            return JSON.parse(content);
        } catch {
            console.error('Failed to parse AI response:', content);
            // Attempt to clean markdown if LLM failed to return pure JSON
            const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
            try {
                return JSON.parse(cleaned);
            } catch {
                throw new Error('Invalid JSON response from AI');
            }
        }
    }
}

export const brandStrategist = new BrandStrategistService();
