import { llmService } from './llm.service';

export interface TroubleshootingAdvisorInput {
  issue: string;
  suggestion?: string;
  staticSteps?: string[];
  context?: {
    sessionName?: string;
    industry?: string;
    goal?: string;
    budgetMonthly?: number;
    mode?: string;
    locations?: string[];
    platformHint?: string;
  };
}

export interface TroubleshootingAdvisorOutput {
  summary: string;
  causes: string[];
  actions: string[];
}

export class TroubleshootingAdvisorService {
  async generate(input: TroubleshootingAdvisorInput): Promise<TroubleshootingAdvisorOutput> {
    const prompt = `
You are a paid ads troubleshooting specialist for Google Ads and Meta Ads.
Given a campaign issue, return concise, practical guidance for a non-expert user.

Issue:
- Issue: ${input.issue}
- Current suggestion: ${input.suggestion || 'n/a'}
- Existing static steps: ${(input.staticSteps || []).join(' | ') || 'n/a'}

Campaign context:
- Session: ${input.context?.sessionName || 'n/a'}
- Industry: ${input.context?.industry || 'n/a'}
- Goal: ${input.context?.goal || 'n/a'}
- Monthly budget: ${input.context?.budgetMonthly ?? 'n/a'}
- Mode: ${input.context?.mode || 'n/a'}
- Locations: ${Array.isArray(input.context?.locations) ? input.context?.locations.join(', ') : 'n/a'}
- Platform hint: ${input.context?.platformHint || 'both'}

Rules:
1) Use plain language.
2) Keep it actionable and ordered by priority.
3) Avoid generic advice with no clear action.
4) Return exactly 3-5 likely causes and 4-6 actions.
5) Actions should be concrete and measurable where possible.

Return valid JSON only:
{
  "summary": "one short paragraph",
  "causes": ["...", "..."],
  "actions": ["...", "..."]
}
`;

    const raw = await llmService.generateJSON<any>(prompt, { temperature: 0.2 });
    const causes = Array.isArray(raw?.causes) ? raw.causes.filter((c: unknown) => typeof c === 'string').slice(0, 5) : [];
    const actions = Array.isArray(raw?.actions) ? raw.actions.filter((a: unknown) => typeof a === 'string').slice(0, 6) : [];
    const summary = typeof raw?.summary === 'string' && raw.summary.trim().length > 0
      ? raw.summary.trim()
      : 'Focus first on delivery blockers, then tighten targeting and relevance signals before scaling budget.';

    return {
      summary,
      causes: causes.length > 0 ? causes : ['Audience targeting may be too narrow or low-intent.'],
      actions: actions.length > 0 ? actions : ['Audit targeting, bids, and conversion tracking before making budget changes.']
    };
  }
}

export const troubleshootingAdvisorService = new TroubleshootingAdvisorService();
