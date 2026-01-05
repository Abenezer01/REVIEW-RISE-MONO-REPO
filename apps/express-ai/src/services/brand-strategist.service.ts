import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    RECOMMENDATION_PROMPTS,
    VISIBILITY_PLAN_PROMPT,
    RecommendationsOutputSchema,
    VisibilityPlanSchema
} from '@platform/contracts';

// AI Provider selection from environment
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

export class BrandStrategistService {
    private async callAI(prompt: string, useJsonFormat: boolean = true): Promise<string | null> {
        console.log(`[BrandStrategist] Calling AI with provider: ${AI_PROVIDER}`);
        try {
            if (AI_PROVIDER === 'gemini') {
                const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                const model = gemini.getGenerativeModel({
                    model: 'gemini-3-flash-preview',
                    generationConfig: {
                        temperature: 0.7,
                        ...(useJsonFormat && { responseMimeType: 'application/json' })
                    }
                });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } else {
                // OpenAI
                const apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) {
                     console.warn('[BrandStrategist] OPENAI_API_KEY not set.');
                }
                
                const openai = new OpenAI({
                    apiKey: apiKey,
                });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo-0125",
                    ...(useJsonFormat && { response_format: { type: "json_object" } }),
                    temperature: 0.7,
                });
                
                const choice = completion.choices?.[0];
                if (!choice?.message) {
                    throw new Error('Invalid response from OpenAI: No message found');
                }
                
                return choice.message.content;
            }
        } catch (error) {
            console.error(`AI call failed (${AI_PROVIDER}):`, error);
            throw error;
        }
    }

    async generateRecommendations(
        category: keyof typeof RECOMMENDATION_PROMPTS,
        context: { brandDNA: any, currentMetrics: any, competitorInsights: any }
    ) {
        if (!RECOMMENDATION_PROMPTS[category]) {
            throw new Error(`Invalid category: ${category}`);
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
