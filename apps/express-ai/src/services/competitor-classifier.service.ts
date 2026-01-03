import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// AI Provider selection from environment
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini'; // 'openai' or 'gemini'

const ClassificationSchema = z.object({
    type: z.enum(['DIRECT_LOCAL', 'CONTENT', 'AGGREGATOR', 'UNKNOWN']),
    confidence: z.number(),
    reasoning: z.string().optional()
});

export class CompetitorClassifierService {
    private async callAI(prompt: string, useJsonFormat: boolean = true): Promise<string | null> {
        try {
            if (AI_PROVIDER === 'gemini') {
                const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                const model = gemini.getGenerativeModel({ 
                    model: 'gemini-1.5-flash',
                    generationConfig: {
                        temperature: 0.3,
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
                    temperature: 0.3,
                });
                return completion.choices[0].message.content;
            }
        } catch (error) {
            console.error(`AI call failed (${AI_PROVIDER}):`, error);
            throw error;
        }
    }

    async classify(domain: string, title: string, snippet: string, businessContext: string = 'Local business'): Promise<{ type: string; reason?: string }> {
        try {
            const prompt = `
            Analyze the following web search result in the context of a ${businessContext}.
            Determine if the website represents a:
            - DIRECT_LOCAL: A direct competitor business offering similar services.
            - AGGREGATOR: A directory, review site, or marketplace (e.g., Yelp, TripAdvisor, Angi, YellowPages).
            - CONTENT: An informational article, blog, wiki, or news site.
            
            Input:
            Domain: ${domain}
            Title: ${title}
            Snippet: ${snippet}
            
            Return ONLY a JSON object with this structure:
            { "type": "DIRECT_LOCAL" | "AGGREGATOR" | "CONTENT", "reasoning": "short explanation" }
            `;

            const content = await this.callAI(prompt);
            if (!content) return { type: 'UNKNOWN' };

            const result = JSON.parse(content);
            const validated = ClassificationSchema.safeParse({ ...result, confidence: 1 });
            
            if (validated.success) {
                return { type: validated.data.type, reason: validated.data.reasoning };
            }
            
            return { type: 'UNKNOWN' };
        } catch (error) {
            console.error('Classification failed:', error);
            // Fallback heuristics if API fails or key missing
            if (domain.includes('yelp') || domain.includes('tripadvisor')) return { type: 'AGGREGATOR' };
            if (domain.includes('wikipedia')) return { type: 'CONTENT' };
            return { type: 'UNKNOWN' };
        }
    }

    async analyze(domain: string, headline: string, uvp: string, serviceList: string[], businessContext: string = 'Local business'): Promise<any> {
        try {
            const prompt = `
            Analyze the following competitor data for a company in the "${businessContext}" space.
            Domain: ${domain}
            Headline: ${headline}
            UVP: ${uvp}
            Services: ${serviceList.join(', ')}

            Identify:
            1. Differentiators (Strengths, Weaknesses, Unique Selling Points)
            2. "What to Learn" (Strategies to adopt)
            3. "What to Avoid" (Mistakes or gaps)

            Return ONLY a JSON object with this structure:
            {
                "differentiators": { "strengths": [], "weaknesses": [], "unique": [] },
                "whatToLearn": [],
                "whatToAvoid": []
            }
            Keep strings concise (under 10 words). Limit arrays to 3-5 items each.
            `;

            const content = await this.callAI(prompt);
            if (!content) throw new Error('No response from AI provider');

            return JSON.parse(content);
        } catch (error) {
            console.error('Analysis failed:', error);
            // Return mock data as fallback
            return {
                differentiators: {
                    strengths: [
                        "Strong online presence",
                        "Professional website design",
                        "Clear service offerings"
                    ],
                    weaknesses: [
                        "Limited pricing transparency",
                        "Lack of social proof",
                        "Generic messaging"
                    ],
                    unique: [
                        "Industry expertise",
                        "Customer-centric approach",
                        "Modern technology stack"
                    ]
                },
                whatToLearn: [
                    "Professional branding and visual identity",
                    "Clear value proposition messaging",
                    "Service portfolio organization"
                ],
                whatToAvoid: [
                    "Vague or unclear pricing",
                    "Missing customer testimonials",
                    "Outdated content or design"
                ]
            };
        }
    }

    async generateOpportunitiesReport(competitors: any[], businessType: string): Promise<any> {
        try {
            const prompt = `
            Act as a Brand Strategy Consultant. Analyze the following competitors for a business in the "${businessType}" space:
            ${JSON.stringify(competitors.map(c => ({ 
                name: c.name, 
                uvp: c.uvp, 
                weaknesses: c.differentiators?.weaknesses || [],
                offerings: c.serviceList?.slice(0, 5) 
            })))}

            Generate a strategic opportunities report containing:
            1. "Gaps": 5-10 unmet needs or weaknesses in competitors.
            2. "Strategies": 3 distinct strategies to dominate the market.
            3. "Taglines": 5 catchy taglines positioning against these competitors.
            4. "Content Ideas": 5 content topics that address competitor gaps.
            5. "Positioning Map": A text description of where this business should sit vs competitors.

            Return ONLY a JSON object:
            {
                "gaps": [{ "title": "...", "description": "...", "priority": 1-10 }],
                "strategies": [{ "title": "...", "description": "...", "pros": [], "cons": [] }],
                "suggestedTaglines": [],
                "contentIdeas": [{ "topic": "...", "rationale": "..." }],
                "positioningMap": { "axes": { "x": "Price/Speed", "y": "Quality/Scope" }, "description": "..." }
            }
            `;

            const content = await this.callAI(prompt);
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('Report generation failed:', error);
            return {};
        }
    }

    getProviderInfo(): { provider: string; hasKey: boolean } {
        if (AI_PROVIDER === 'gemini') {
            return { provider: 'Gemini', hasKey: !!process.env.GEMINI_API_KEY };
        } else {
            return { provider: 'OpenAI', hasKey: !!process.env.OPENAI_API_KEY };
        }
    }
}

export const competitorClassifier = new CompetitorClassifierService();
