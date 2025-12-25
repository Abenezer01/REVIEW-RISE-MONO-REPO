import { Request, Response } from 'express';
import { keywordRankRepository } from '@platform/db';
import { createSuccessResponse, createErrorResponse } from '@platform/contracts';
import type { BulkIngestRanksDTO } from '@platform/contracts';

export class RankIngestionController {
  /**
   * POST /api/ranks/ingest - Ingest rank data from external souዖዖrces
   */
  async ingestRanks(req: Request, res: Response): Promise<void> {
    try {
      const { keywords }: BulkIngestRanksDTO = req.body;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        res.status(400).json(createErrorResponse('keywords array is requiዖred', 'BAD_REQUEST', 400));
        return;
      }



      // You could add validation here to ensure keywords exist and belong to authenticated business
      // For now, we'll trust the input

      // Create rank records
      const rankData = keywords.map((k) => ({
        keywordId: k.keywordId,
        rankPosition: k.rankPosition,
        mapPackPosition: k.mapPackPosition,
        hasFeaturedSnippet: k.hasFeaturedSnippet ?? false,
        hasPeopleAlsoAsk: k.hasPeopleAlsoAsk ?? false,
        hasLocalPack: k.hasLocalPack ?? false,
        hasKnowledgePanel: k.hasKnowledgePanel ?? false,
        hasImagePack: k.hasImagePack ?? false,
        hasVideoCarousel: k.hasVideoCarousel ?? false,
        rankingUrl: k.rankingUrl,
        searchLocation: k.searchLocation,
        device: k.device ?? 'desktop',
        capturedAt: k.capturedAt ? new Date(k.capturedAt) : new Date(),
      }));

      const result = await keywordRankRepository.createBatch(rankData);

      res.status(201).json(
        createSuccessResponse({
          ingested: result.count,
          message: `${result.count} rank records ingested successfully`,
        })
      );
    } catch (error) {
      console.error('Error ingesting ranks:', error);
      res.status(500).json(createErrorResponse('Failed to ingest rank data', 'INTERNAL_SERVER_ERROR', 500));
    }
  }

  /**
   * POST /api/ranks/ingest/csv - Upload and parse CSV file for rank data
   * Note: This would require multipart/form-data handling (multer or similar)
   */
  async ingestFromCSV(req: Request, res: Response): Promise<void> {
    try {
      // Expecting JSON with csvContent because multipart setup is not present
      const { csvContent, businessId } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        res.status(400).json(createErrorResponse('csvContent string is required', 'BAD_REQUEST', 400));
        return;
      }

      const lines = csvContent.split('\n');
      // Format: keyword, rankPosition, mapPackPosition, rankingUrl, capturedAt
      // Skip header
      const dataRows = lines.slice(1).filter(l => l.trim().length > 0);

      const ranksToCreate = [];
      const errors = [];

      // We need keyword IDs. If CSV provides Keyword TEXT, we need to map it.
      // This requires fetching all keywords for the business.
      if (!businessId) {
        res.status(400).json(createErrorResponse('businessId is required for CSV ingestion', 'BAD_REQUEST', 400));
        return;
      }

      const { keywordRepository, keywordRankRepository } = await import('@platform/db');
      const businessKeywords = await keywordRepository.findByBusiness(businessId as string, { limit: 1000 });
      const keywordMap = new Map(businessKeywords.map(k => [k.keyword.toLowerCase(), k.id]));

      for (const line of dataRows) {
        const [text, rank, mapRank, url, date] = line.split(',').map(s => s.trim());

        const keywordId = keywordMap.get(text.toLowerCase());
        if (!keywordId) {
          errors.push(`Keyword not found: ${text}`);
          continue;
        }

        ranksToCreate.push({
          keywordId,
          rankPosition: rank ? parseInt(rank) : null,
          mapPackPosition: mapRank ? parseInt(mapRank) : null,
          rankingUrl: url || null,
          capturedAt: date ? new Date(date) : new Date(),
          device: 'desktop'
        });
      }

      if (ranksToCreate.length > 0) {
        await keywordRankRepository.createBatch(ranksToCreate);
      }

      res.status(201).json(createSuccessResponse({
        message: `Processed ${lines.length - 1} lines`,
        ingested: ranksToCreate.length,
        errors: errors.length > 0 ? errors : undefined
      }));

    } catch (error) {
      console.error('Error ingesting from CSV:', error);
      res.status(500).json(createErrorResponse('Failed to ingest from CSV', 'INTERNAL_SERVER_ERROR', 500));
    }
  }
}

export const rankIngestionController = new RankIngestionController();
