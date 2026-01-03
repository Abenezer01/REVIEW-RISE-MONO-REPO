import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ClassificationSchema = z.object({
    type: z.enum(['DIRECT_LOCAL', 'CONTENT', 'AGGREGATOR', 'UNKNOWN']),
    confidence: z.number(),
    reasoning: z.string().optional()
});

export class CompetitorClassifierService {
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

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo-0125",
                response_format: { type: "json_object" },
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content;
            if (!content) return { type: 'UNKNOWN' };

            const result = JSON.parse(content);
            const validated = ClassificationSchema.safeParse({ ...result, confidence: 1 }); // Mock confidence for now
            
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

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-3.5-turbo-0125",
                response_format: { type: "json_object" },
                temperature: 0.3,
            });

            const content = completion.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('Analysis failed:', error);
            return {};
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

            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "gpt-4-turbo-preview", // Use stronger model for strategy
                response_format: { type: "json_object" },
                temperature: 0.5,
            });

            const content = completion.choices[0].message.content;
            if (!content) return {};

            return JSON.parse(content);
        } catch (error) {
            console.error('Report generation failed:', error);
            return {};
        }
    }
}

export const competitorClassifier = new CompetitorClassifierService();
