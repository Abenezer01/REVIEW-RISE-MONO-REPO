import {
  BlueprintInput,
  BlueprintOutput,
  KeywordCluster,
  AdGroup,
  RSAAssets,
  NegativeKeywordList,
  LandingPageAnalysis,
  RSA_CONSTRAINTS
} from '@platform/contracts';
import { llmService } from './llm.service';
import { strategyCompiler } from './blueprint/strategy-compiler';
import { validationEngine } from './blueprint/validation-engine';
import { verticalIntelligence } from './blueprint/vertical-intelligence';
import { performanceEstimator } from './blueprint/performance-estimator';
import { landingPageScorer } from './blueprint/landing-page-scorer';

export class BlueprintService {
  async generate(input: BlueprintInput): Promise<BlueprintOutput> {
    try {
      // 1. Get Vertical Intelligence
      const verticalData = verticalIntelligence.getVerticalData(input.vertical);

      // 2. Build Prompt
      const prompt = this.buildPrompt(input, verticalData.negativeKeywords);
      console.log('Generating blueprint with prompt length:', prompt.length);

      // 3. Request JSON output from LLM
      let data = await llmService.generateJSON<BlueprintOutput>(prompt, { temperature: 0.7 });

      // 4. Sanitize and validate basic structure
      data = this.sanitizeOutput(data, input);

      // 5. Run Decision Engine Components
      // 5a. Strategy Compiler (Organize into Campaigns)
      const campaigns = strategyCompiler.compile(input, data.clusters, data.adGroups);

      // 5b. Validation Engine (Check Constraints)
      const validationWarnings = validationEngine.validate(data);

      // 5c. Performance Estimator
      const performanceAssumptions = performanceEstimator.estimate(input.vertical, 'Mixed'); // Estimate generally for now

      // 5d. Landing Page Scorer
      const landingPageAnalysis = landingPageScorer.analyze(input.landingPageUrl);

      // 6. Assemble Final Output
      return {
        ...data,
        campaigns,
        validationWarnings,
        performanceAssumptions,
        landingPageAnalysis
      };

    } catch (error) {
      console.error('Failed to generate blueprint with LLM, falling back to mock:', error);
      return this.generateMock(input);
    }
  }

  private buildPrompt(input: BlueprintInput, verticalNegatives: string[]): string {
    const locationStr = input.geoTargeting.length > 0 ? input.geoTargeting.join(', ') : 'their local area';
    const painPointsStr = input.painPoints.length > 0 ? input.painPoints.join(', ') : 'common industry problems';

    return `
You are a Google Ads Expert. Create a complete, production-ready Google Search campaign blueprint for the following business:

Input Data:
- Business Name: ${input.businessName || 'Not specified'}
- Offer/Service: ${input.offerOrService}
- Vertical: ${input.vertical}
- Target Locations: ${locationStr}
- Customer Pain Points: ${painPointsStr}
- Objective: ${input.objective || 'Leads'}
- Budget Tier: ${input.budgetTier || 'Mid'}

Your task is to generate a JSON object containing keyword clusters, ad groups with RSA assets, and negative keywords.

Output Schema (JSON):
{
  "clusters": [
    {
      "intent": "Brand" | "Service" | "Commercial" | "Competitor" | "Problem",
      "theme": "string (e.g. 'Emergency Plumbing')",
      "funnelStage": "TOF" | "MOF" | "BOF",
      "keywords": [
        { "term": "string", "matchType": "Exact" | "Phrase" | "Broad" }
      ]
    }
  ],
  "adGroups": [
    {
      "name": "string (matches cluster theme)",
      "keywords": {
         "intent": "string (matches cluster intent)",
         "theme": "string",
         "keywords": [] 
      },
      "assets": {
        "headlines": ["string" (max ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} chars)],
        "descriptions": ["string" (max ${RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} chars)]
      }
    }
  ],
  "negatives": [
    { "category": "string", "keywords": ["string"] }
  ]
}

Strict Requirements:
1. Keyword Clusters:
   - Create 4-6 distinct clusters based on the User's input.
   - Group by intent:
     - 'Brand': Business name keywords (BOF).
     - 'Service': Core service inquiries (MOF) (e.g. "plumber near me").
     - 'Commercial': High-intent research (BOF) (e.g. "best plumber reviews").
     - 'Problem': Pain points (TOF) (e.g. "leaking pipe fix").
     - 'Competitor': Specific competitor names (BOF).
   - Assign 'funnelStage' correctly.

2. Ad Groups & RSA Assets:
   - Create one Ad Group for EACH Keyword Cluster.
   - The 'name' of the Ad Group MUST match the 'theme' of the Cluster.
   
   - RSA Headlines (${RSA_CONSTRAINTS.HEADLINE_MIN_COUNT}-${RSA_CONSTRAINTS.HEADLINE_MAX_COUNT} per ad group):
     - STRICT LIMIT: Max ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} characters.
     - Include keywords, location, and CTAs.
   
   - RSA Descriptions (${RSA_CONSTRAINTS.DESCRIPTION_MIN_COUNT}-${RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT} per ad group):
     - STRICT LIMIT: Max ${RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters.
     - Target 85-88 chars.
     - Include value prop and CTA.

3. Negative Keywords:
   - Include universal negatives (free, cheap, diy, job).
   - Include these vertical-specific negatives: ${verticalNegatives.join(', ')}.

Ensure the output is valid JSON.
`;
  }

