import { keywordRepository, keywordRankRepository, locationRepository, competitorRepository, competitorRankRepository } from '../repositories'
import type { Prisma } from '@prisma/client'
import { fetchMockRankData, type DeviceType } from './rank-provider.mock'

export class RankTrackingService {
  async fetchAndStoreDailyRanks(
    businessId: string,
    devices: DeviceType[] = ['desktop', 'mobile']
  ) {
    const keywords = await keywordRepository.getActiveKeywords(businessId)
    if (keywords.length === 0) return { created: 0, competitorsDetected: 0 }

    const keywordRankInputs: Prisma.KeywordRankCreateManyInput[] = []
    const competitorRankInputs: { competitorId: string; keywordId: string; rankPosition: number; rankingUrl: string }[] = []
    const competitorsDetected = new Set<string>()

    for (const kw of keywords) {
      const location = kw.locationId ? await locationRepository.findById(kw.locationId) : null
      const searchLocation = location?.name || null

      for (const device of devices) {
        const result = await fetchMockRankData(kw.keyword, searchLocation, device)
        const capturedAt = new Date()
        capturedAt.setHours(0, 0, 0, 0)

        // Store the business's own rank
        keywordRankInputs.push({
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

        // Extract and store competitors from SERP
        if (result.serpEntries) {
          for (const entry of result.serpEntries) {
            // Skip the business's own domain
            if (entry.domain === 'example.com') continue

            // Upsert competitor
            const competitor = await competitorRepository.upsertByDomain(
              businessId,
              entry.domain,
              {
                name: entry.title.split(' - ')[0] || entry.domain,
              }
            )

            competitorsDetected.add(competitor.id)

            // Store competitor rank
            competitorRankInputs.push({
              competitorId: competitor.id,
              keywordId: kw.id,
              rankPosition: entry.position,
              rankingUrl: entry.url,
            })
          }
        }
      }
    }

    // Batch create keyword ranks
    let createdCount = 0
    if (keywordRankInputs.length > 0) {
      const payload = await keywordRankRepository.createBatch(keywordRankInputs)
      createdCount = payload.count
    }

    // Batch create competitor ranks
    if (competitorRankInputs.length > 0) {
      const capturedAt = new Date()
      capturedAt.setHours(0, 0, 0, 0)

      // We need to create them individually since we need the competitor ID
      for (const input of competitorRankInputs) {
        try {
          await competitorRankRepository.create({
            competitor: { connect: { id: input.competitorId } },
            keyword: { connect: { id: input.keywordId } },
            rankPosition: input.rankPosition,
            rankingUrl: input.rankingUrl,
            capturedAt,
          })
        } catch (error) {
          // Skip duplicates or errors
          console.error('Error creating competitor rank:', error)
        }
      }
    }

    return { created: createdCount, competitorsDetected: competitorsDetected.size }
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

