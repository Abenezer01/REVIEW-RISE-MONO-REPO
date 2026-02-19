import {
    MetaBlueprintInput,
    MetaBlueprintOutput,
    MetaBlueprintAIInsights,
} from '@platform/contracts';
import { MetaBlueprintEngine } from '@platform/campaign-engine';
import { llmService } from './llm.service';

export class MetaBlueprintService {

    private engine = new MetaBlueprintEngine();

    /**
     * Generates a full Meta Blueprint:
     * 1. Runs the deterministic engine for structure/audiences/copy/placements
     * 2. Passes the result to the LLM to generate contextual AI insights
     * 3. Returns both merged into a single response
     */
    async generate(input: MetaBlueprintInput): Promise<MetaBlueprintOutput> {
        // --- Step 1: Deterministic Engine ---
        const blueprint = this.engine.generateBlueprint({
            businessName: input.businessName || 'Your Business',
            services: [input.offerOrService],
            offer: input.offerOrService,
            vertical: (input.vertical === 'Other' ? 'Local Service' : input.vertical) as any,
            geo: input.geoTargeting.center,
            painPoints: input.painPoints || [],
            landingPageUrl: input.landingPageUrl || '',
            objective: (input.objective || 'Leads') as any,
            budget: input.budget || 1500,
            currency: 'USD',
        } as any);

        // --- Step 2: AI Insights Layer ---
        let aiInsights: MetaBlueprintAIInsights | undefined;
        try {
            aiInsights = await this.generateAIInsights(input, blueprint);
        } catch (e) {
            console.error('[MetaBlueprintService] AI insights generation failed, returning without insights:', e);
        }

        // --- Step 3: Merge and return ---
        return {
            ...blueprint,
            aiInsights,
        };
    }

    /**
     * Uses the LLM to analyze the deterministic blueprint and return
     * actionable optimization notes and strategic takeaways.
     */
    private async generateAIInsights(
        input: MetaBlueprintInput,
        blueprint: MetaBlueprintOutput
    ): Promise<MetaBlueprintAIInsights> {
        const tier = blueprint.recommendations.budgetTier || 'UNKNOWN';
        const dailySpend = blueprint.recommendations.dailySpend || 0;
        const prospectingAdSets = blueprint.structure.prospecting.adSets.length;
        const retargetingAdSets = blueprint.structure.retargeting.adSets.length;
        const warnings = blueprint.recommendations.warnings || [];

        const summaryContext = `
Business: ${input.businessName || 'Unknown'} | Vertical: ${input.vertical}
Service: ${input.offerOrService}
Location: ${input.geoTargeting.center} (${input.geoTargeting.radius} ${input.geoTargeting.unit})
Monthly Budget: $${input.budget || 1500} | Daily: $${dailySpend.toFixed(2)}
Campaign Objective: ${input.objective || 'Leads'}
Budget Tier: ${tier}
Structure:
  - Prospecting: ${prospectingAdSets} ad set(s), $${blueprint.structure.prospecting.totalBudget.toFixed(0)}/mo
  - Retargeting: ${retargetingAdSets > 0 ? `${retargetingAdSets} ad set(s), $${blueprint.structure.retargeting.totalBudget.toFixed(0)}/mo` : 'Locked (budget too low)'}
Learning Phase: ${blueprint.recommendations.learningPhaseEstimate}
Existing Warnings: ${warnings.length > 0 ? warnings.join(' | ') : 'None'}
Pain Points Targeted: ${(input.painPoints || []).join(', ') || 'Not specified'}
`;

        const prompt = `
You are a Senior Meta Ads Media Buyer and Strategist reviewing a client's campaign blueprint before launch.

Blueprint Summary:
${summaryContext}

Your task: Provide a concise, expert-level review of this blueprint. Be specific, actionable, and direct. Think like an agency strategist reviewing this before a client call.

Return a JSON object with exactly this shape:
{
  "optimizations": [
    {
      "title": "Short optimization title (max 8 words)",
      "detail": "Specific, actionable recommendation (1-2 sentences max). Reference actual numbers from the blueprint where relevant.",
      "priority": "high" | "medium" | "low"
    }
  ],
  "takeaways": [
    "1-sentence strategic observation about this blueprint (3-5 items)"
  ],
  "overallScore": <number 0-100 representing agency-readiness of this blueprint>,
  "scoreSummary": "One sentence summary of the score rationale."
}

Rules:
- Max 4 optimizations, prioritize the most impactful ones
- Max 5 takeaways  
- Score 90+ means ready to launch, 70-89 needs minor tweaks, below 70 needs work
- Be specific to THIS blueprint — no generic advice
- Do NOT repeat information already stated in warnings
- If retargeting is locked, note when it unlocks and what to do until then
`;

        const result = await llmService.generateJSON<MetaBlueprintAIInsights>(prompt, { temperature: 0.4 });

        // Validate and sanitize the response
        return {
            optimizations: (result.optimizations || []).slice(0, 4).map(o => ({
                title: o.title || 'Optimization',
                detail: o.detail || '',
                priority: (['high', 'medium', 'low'].includes(o.priority) ? o.priority : 'medium') as 'high' | 'medium' | 'low'
            })),
            takeaways: (result.takeaways || []).slice(0, 5),
            overallScore: typeof result.overallScore === 'number'
                ? Math.min(100, Math.max(0, result.overallScore))
                : undefined,
            scoreSummary: result.scoreSummary,
        };
    }
}

export const metaBlueprintService = new MetaBlueprintService();
