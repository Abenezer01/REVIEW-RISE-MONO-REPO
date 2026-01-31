import { Router } from 'express';
import { rankIngestionController } from '../../controllers/rank-ingestion.controller';
import { validateRequest } from '@platform/middleware';
import { IngestRankSchema } from '@platform/contracts';

const router = Router();

// Rank data ingestion routes
router.post('/ingest', validateRequest(IngestRankSchema), rankIngestionController.ingestRanks.bind(rankIngestionController));
router.post('/ingest/csv', rankIngestionController.ingestFromCSV.bind(rankIngestionController));

export default router;
