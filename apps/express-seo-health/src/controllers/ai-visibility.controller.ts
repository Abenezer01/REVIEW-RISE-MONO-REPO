import { Request, Response } from 'express';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';
import { prisma } from '@platform/db';
import { aiVisibilityService } from '../services/ai-visibility.service';

interface AIVisibilityMetrics {
  visibilityScore: number;
  sentimentScore: number;
  shareOfVoice: number;
  citationAuthority: number;
}

interface PlatformData {
  platform: 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity' | 'Bing Copilot';
  rank: number | 'Not Found';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  mentioned: boolean;
  sourcesCount: number;
}

export class AIVisibilityController {
  /**
   * POST /api/v1/ai-visibility/analyze
   * Analyze brand visibility in AI platforms
   */
  async analyze(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json(createErrorResponse('URL is required', 'BAD_REQUEST', 400));
        return;
      }

      // 1. Extract Brand Info
      const { brandName, domain } = await aiVisibilityService.extractBrandInfo(url);

      // 2. Generate Prompts
      const prompts = aiVisibilityService.generatePrompts(brandName);

      // 3. Find Business Context
      let business = await prisma.business.findFirst({
        where: {
          website: {
            contains: domain,
            mode: 'insensitive'
          }
        }
      });

      if (!business) {
        // Fallback: Get the first business in the DB
        business = await prisma.business.findFirst();

        if (!business) {
          try {
            business = await prisma.business.create({
              data: {
                name: brandName,
                slug: `demo-business-${Date.now()}`,
                website: url,
                status: 'active'
              }
            });
          } catch (err) {
            console.error('Failed to create fallback business', err);
          }
        }
      }

      if (!business) {
        res.status(500).json(createErrorResponse('No business context found to save metrics', 'INTERNAL_SERVER_ERROR', 500));
        return;
      }

      // 4. Run Analysis (Simulated Parallel Execution)
      const platforms = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity', 'Bing Copilot'];
      const analysisResults: PlatformData[] = [];
      let totalMentions = 0;
      let totalSentimentScore = 0;
      let totalSources = 0;

      for (const platform of platforms) {
        let platformMentions = 0;
        let platformSentimentScore = 0;
        let platformSources = 0;
        let isMentioned = false;

        // Query each prompt (mocked)
        for (const prompt of prompts) {
          const responseText = await aiVisibilityService.mockLLMQuery(platform, prompt, brandName);
          const result = aiVisibilityService.analyzeResponse(responseText, brandName, domain);

          if (result.mentioned) {
            platformMentions++;
            isMentioned = true;
            if (result.sentiment === 'Positive') platformSentimentScore += 1;
            if (result.sentiment === 'Negative') platformSentimentScore -= 1;
          }
          platformSources += result.sourcesCount;
        }

        // Aggregate for this platform
        const avgSentiment = platformSentimentScore > 0 ? 'Positive' : (platformSentimentScore < 0 ? 'Negative' : 'Neutral');

        analysisResults.push({
          platform: platform as any,
          rank: isMentioned ? Math.floor(Math.random() * 5) + 1 : 'Not Found', // Rank is hard to mock purely from text without SERP logic
          sentiment: avgSentiment,
          mentioned: isMentioned,
          sourcesCount: platformSources
        });

        totalMentions += platformMentions;
        totalSentimentScore += platformSentimentScore;
        totalSources += platformSources;
      }

      // 5. Calculate Aggregate Metrics
      const visibilityScore = Math.round((totalMentions / (platforms.length * prompts.length)) * 100);
      const normalizedSentiment = Math.round(((totalSentimentScore + (platforms.length * prompts.length)) / (2 * platforms.length * prompts.length)) * 100);

      const metrics: AIVisibilityMetrics = {
        visibilityScore: Math.min(100, Math.max(0, visibilityScore)),
        sentimentScore: Math.min(100, Math.max(0, normalizedSentiment)),
        shareOfVoice: Math.floor(Math.random() * (50 - 10) + 10), // Still random as we need competitors for real SoV
        citationAuthority: Math.min(100, totalSources * 10 + 40),
      };

      // 6. Save to Database
      const savedMetric = await prisma.aIVisibilityMetric.create({
        data: {
          businessId: business.id,
          periodStart: new Date(),
          periodEnd: new Date(),
          periodType: 'on-demand',
          visibilityScore: metrics.visibilityScore,
          sentimentScore: metrics.sentimentScore,
          shareOfVoice: metrics.shareOfVoice,
          citationAuthority: metrics.citationAuthority,
          platformData: {
            create: analysisResults.map(p => ({
              platform: p.platform,
              rank: typeof p.rank === 'number' ? p.rank : null,
              sentiment: p.sentiment,
              mentioned: p.mentioned,
              sourcesCount: p.sourcesCount,
              responseSnippet: p.mentioned ? `AI generated response about ${brandName}...` : null
            }))
          }
        },
        include: {
          platformData: true
        }
      });

      console.log(`Saved AI metrics for business ${business.id}, Metric ID: ${savedMetric.id}`);

      // 7. Generate Tips
      const tips = await aiVisibilityService.generateStrategicRecommendations(metrics, analysisResults, brandName);

      // 8. Return Response
      res.json(createSuccessResponse({
        metrics: metrics,
        platformData: analysisResults,
        tips,
        dbRecordId: savedMetric.id
      }));

    } catch (error) {
      console.error('Analysis failed:', error);
      res.status(500).json(createErrorResponse('Failed to analyze AI visibility', 'INTERNAL_SERVER_ERROR', 500));
    }
  }
}
