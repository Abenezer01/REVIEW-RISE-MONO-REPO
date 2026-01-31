import { Request, Response } from 'express';
import { keywordRankRepository } from '@platform/db';
import { createSuccessResponse, createErrorResponse, ErrorCode } from '@platform/contracts';
import type { BulkIngestRanksDTO } from '@platform/contracts';

export class RankIngestionController {
  /**
   * POST /api/ranks/ingest - Ingest rank data from external sources
   */
  async ingestRanks(req: Request, res: Response): Promise<void> {
    try {
      const { keywords }: BulkIngestRanksDTO = req.body;

      if (!Array.isArray(keywords) || keywords.length === 0) {
        const errorResponse = createErrorResponse('keywords array is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

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

      const response = createSuccessResponse({
          ingested: result.count,
          message: `${result.count} rank records ingested successfully`,
      }, 'Rank records ingested successfully', 201, { requestId: req.id });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error('Error ingesting ranks:', error);
      const errorResponse = createErrorResponse('Failed to ingest rank data', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * POST /api/ranks/ingest/csv - Upload and parse CSV file for rank data
   */
  async ingestFromCSV(req: Request, res: Response): Promise<void> {
    try {
      const { csvContent, businessId } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        const errorResponse = createErrorResponse('csvContent string is required', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const lines = csvContent.split('\n');
      const dataRows = lines.slice(1).filter(l => l.trim().length > 0);

      const ranksToCreate = [];
      const errors = [];

      if (!businessId) {
        const errorResponse = createErrorResponse('businessId is required for CSV ingestion', ErrorCode.BAD_REQUEST, 400, undefined, req.id);
        res.status(errorResponse.statusCode).json(errorResponse);
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

      const response = createSuccessResponse({
        message: `Processed ${lines.length - 1} lines`,
        ingested: ranksToCreate.length,
        errors: errors.length > 0 ? errors : undefined
      }, 'CSV ingestion completed', 201, { requestId: req.id });
      res.status(response.statusCode).json(response);

    } catch (error: any) {
      console.error('Error ingesting from CSV:', error);
      const errorResponse = createErrorResponse('Failed to ingest from CSV', ErrorCode.INTERNAL_SERVER_ERROR, 500, error.message, req.id);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

export const rankIngestionController = new RankIngestionController();
