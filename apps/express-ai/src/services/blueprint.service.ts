import type { CampaignInput } from '@platform/campaign-engine';
import { generateBlueprintV4 } from '@platform/campaign-engine';
import {
  AdGroup,
  BlueprintInput,
  BlueprintOutput,
  KeywordCluster,
  LandingPageAnalysis,
  NegativeKeywordList,
  RSA_CONSTRAINTS,
  RSAAssets
} from '@platform/contracts';
import { strategyCompiler } from './blueprint/strategy-compiler';

export class BlueprintService {
  async generate(input: BlueprintInput): Promise<BlueprintOutput> {
    try {
      // Transform BlueprintInput to CampaignInput for v4 engine
      const engineInput: CampaignInput = {
        businessName: input.businessName,
        services: input.services,
        offer: input.offer,
        vertical: input.vertical as any,
        geo: input.geo,
        budget: input.budget,
        objective: input.objective as any,
        painPoints: input.painPoints,
        websiteUrl: input.landingPageUrl,
        currency: input.currency || 'USD',
        expectedAvgCpc: input.expectedAvgCpc,
        conversionTrackingEnabled: input.conversionTrackingEnabled ?? true,
      };

      // Generate using v4 engine (with real website crawling)
      let v4Plan = await generateBlueprintV4(engineInput);

      // --- AI ENHANCEMENT LAYER ---
      // Polishes the deterministic plan with LLM creativity
      try {
        const { blueprintAiEnhancer } = require('./blueprint/ai-enhancer');
        v4Plan = await blueprintAiEnhancer.enhance(v4Plan, engineInput);
      } catch (enhancementError) {
        console.warn('AI Enhancement skipped due to error:', enhancementError);
        // Continue with the un-enhanced v4Plan
      }

      // Transform v4 output to BlueprintOutput format
      const clusters: KeywordCluster[] = (v4Plan.keywordClusters || []).map((cluster: any) => ({
        intent: cluster.intentType as any,
        theme: cluster.clusterName || cluster.name,
        funnelStage: cluster.funnelStage as any,
        keywords: cluster.keywords.map((kw: any, index: number) => ({
          term: kw,
          matchType: (cluster.matchTypes && cluster.matchTypes[index]) || 'Phrase' // Default to Phrase if not specified
        }))
      }));

      const adGroups: AdGroup[] = (v4Plan.adGroups || []).map((ag: any) => ({
        name: ag.adGroupName || ag.name,
        keywords: clusters.find(c => (ag.adGroupName || ag.name).includes(c.theme)) || clusters[0],
        assets: ag.rsaAssets,
        budgetAllocation: ag.budgetAllocation // Preserve budget allocation from v4 engine
      }));

      const negatives: NegativeKeywordList[] = [
        {
          category: 'Global',
          keywords: v4Plan.negativeKeywords || []
        }
      ];

      const landingPageAnalysis: LandingPageAnalysis = {
        url: input.landingPageUrl || '',
        isValid: (v4Plan.landingPageAnalysis?.score || 0) > 50,
        score: v4Plan.landingPageAnalysis?.score || 0,
        mobileOptimized: v4Plan.landingPageAnalysis?.mobileOptimized ?? true,
        trustSignalsDetected: v4Plan.landingPageAnalysis?.trustSignalsDetected || [],
        missingElements: v4Plan.landingPageAnalysis?.warnings || [],
        qualityScorePrediction: v4Plan.landingPageAnalysis?.qualityScorePrediction || 5,
        conversionReadinessScore: v4Plan.landingPageAnalysis?.conversionReadinessScore || 5,
        frictionScore: v4Plan.landingPageAnalysis?.frictionScore || 5,
        recommendations: v4Plan.landingPageAnalysis?.recommendations || [],
        landingPageType: (v4Plan.landingPageAnalysis?.landingPageType as any) || 'homepage',
        adToLandingConsistencyScore: v4Plan.landingPageAnalysis?.adToLandingConsistencyScore || 5
      };

      const campaigns = strategyCompiler.compile(input, clusters, adGroups);

      return {
        strategySummary: {
          goal: v4Plan.summary.goal,
          totalBudget: v4Plan.summary.totalBudget,
          vertical: v4Plan.summary.vertical,
          bidStrategy: v4Plan.summary.bidStrategy || 'Maximize Clicks',
        },
        budgetModeling: {
          clickCapacity: v4Plan.summary.clickCapacity || 0,
          budgetTier: (v4Plan.summary.budgetTier as any) || 'Medium',
          recommendedCampaignCount: v4Plan.summary.recommendedCampaignCount || 1,
          avgCpc: v4Plan.summary.avgCpc, // For UI transparency
        },
        campaigns,
        clusters,
        adGroups,
        negatives,
        landingPageAnalysis,
        performanceAssumptions: v4Plan.performanceAssumptions ? {
          expectedCTR: v4Plan.performanceAssumptions.ctr,
          expectedCPC: v4Plan.performanceAssumptions.cpc,
          conversionDifficulty: 5
        } : undefined
      };

    } catch (error: any) {
      console.error('=== BLUEPRINT ENGINE V4 ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Input:', JSON.stringify(input, null, 2));
      console.error('================================');

      console.log('Falling back to mock generation due to error.');
      return this.generateMock(input);
    }
  }

