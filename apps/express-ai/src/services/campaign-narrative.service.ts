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
    channelSplit?: {
        google?: number;
        meta?: number;
    };
    pacingCurve?: Array<{
        label: string;
        weight: number;
    }>;
    budgetDaily?: number;
    campaignDays?: number;
}

export interface NarrativeOutput {
    narrative: string;
    assumptions: string[];
}

export class CampaignNarrativeService {
    async generate(input: NarrativeInput): Promise<NarrativeOutput> {
        const locations = Array.isArray(input.locations) && input.locations.length > 0 ? input.locations.join(', ') : 'Not specified';
        const channelSplitText = input.channelSplit
            ? `Google ${input.channelSplit.google ?? 50}% / Meta ${input.channelSplit.meta ?? 50}%`
            : 'Not provided';
        const pacingCurveText = input.pacingCurve && input.pacingCurve.length > 0
            ? input.pacingCurve.map((point) => `${point.label}: ${point.weight}%`).join(' | ')
            : 'Not provided';
        const budgetMathText = input.budgetDaily && input.campaignDays
            ? `~$${input.budgetDaily}/day over ${input.campaignDays} days`
            : 'Derived from monthly budget only';

        const prompt = `
        You are a senior digital marketing strategist at ReviewRise.
        Generate a plain-language campaign explanation (narrative) and a list of planning assumptions for a client's upcoming ad campaign.

        Campaign Details:
        - Name: ${input.sessionName}
        - Industry: ${input.industry}
        - Offer/Promotion: ${input.offer}
        - Campaign Goal: ${input.goal}
        - Locations: ${locations}
        - Monthly Budget: $${input.budgetMonthly}
        - Budget Math: ${budgetMathText}
        - Setup Mode: ${input.mode}
        - Brand Tone: ${input.brandTone || 'Professional'}
        - Channel Split: ${channelSplitText}
        - Pacing Curve: ${pacingCurveText}

        Output Requirements:
        1. Narrative: 2-3 short, encouraging paragraphs explaining the strategy in simple terms. Avoid marketing jargon. Focus on why this plan will work (e.g., "We're using Google to find people actively searching for [service] while Meta builds awareness...").
           - If channel split and pacing are provided, explicitly reference them in plain language.
           - If budget is small, explain tradeoffs clearly and what is intentionally deprioritized.
        2. Assumptions: Generate 5–6 specific, performance-related assumptions that justify the campaign projections.
            Rules:

            Each assumption must support the forecasting model (budget → reach → clicks → conversions).

            Use realistic ranges or qualitative benchmarks (avoid vague phrases like “large audience” or “good performance”).

            At least 3 assumptions must be quantitative benchmarks:
            • expected CPC or CPM range for the vertical and location
            • expected CTR range
            • expected conversion/engagement rate (message, lead, or purchase depending on objective)

            Include one assumption about audience size/saturation relative to budget and duration.

            Include one assumption about tracking reliability (pixel, analytics, or message attribution).

            Include one assumption about creative and landing-page alignment affecting conversion performance.

            Write in clear plain language for a business owner, not marketing jargon.

            Do not describe the business; only describe the conditions required for the projections to be realistic.
            
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
        } catch {
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