  private sanitizeOutput(data: BlueprintOutput, input: BlueprintInput): BlueprintOutput {
    // Fallback for missing arrays
    if (!data.clusters) data.clusters = [];
    if (!data.adGroups) data.adGroups = [];
    if (!data.negatives) data.negatives = [];

    // Ensure char limits strictly
    if (data.adGroups) {
      data.adGroups.forEach(group => {
        if (group.assets && group.assets.headlines) {
          group.assets.headlines = group.assets.headlines.map(h => {
            if (h.length <= RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH) return h;
            return h.substring(0, RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH - 3) + '...';
          }).slice(0, RSA_CONSTRAINTS.HEADLINE_MAX_COUNT);
        } else if (group.assets) {
          group.assets.headlines = [];
        }

        if (group.assets && group.assets.descriptions) {
          group.assets.descriptions = group.assets.descriptions.map(d => {
            if (d.length <= RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) return d;
            return d.substring(0, RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH - 3) + '...';
          }).slice(0, RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT);
        } else if (group.assets) {
          group.assets.descriptions = [];
        }
      });
    }

    // Logic check: if adGroups count != clusters count, force alignment
    if (data.clusters.length > 0 && data.adGroups.length === 0) {
      data.adGroups = data.clusters.map(cluster => ({
        name: `${cluster.theme}`,
        keywords: cluster,
        assets: this.generateFallbackAssets(input, cluster.theme, input.geoTargeting[0] || 'Local')
      }));
    }

    return data;
  }

  private generateFallbackAssets(input: BlueprintInput, theme: string, loc: string): RSAAssets {
    return {
      headlines: [
        `${input.offerOrService}`.substring(0, 30),
        `Best ${input.offerOrService}`.substring(0, 30),
        `${input.offerOrService} in ${loc}`.substring(0, 30),
        'Call Now',
        'Free Initial Consult'
      ],
      descriptions: [
        `Top rated ${input.offerOrService} serving ${loc}. Call us today for a free quote.`.substring(0, 90),
        'Professional, reliable, and affordable services. Satisfaction guaranteed.'.substring(0, 90)
      ]
    };
  }

  private generateMock(input: BlueprintInput): BlueprintOutput {
    // Mock needs to be updated to match new structure if fallback is hit
    // For now, keep it simple but ensure it conforms to types
    const clusters: KeywordCluster[] = [];
    const baseService = input.offerOrService.toLowerCase();
    const locations = input.geoTargeting.length > 0 ? input.geoTargeting : ['near me'];

    const serviceKeywords = locations.flatMap(loc => [
      { term: `${baseService} ${loc}`, matchType: 'Phrase' },
      { term: `best ${baseService} ${loc}`, matchType: 'Phrase' }
    ]);

    clusters.push({
      intent: 'Service',
      theme: `${input.offerOrService} - Core`,
      funnelStage: 'MOF',
      keywords: serviceKeywords as any,
    });

    if (input.painPoints.length > 0) {
      clusters.push({
        intent: 'Problem',
        theme: 'Pain Points',
        funnelStage: 'TOF',
        keywords: input.painPoints.map(p => ({ term: `fix ${p}`, matchType: 'Broad' })) as any
      });
    }

    const adGroups: AdGroup[] = clusters.map(c => ({
      name: c.theme,
      keywords: c,
      assets: this.generateFallbackAssets(input, c.theme, locations[0])
    }));

    const negatives: NegativeKeywordList[] = [
      { category: 'General', keywords: ['free', 'cheap', 'diy', 'job'] }
    ];

    // Run decision engine on mock data too
    const campaigns = strategyCompiler.compile(input, clusters, adGroups);
    const validationWarnings = validationEngine.validate({ clusters, adGroups, negatives });
    const performanceAssumptions = performanceEstimator.estimate(input.vertical, 'Mixed');
    const landingPageAnalysis = landingPageScorer.analyze(input.landingPageUrl);

    return {
      clusters,
      adGroups,
      negatives,
      campaigns,
      validationWarnings,
      performanceAssumptions,
      landingPageAnalysis
    };
  }
}

export const blueprintService = new BlueprintService();