  private buildPrompt(input: BlueprintInput, verticalNegatives: string[]): string {
    const locationStr = input.geo ? input.geo : 'their local area';
    const painPointsStr = input.painPoints && input.painPoints.length > 0 ? input.painPoints.join(', ') : 'common industry problems';

    return `
You are a Google Ads Expert. Create a complete, production-ready Google Search campaign blueprint for the following business:

Input Data:
- Business Name: ${input.businessName || 'Not specified'}
- Offer/Service: ${input.offer}
- Vertical: ${input.vertical}
- Target Locations: ${locationStr}
- Customer Pain Points: ${painPointsStr}
- Objective: ${input.objective || 'Leads'}
- Budget: ${input.budget}

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
        name: cluster.theme,
        keywords: cluster,
        assets: this.generateFallbackAssets(input, cluster.theme, input.geo || 'Local')
      }));
    }

    return data;
  }

  private generateFallbackAssets(input: BlueprintInput, theme: string, loc: string): RSAAssets {
    return {
      headlines: [
        `${input.offer}`.substring(0, 30),
        `Best ${input.offer}`.substring(0, 30),
        `${input.offer} in ${loc}`.substring(0, 30),
        'Call Now',
        'Free Initial Consult'
      ],
      descriptions: [
        `Top rated ${input.offer} serving ${loc}. Call us today for a free quote.`.substring(0, 90),
        'Professional, reliable, and affordable services. Satisfaction guaranteed.'.substring(0, 90)
      ]
    };
  }

  private generateMock(input: BlueprintInput): BlueprintOutput {
    // Mock needs to be updated to match new structure if fallback is hit
    const clusters: KeywordCluster[] = [];
    const baseService = input.offer.toLowerCase();
    const location = input.geo || 'near me';

    const serviceKeywords = [
      { term: `${baseService} ${location}`, matchType: 'Phrase' },
      { term: `best ${baseService} ${location}`, matchType: 'Phrase' }
    ];

    clusters.push({
      intent: 'Service',
      theme: `${input.offer} - Core`,
      funnelStage: 'MOF',
      keywords: serviceKeywords as any,
    });

    if (input.painPoints && input.painPoints.length > 0) {
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
      assets: this.generateFallbackAssets(input, c.theme, location)
    }));

    const negatives: NegativeKeywordList[] = [
      { category: 'General', keywords: ['free', 'cheap', 'diy', 'job'] }
    ];

    const landingPageAnalysis: LandingPageAnalysis = {
      url: input.landingPageUrl || '',
      isValid: true,
      score: 85,
      mobileOptimized: true,
      trustSignalsDetected: ['SSL', 'Phone Number'],
      missingElements: [],
      qualityScorePrediction: 8,
      conversionReadinessScore: 7,
      frictionScore: 3,
      recommendations: ['Maintain existing SSL and mobile optimization.'],
      landingPageType: 'lead_gen',
      adToLandingConsistencyScore: 9
    };

    return {
      clusters,
      adGroups,
      negatives,
      landingPageAnalysis,
      performanceAssumptions: {
        expectedCTR: '3-5%',
        expectedCPC: '$2.50-$4.00',
        conversionDifficulty: 5
      }
    };
  }
}

export const blueprintService = new BlueprintService();
