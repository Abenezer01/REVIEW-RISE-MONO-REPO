import { businessRepository, rankTrackingService } from '@platform/db'

export const runRankTrackingJob = async () => {
  const businesses = await businessRepository.findAll()
  let totalCreated = 0
  for (const b of businesses) {
    const res = await rankTrackingService.fetchAndStoreDailyRanks(b.id, ['desktop', 'mobile'])
    totalCreated += res.created
  }
  return { businessesProcessed: businesses.length, recordsCreated: totalCreated }
}

