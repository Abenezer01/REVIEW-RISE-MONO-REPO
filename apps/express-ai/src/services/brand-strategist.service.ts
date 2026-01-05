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
                const openai = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo-0125",
                    ...(useJsonFormat && { response_format: { type: "json_object" } }),
                    temperature: 0.7,
                });
                return completion.choices[0].message.content;
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
        const prompt = promptTemplate
            .replace('{brandDNA}', JSON.stringify(context.brandDNA || {}))
            .replace('{currentMetrics}', JSON.stringify(context.currentMetrics || {}))
            .replace('{competitorInsights}', JSON.stringify(context.competitorInsights || []));

        // Use current social metrics if category is social (template expects {socialMetrics})
        // The prompt template might use different variable names per category.
        // Let's re-check the prompts. 
        // Search: currentMetrics, competitorInsights
        // Local: currentMetrics
        // Social: socialMetrics (Mapping issue here?)
        // Reputation: reviewMetrics
        // Conversion: websiteMetrics
        // Content: competitorContent

        // My previous implementation in job (step 547) passed {currentMetrics} to ALL replacements roughly?
        // Step 547 line 35: .replace('{currentMetrics}', JSON.stringify(latestScore || {}))
        // But prompt templates have specific names. 
        // Step 562 shows:
        // Social: {socialMetrics}
        // Reputation: {reviewMetrics}
        //
        // So I should replace ALL possible placeholders with the metrics object to be safe, 
        // or the caller should map them.
        // In the job implementation (Step 547), it was flawed! 
        // Line 33 `RECOMMENDATION_PROMPTS[category].replace(... '{currentMetrics}' ...)`
        // Use of `replace` only replaces the first occurrence or specific string.
        // If the prompt uses `{socialMetrics}` instead of `{currentMetrics}`, the replacement wouldn't happen 
        // and the prompt would contain literal `{socialMetrics}`.

        // I will fix this logic here. The user said "metrics" are passed.
        // I will replace all known placeholders with the passed metrics object.

        const metricsStr = JSON.stringify(context.currentMetrics || {});
        let finalPrompt = promptTemplate
            .replace('{brandDNA}', JSON.stringify(context.brandDNA || {}))
            .replace('{competitorInsights}', JSON.stringify(context.competitorInsights || []))
            .replace('{competitorContent}', JSON.stringify(context.competitorInsights || [])) // Overlap
            .replace('{currentMetrics}', metricsStr)
            .replace('{socialMetrics}', metricsStr)
            .replace('{reviewMetrics}', metricsStr)
            .replace('{websiteMetrics}', metricsStr);

        const content = await this.callAI(finalPrompt);
        if (!content) throw new Error('No response from AI');

        const parsed = JSON.parse(content);
        return RecommendationsOutputSchema.parse(parsed);
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
