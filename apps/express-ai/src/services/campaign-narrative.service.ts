import { llmService } from './llm.service';

export interface NarrativeInput {
    sessionName: string;
    industry: string;
    offer: string;
    goal: string;
    locations: string[];
    budgetMonthly: number;
    mode: 'QUICK' | 'PRO';
    brandTone?: string;
}

export interface NarrativeOutput {
    narrative: string;
    assumptions: string[];
}

export class CampaignNarrativeService {
    async generate(input: NarrativeInput): Promise<NarrativeOutput> {
        const prompt = `
        You are a senior digital marketing strategist at ReviewRise.
        Generate a plain-language campaign explanation (narrative) and a list of planning assumptions for a client's upcoming ad campaign.

        Campaign Details:
        - Name: ${input.sessionName}
        - Industry: ${input.industry}
        - Offer/Promotion: ${input.offer}
        - Campaign Goal: ${input.goal}
        - Locations: ${input.locations.join(', ')}
        - Monthly Budget: $${input.budgetMonthly}
        - Setup Mode: ${input.mode}
        - Brand Tone: ${input.brandTone || 'Professional'}

        Output Requirements:
        1. Narrative: 2-3 short, encouraging paragraphs explaining the strategy in simple terms. Avoid marketing jargon. Focus on why this plan will work (e.g., "We're using Google to find people actively searching for [service] while Meta builds awareness...").
        2. Assumptions: A list of 4-6 key assumptions we are making for this plan (e.g., Average CPC, Benchmark CTR, Expected Conversion Rate for this industry, Lead quality expectations).

        Return the response as a valid JSON object with the following structure:
        {
            "narrative": "...",
            "assumptions": ["...", "...", "..."]
        }
        `;

        const response = await llmService.generateText(prompt, { temperature: 0.7 });

        try {
            // Find the JSON block in the response if LLM added markdown
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response;

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Failed to parse narrative JSON:', response);
            // Fallback
            return {
                narrative: response,
                assumptions: [
                    "Benchmark industry conversion rates applied",
                    "Standard platform auction dynamics assumed",
                    "Geographic search volume remains stable",
                    "Landing page remains active and optimized"
                ]
            };
        }
    }
}

export const campaignNarrativeService = new CampaignNarrativeService();
