import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export class AIVisibilityService {
  /**
   * Extract brand name and domain from a URL
   */
  async extractBrandInfo(targetUrl: string): Promise<{ brandName: string; domain: string }> {
    try {
      // 1. Parse Domain
      const parsedUrl = new URL(targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`);
      const domain = parsedUrl.hostname.replace('www.', '');

      // 2. Default Brand Name (Option A: Simple Regex)
      // semrush.com -> semrush
      let brandName = domain.split('.')[0];
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);

      // 3. Enhance with Metadata (Option B: Fetch Title/H1)
      try {
        const response = await axios.get(parsedUrl.toString(), {
          timeout: 5000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RiseReviewBot/1.0;)'
          }
        });

        const $ = cheerio.load(response.data);

        // Try getting Open Graph Site Name first
        const ogSiteName = $('meta[property="og:site_name"]').attr('content');
        if (ogSiteName) {
          brandName = ogSiteName;
        } else {
          // Fallback to Title
          const title = $('title').text().trim();
          if (title) {
            // Common pattern: "Page Title | Brand Name" or "Brand Name: Tagline"
            const separators = ['|', '-', ':', '•'];
            for (const sep of separators) {
              if (title.includes(sep)) {
                // Heuristic: Brand is usually the shorter part or the last part
                const parts = title.split(sep).map(s => s.trim());
                // Often the brand is at the end "Home | Semrush"
                const candidate = parts[parts.length - 1];
                if (candidate && candidate.length < 30) {
                  brandName = candidate;
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn('Failed to fetch metadata for brand extraction, using domain fallback', error);
      }

      return { brandName, domain };
    } catch (error) {
      console.error('Invalid URL provided', error);
      // Fallback
      return { brandName: 'Unknown Brand', domain: targetUrl };
    }
  }

  /**
   * Generate relevant prompts for the brand
   */
  generatePrompts(brandName: string, _industry: string = 'General'): string[] {
    return [
      `What is ${brandName}?`,
      `Is ${brandName} legitimate?`,
      `Top alternatives to ${brandName}`,
      `Review of ${brandName} services`,
      `How does ${brandName} compare to competitors?`
    ];
  }

  /**
   * Analyze text for brand visibility signals
   */
  analyzeResponse(
    responseText: string,
    brandName: string,
    domain: string
  ): { mentioned: boolean; sentiment: 'Positive' | 'Neutral' | 'Negative'; sourcesCount: number } {

    // 1. Check Mentions
    const regex = new RegExp(brandName, 'i'); // Case insensitive
    const mentioned = regex.test(responseText);

    // 2. Count Sources (Links to domain)
    // Simple check for domain presence in text or markdown links
    const domainRegex = new RegExp(domain.replace('.', '\\.'), 'i');
    const sourcesCount = (responseText.match(domainRegex) || []).length;

    // 3. Basic Sentiment Analysis (Keyword based for MVP)
    let sentiment: 'Positive' | 'Neutral' | 'Negative' = 'Neutral';
    if (mentioned) {
      const lowerText = responseText.toLowerCase();
      const positiveWords = ['great', 'excellent', 'best', 'reliable', 'top', 'recommend', 'good', 'leader'];
      const negativeWords = ['bad', 'poor', 'avoid', 'scam', 'slow', 'expensive', 'terrible', 'worst'];

      let score = 0;
      positiveWords.forEach(w => { if (lowerText.includes(w)) score++; });
      negativeWords.forEach(w => { if (lowerText.includes(w)) score--; });

      if (score > 0) sentiment = 'Positive';
      if (score < 0) sentiment = 'Negative';
    }

    return { mentioned, sentiment, sourcesCount };
  }

  /**
   * Mock LLM Query - Simulates getting a response from an AI
   * In production, this would call OpenAI, Anthropic, etc.
   */
  async mockLLMQuery(platform: string, prompt: string, brandName: string): Promise<string> {
    // Simulate latency
    await new Promise(r => setTimeout(r, 500)); 

    const rand = Math.random();
    const promptLower = prompt.toLowerCase();
    
    // Platform-specific flavor text
    let intro = '';
    if (platform === 'ChatGPT') intro = "As an AI language model, I can tell you that ";
    if (platform === 'Claude') intro = "Based on my knowledge cutoff, ";
    if (platform === 'Perplexity') intro = "According to search results, ";
    if (platform === 'Gemini') intro = "I found these sources about the brand: ";
    if (platform === 'Bing Copilot') intro = "Searching the web... Here is what I found: ";

    // Context-aware response generation
    let responseBody = '';

    // Scenario 1: "Alternatives" or "Competitors"
    if (promptLower.includes('alternative') || promptLower.includes('competitor') || promptLower.includes('best')) {
        if (rand > 0.4) {
            responseBody = `Top options in this market include ${brandName}, CompetitorX, and CompetitorY. ${brandName} is particularly known for its robust features and user-friendly interface.`;
        } else if (rand > 0.2) {
            responseBody = `Users often compare CompetitorA and CompetitorB. While ${brandName} is a player in this field, some users prefer CompetitorA for enterprise needs.`;
        } else {
            responseBody = `The leading tools are currently MarketLeader, BigCorp, and FastStartup. They offer comprehensive suites for professionals.`;
        }
    } 
    // Scenario 2: "Legitimate" or "Review" or "What is"
    else {
        if (rand > 0.3) {
            // Positive/Neutral Mention
            responseBody = `${brandName} is a legitimate and well-regarded provider. Reviews generally praise their customer support and reliability. You can visit them at ${brandName.toLowerCase()}.com.`;
        } else if (rand > 0.1) {
             // Mixed/Negative
             responseBody = `${brandName} operates in this sector but has received mixed feedback regarding pricing and stability. It is worth comparing with other established brands.`;
        } else {
             // No Mention (Hallucination or Irrelevance)
             responseBody = `I don't have enough specific information to provide a detailed review of that specific brand. However, when looking for services in this industry, you should consider reputation and uptime.`;
        }
    }

    return `${intro}${responseBody}`;
  }

  /**
   * Generate strategic recommendations based on analysis data
   * Simulates an AI consultant analyzing the specific metrics
   */
  async generateStrategicRecommendations(
    metrics: { visibilityScore: number; citationAuthority: number; sentimentScore: number },
    platformData: any[],
    brandName: string
  ): Promise<any[]> {
    const recommendations: any[] = [];

    // 1. Analyze Visibility Gaps
    const lowVisibilityPlatforms = platformData
      .filter(p => !p.mentioned)
      .map(p => p.platform);

    if (lowVisibilityPlatforms.length > 0) {
      recommendations.push({
        id: 'rec_visibility_1',
        title: 'Expand Entity Presence on AI Knowledge Bases',
        description: `Our analysis detected that ${brandName} is missing from responses on ${lowVisibilityPlatforms.join(', ')}. AI models often rely on structured data sources. I recommend implementing Organization and LocalBusiness JSON-LD schema on your homepage to explicitly define your brand entity for these models.`,
        impact: 'High',
        type: 'technical'
      });
    }

    // 2. Analyze Citation Authority
    if (metrics.citationAuthority < 50) {
      recommendations.push({
        id: 'rec_authority_1',
        title: 'Boost Digital Footprint & Citations',
        description: `Your Citation Authority score of ${metrics.citationAuthority}/100 suggests that AI models are struggling to verify your brand's legitimacy through third-party sources. To fix this, ensure your NAP (Name, Address, Phone) is consistent across major business directories like Crunchbase, LinkedIn, and industry-specific aggregators.`,
        impact: 'High',
        type: 'authority'
      });
    }

    // 3. Analyze Content/Sentiment
    if (metrics.sentimentScore < 70) {
      recommendations.push({
        id: 'rec_sentiment_1',
        title: 'Refine Brand Narrative for Sentiment',
        description: `The sentiment analysis indicates mixed signals about ${brandName}. AI models often mirror the tone found in reviews and press mentions. I suggest auditing your "About Us" page and recent press releases to ensure they clearly articulate your value proposition using positive, authoritative language that LLMs can easily parse.`,
        impact: 'Medium',
        type: 'content'
      });
    } else {
      recommendations.push({
        id: 'rec_content_1',
        title: 'Optimize Content for Answer Engines',
        description: `While your sentiment is positive, you can capture more "share of voice" by creating Q&A style content. Create a dedicated FAQ section addressing "What is ${brandName}?" and "Pricing for ${brandName}" to directly feed the answers users are asking AI assistants.`,
        impact: 'Medium',
        type: 'content'
      });
    }

    return recommendations;
  }
}

export const aiVisibilityService = new AIVisibilityService();
