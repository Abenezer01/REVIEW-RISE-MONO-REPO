import { llmService } from './llm.service';

type ChannelStages = {
  awareness: number;
  consideration: number;
  conversion: number;
};

type Tactic = {
  label: string;
  weight: number;
};

type TacticsByStage = {
  awareness: Tactic[];
  consideration: Tactic[];
  conversion: Tactic[];
};

export interface ChannelAllocationInput {
  industry: string;
  goal: string;
  budgetMonthly: number;
  seasonality?: string;
  pacing?: string;
  promoWindow?: number;
  audienceNotes?: string;
  competitors?: string[];
  locations?: string[];
}

export interface ChannelAllocationOutput {
  google: ChannelStages;
  meta: ChannelStages;
  channelSplit: { google: number; meta: number };
  tactics: { google: TacticsByStage; meta: TacticsByStage };
  tradeoffs: string[];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStages = (stages: Partial<ChannelStages>, fallback: ChannelStages): ChannelStages => {
  const awareness = clamp(toNumber(stages.awareness, fallback.awareness), 0, 100);
  const consideration = clamp(toNumber(stages.consideration, fallback.consideration), 0, 100);
  const conversion = clamp(toNumber(stages.conversion, fallback.conversion), 0, 100);
  const total = Math.max(1, awareness + consideration + conversion);
  const normalizedAwareness = Math.round((awareness / total) * 100);
  const normalizedConsideration = Math.round((consideration / total) * 100);

  return {
    awareness: normalizedAwareness,
    consideration: normalizedConsideration,
    conversion: Math.max(0, 100 - normalizedAwareness - normalizedConsideration)
  };
};

const normalizeChannelSplit = (split: { google?: number; meta?: number } | undefined) => {
  const google = clamp(toNumber(split?.google, 50), 0, 100);
  const meta = clamp(toNumber(split?.meta, 50), 0, 100);
  const total = Math.max(1, google + meta);
  const normalizedGoogle = Math.round((google / total) * 100);

  return {
    google: normalizedGoogle,
    meta: Math.max(0, 100 - normalizedGoogle)
  };
};

const normalizeTactics = (items: unknown, stage: string): Tactic[] => {
  if (!Array.isArray(items) || items.length === 0) {
    return [{ label: `${stage} priority`, weight: 100 }];
  }

  const parsed = items
    .map((item) => ({
      label: typeof (item as any)?.label === 'string' ? String((item as any).label).trim() : '',
      weight: clamp(toNumber((item as any)?.weight, 0), 0, 100)
    }))
    .filter((item) => item.label.length > 0 && item.weight > 0)
    .slice(0, 4);

  if (parsed.length === 0) {
    return [{ label: `${stage} priority`, weight: 100 }];
  }

  const total = Math.max(1, parsed.reduce((sum, item) => sum + item.weight, 0));

  return parsed.map((item, idx) => {
    if (idx === parsed.length - 1) {
      const currentSum = parsed
        .slice(0, parsed.length - 1)
        .reduce((sum, p) => sum + Math.round((p.weight / total) * 100), 0);

      return {
        label: item.label,
        weight: Math.max(0, 100 - currentSum)
      };
    }

    return {
      label: item.label,
      weight: Math.round((item.weight / total) * 100)
    };
  });
};

export class ChannelAllocationService {
  async generate(input: ChannelAllocationInput): Promise<ChannelAllocationOutput> {
    const prompt = `
You are a paid-media strategist. Generate a channel allocation plan for Google Ads and Meta Ads.

Inputs:
- Industry: ${input.industry || 'unknown'}
- Goal: ${input.goal || 'unknown'}
- Monthly Budget: ${input.budgetMonthly || 0}
- Seasonality: ${input.seasonality || 'none'}
- Pacing: ${input.pacing || 'even'}
- Promo Window (days): ${input.promoWindow || 7}
- Audience Notes: ${input.audienceNotes || 'none'}
- Competitors: ${Array.isArray(input.competitors) && input.competitors.length > 0 ? input.competitors.join(', ') : 'none'}
- Locations: ${Array.isArray(input.locations) && input.locations.length > 0 ? input.locations.join(', ') : 'none'}

Rules:
1) Return percentages as integers.
2) channelSplit.google + channelSplit.meta must equal 100.
3) For each channel, awareness + consideration + conversion must equal 100.
4) Prioritize learning efficiency for low budgets and avoid over-fragmentation.
5) Include 1-3 concrete budget tradeoffs.
6) Include tactics for each stage in each channel. Each tactic group must sum to 100.

Return valid JSON only:
{
  "google": { "awareness": 0, "consideration": 0, "conversion": 0 },
  "meta": { "awareness": 0, "consideration": 0, "conversion": 0 },
  "channelSplit": { "google": 0, "meta": 0 },
  "tactics": {
    "google": {
      "awareness": [{ "label": "Prospecting video", "weight": 60 }],
      "consideration": [{ "label": "Non-brand search", "weight": 70 }],
      "conversion": [{ "label": "Brand search", "weight": 65 }]
    },
    "meta": {
      "awareness": [{ "label": "Broad prospecting", "weight": 55 }],
      "consideration": [{ "label": "Engager retargeting", "weight": 60 }],
      "conversion": [{ "label": "Site retargeting", "weight": 70 }]
    }
  },
  "tradeoffs": ["..."]
}
`;

    try {
      const raw = await llmService.generateJSON<any>(prompt, { temperature: 0.25 });
      const normalized: ChannelAllocationOutput = {
        google: normalizeStages(raw?.google ?? {}, { awareness: 20, consideration: 40, conversion: 40 }),
        meta: normalizeStages(raw?.meta ?? {}, { awareness: 30, consideration: 40, conversion: 30 }),
        channelSplit: normalizeChannelSplit(raw?.channelSplit),
        tactics: {
          google: {
            awareness: normalizeTactics(raw?.tactics?.google?.awareness, 'Google awareness'),
            consideration: normalizeTactics(raw?.tactics?.google?.consideration, 'Google consideration'),
            conversion: normalizeTactics(raw?.tactics?.google?.conversion, 'Google conversion')
          },
          meta: {
            awareness: normalizeTactics(raw?.tactics?.meta?.awareness, 'Meta awareness'),
            consideration: normalizeTactics(raw?.tactics?.meta?.consideration, 'Meta consideration'),
            conversion: normalizeTactics(raw?.tactics?.meta?.conversion, 'Meta conversion')
          }
        },
        tradeoffs: Array.isArray(raw?.tradeoffs)
          ? raw.tradeoffs.filter((item: unknown) => typeof item === 'string').slice(0, 3)
          : []
      };

      if (normalized.tradeoffs.length === 0) {
        normalized.tradeoffs = ['Budget allocation emphasizes measurable outcomes while preserving enough spend for learning.'];
      }

      return normalized;
    } catch (error) {
      console.error('Channel allocation generation failed:', error);

      throw new Error('AI channel allocation failed');
    }
  }
}

export const channelAllocationService = new ChannelAllocationService();
