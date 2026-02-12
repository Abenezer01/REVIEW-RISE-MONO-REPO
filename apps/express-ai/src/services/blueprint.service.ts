
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

export class BlueprintService {
    async generate(input: BlueprintInput): Promise<BlueprintOutput> {
        try {
            const prompt = this.buildPrompt(input);
            console.log('Generating blueprint with prompt length:', prompt.length);
            // Request JSON output from LLM
            const data = await llmService.generateJSON<BlueprintOutput>(prompt, { temperature: 0.7 });

            // Validate and sanitize the output ensuring it matches the expected structure
            // Especially ensuring arrays are not empty if the LLM failed to generate enough content
            return this.sanitizeOutput(data, input);
        } catch (error) {
            console.error('Failed to generate blueprint with LLM, falling back to mock:', error);
            return this.generateMock(input);
        }
    }

    private buildPrompt(input: BlueprintInput): string {
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
- Landing Page URL: ${input.landingPageUrl || 'Not specified'}

Your task is to generate a JSON object containing keyword clusters, ad groups with RSA assets, negative keywords, and a landing page analysis.

Output Schema (JSON):
{
  "clusters": [
    {
      "intent": "Brand" | "Service" | "Commercial" | "Competitor" | "Problem",
      "theme": "string (e.g. 'Emergency Plumbing')",
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
  ],
  "landingPageAnalysis": {
    "url": "string",
    "isValid": boolean,
    "validationMessage": "string (optional, only if isValid is false)",
    "score": number (0-100),
    "mobileOptimized": boolean,
    "trustSignalsDetected": ["string"],
    "missingElements": ["string"]
  }
}

Strict Requirements:
1. Keyword Clusters:
   - Create 4-6 distinct clusters based on the User's input.
   - Group by intent:
     - 'Service': Core service inquiries (e.g. "plumber near me", "emergency plumber").
     - 'Commercial': High-intent research queries with qualifiers like "best", "top rated", "trusted", "reviews" (e.g. "best plumber in [location]", "top rated plumbing service").
     - 'Problem': Symptoms/pain points (e.g. "leaking pipe fix", "no hot water").
     - 'Competitor': ONLY specific competitor brand names or businesses (e.g. "Roto-Rooter", "Mr. Rooter"). Do NOT use generic qualifiers like "best" or "top" here.
   - Use "Phrase" match for core service terms and commercial intent.
   - Use "Broad" match qualifiers for problem-based queries.

2. Ad Groups & RSA Assets:
   - Create one Ad Group for EACH Keyword Cluster.
   - The 'keywords' property in the adGroup matches the cluster.
   
   - RSA Headlines (${RSA_CONSTRAINTS.HEADLINE_MIN_COUNT}-${RSA_CONSTRAINTS.HEADLINE_MAX_COUNT} per ad group):
     - STRICT LIMIT: Max ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} characters per headline (NEVER exceed this).
     - CRITICAL: Incorporate actual keywords from the cluster into headlines.
       * If cluster has "emergency plumber Los Angeles", create headline like "Emergency Plumber LA" (not generic "Expert Help")
       * If cluster has "best plumber", create headline like "Best Plumber Near You" (not just "Top Rated")
     - Mix of headline types:
       * 3-4 headlines with primary keywords from cluster
       * 2-3 headlines with location + service
       * 2-3 headlines with trust signals (Licensed, 5-Star, Insured)
       * 2-3 headlines with CTAs (Call Now, Free Quote, Book Today)
     - IMPORTANT: Generate headlines that are EXACTLY ${RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH} characters or less. Do NOT generate long headlines expecting truncation.
   
   - RSA Descriptions (${RSA_CONSTRAINTS.DESCRIPTION_MIN_COUNT}-${RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT} per ad group):
     - STRICT LIMIT: Max ${RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters per description (NEVER exceed this).
     - TARGET LENGTH: 85-88 characters for optimal display without truncation.
     - CRITICAL: Write descriptions that are naturally 85-88 characters, NOT longer descriptions that need truncation.
     - Each description should:
       * Reference the cluster theme or keywords
       * Include a clear value proposition
       * End with a strong CTA
     - IMPORTANT: Count characters carefully. Aim for 85-88 characters to ensure complete sentences.
     - Example PERFECT description (87 chars): "Need emergency plumbing in LA? Licensed pros available 24/7. Call for fast help!"
     - Example TOO LONG (will be truncated): "If you need emergency plumbing services in Los Angeles, our highly trained and licensed professionals are available..."
     - Example TOO SHORT (wasted space): "Call us for plumbing. We're available 24/7."

3. Negative Keywords:
   - 'General Waste': Universal negatives (free, cheap, diy, job, salary, internship, course).
   - 'Vertical Specific': Negatives specific to ${input.vertical} (e.g. if 'Local Service', exclude 'parts', 'tools', 'supply').

4. Landing Page Analysis:
   - CRITICAL: First validate domain relevance.
   - Check if the domain is appropriate for the business (e.g., google.com, facebook.com, generic domains are NOT valid for a specific business).
   - If the URL appears to be a placeholder, generic site, or unrelated to "${input.offerOrService}", set:
     - "isValid": false
     - "validationMessage": "Landing page URL appears to be invalid or not relevant to the business. Please provide a business-specific URL."
     - "score": 0
     - Skip other analysis fields (set empty arrays/false values)
   - If URL is valid and relevant:
     - Set "isValid": true
     - Simulate an audit based on best practices
     - Evaluate: trust signals, mobile optimization, CTA clarity, local proof elements
     - Suggest missing trust elements key for conversion (e.g. 'Before/After Photos', 'Guarantee Badge', 'Testimonials', 'Service Area Map', 'Emergency Hotline')
   - If no URL provided, set "isValid": true but provide generic recommendations with a lower score.

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
                    // Fix headlines > RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH chars
                    group.assets.headlines = group.assets.headlines.map(h => {
                        if (h.length <= RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH) return h;
                        return h.substring(0, RSA_CONSTRAINTS.HEADLINE_MAX_LENGTH - 3) + '...';
                    }).slice(0, RSA_CONSTRAINTS.HEADLINE_MAX_COUNT);
                } else if (group.assets) {
                    group.assets.headlines = [];
                }

                if (group.assets && group.assets.descriptions) {
                    // Fix descriptions > RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH chars
                    group.assets.descriptions = group.assets.descriptions.map(d => {
                        if (d.length <= RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) return d;
                        return d.substring(0, RSA_CONSTRAINTS.DESCRIPTION_MAX_LENGTH - 3) + '...';
                    }).slice(0, RSA_CONSTRAINTS.DESCRIPTION_MAX_COUNT);
                } else if (group.assets) {
                    group.assets.descriptions = [];
                }
            });
        }

        // Logic check: if adGroups count != clusters count, it might be an issue, but let's just make sure
        // we have at least one ad group if we have clusters.
        // Actually, sometimes LLMs return mismatching arrays. 
        // We can force alignment if adGroups is empty but clusters is not.
        if (data.clusters.length > 0 && data.adGroups.length === 0) {
            data.adGroups = data.clusters.map(cluster => ({
                name: `${cluster.intent} - ${cluster.theme}`,
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
        const clusters: KeywordCluster[] = [];
        const baseService = input.offerOrService.toLowerCase();
        const locations = input.geoTargeting.length > 0 ? input.geoTargeting : ['near me'];

        // Service Intent
        const serviceKeywords = locations.flatMap(loc => [
            { term: `${baseService} ${loc}`, matchType: 'Phrase' },
            { term: `best ${baseService} ${loc}`, matchType: 'Phrase' }
        ]);

        clusters.push({
            intent: 'Service',
            theme: `${input.offerOrService} - Core`,
            keywords: serviceKeywords as any,
        });

        // Problem Intent
        if (input.painPoints.length > 0) {
            clusters.push({
                intent: 'Problem',
                theme: 'Pain Points',
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

        return {
            clusters,
            adGroups,
            negatives,
            landingPageAnalysis: {
                url: input.landingPageUrl || '',
                isValid: true,
                score: 85,
                mobileOptimized: true,
                trustSignalsDetected: ['HTTPS'],
                missingElements: ['Testimonials']
            }
        };
    }
}

export const blueprintService = new BlueprintService();
