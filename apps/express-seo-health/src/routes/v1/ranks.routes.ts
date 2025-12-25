import { Router } from 'express';
import { rankIngestionController } from '../../controllers/rank-ingestion.controller';

const router = Router();

// Rank data ingestion routes
router.post('/ingest', rankIngestionController.ingestRanks.bind(rankIngestionController));
router.post('/ingest/csv', rankIngestionController.ingestFromCSV.bind(rankIngestionController));

export default router;
