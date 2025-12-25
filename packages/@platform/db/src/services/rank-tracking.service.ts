import { keywordRepository, keywordRankRepository, locationRepository } from '../repositories'
import type { Prisma } from '@prisma/client'
import { fetchMockRankData, type DeviceType } from './rank-provider.mock'

export class RankTrackingService {
  async fetchAndStoreDailyRanks(
    businessId: string,
    devices: DeviceType[] = ['desktop', 'mobile']
  ) {
    const keywords = await keywordRepository.getActiveKeywords(businessId)
    if (keywords.length === 0) return { created: 0 }

    const inputs: Prisma.KeywordRankCreateManyInput[] = []

    for (const kw of keywords) {
      const location = kw.locationId ? await locationRepository.findById(kw.locationId) : null
      const searchLocation = location?.name || null

      for (const device of devices) {
        const result = await fetchMockRankData(kw.keyword, searchLocation, device)
        const capturedAt = new Date()
        capturedAt.setHours(0, 0, 0, 0)

        inputs.push({
          keywordId: kw.id,
          rankPosition: result.rankPosition ?? null,
          mapPackPosition: result.mapPackPosition ?? null,
          hasFeaturedSnippet: result.hasFeaturedSnippet,
          hasPeopleAlsoAsk: result.hasPeopleAlsoAsk,
          hasLocalPack: result.hasLocalPack,
          hasKnowledgePanel: result.hasKnowledgePanel,
          hasImagePack: result.hasImagePack,
          hasVideoCarousel: result.hasVideoCarousel,
          rankingUrl: result.rankingUrl,
          searchLocation,
          device,
          capturedAt
        })
      }
    }

    if (inputs.length === 0) return { created: 0 }
    const payload = await keywordRankRepository.createBatch(inputs)
    return { created: payload.count }
  }

  async computeRankChange(
    keywordId: string,
    period: 'daily' | 'weekly',
    device?: DeviceType
  ): Promise<{
    delta: number | null
    direction: 'up' | 'down' | 'none'
    significant: boolean
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const start = new Date(today)
    const baselineDays = period === 'daily' ? 1 : 7
    start.setDate(start.getDate() - baselineDays)

    const ranks = await keywordRankRepository.findByKeyword(keywordId, {
      startDate: start,
      endDate: today,
      device,
      limit: 50
    })

    if (!ranks.length) return { delta: null, direction: 'none', significant: false }

    const latest = ranks[0]
    const baseline = ranks.find(r => {
      const d = new Date(latest.capturedAt)
      const target = new Date(d)
      target.setDate(d.getDate() - baselineDays)
      return r.capturedAt.toDateString() === target.toDateString()
    }) || ranks[ranks.length - 1]

    const latestPos = latest.rankPosition ?? null
    const baselinePos = baseline.rankPosition ?? null
    if (latestPos == null || baselinePos == null) return { delta: null, direction: 'none', significant: false }

    const delta = baselinePos - latestPos
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'none'
    const threshold = period === 'daily' ? 5 : 10
    const significant = Math.abs(delta) >= threshold

    return { delta, direction, significant }
  }
}

export const rankTrackingService = new RankTrackingService()

