export type DeviceType = 'desktop' | 'mobile'

export interface MockRankResult {
  rankPosition: number | null
  mapPackPosition: number | null
  rankingUrl?: string
  hasFeaturedSnippet: boolean
  hasPeopleAlsoAsk: boolean
  hasLocalPack: boolean
  hasKnowledgePanel: boolean
  hasImagePack: boolean
  hasVideoCarousel: boolean
}

export interface SerpEntry {
  domain: string
  url: string
  title: string
  position: number
}

export interface FullSerpResult extends MockRankResult {
  serpEntries: SerpEntry[]
}

const seededRandom = (seed: string) => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
}

// Mock competitor domains
const MOCK_COMPETITOR_DOMAINS = [
  'yelp.com',
  'yellowpages.com',
  'tripadvisor.com',
  'competitor-a.com',
  'competitor-b.com',
  'competitor-c.com',
  'local-business-directory.com',
  'industry-leader.com',
  'bestlocal.com',
  'toprated.com',
]

export async function fetchMockRankData(
  keyword: string,
  searchLocation: string | null,
  device: DeviceType
): Promise<FullSerpResult> {
  const today = new Date()
  const seed = `${keyword}|${searchLocation || 'global'}|${device}|${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`
  const rand = seededRandom(seed)

  const baseRank = Math.floor(rand() * 20) + 1
  const variance = Math.floor(rand() * 6) - 3
  const rankPosition = Math.max(1, Math.min(100, baseRank + variance))

  const hasLocalPack = rand() < 0.35
  const mapPackPosition = hasLocalPack ? (Math.floor(rand() * 3) + 1) : null

  const rankingUrl = rand() < 0.8 ? `https://www.example.com/${encodeURIComponent(keyword)}` : undefined

  // Generate SERP entries (simulate 10 organic results)
  const serpEntries: SerpEntry[] = []
  const numResults = 10
  const usedPositions = new Set<number>([rankPosition])

  // Add the business's result first
  serpEntries.push({
    domain: 'example.com',
    url: rankingUrl || `https://www.example.com/${encodeURIComponent(keyword)}`,
    title: `Your Business - ${keyword}`,
    position: rankPosition,
  })

  // Add competitor results
  for (let i = 0; i < numResults - 1; i++) {
    let position: number
    do {
      position = Math.floor(rand() * 20) + 1
    } while (usedPositions.has(position))

    usedPositions.add(position)

    const competitorDomain = MOCK_COMPETITOR_DOMAINS[i % MOCK_COMPETITOR_DOMAINS.length]
    serpEntries.push({
      domain: competitorDomain,
      url: `https://www.${competitorDomain}/${encodeURIComponent(keyword)}`,
      title: `${competitorDomain.split('.')[0]} - ${keyword}`,
      position,
    })
  }

  // Sort by position
  serpEntries.sort((a, b) => a.position - b.position)

  return {
    rankPosition,
    mapPackPosition,
    rankingUrl,
    hasFeaturedSnippet: rand() < 0.1,
    hasPeopleAlsoAsk: rand() < 0.4,
    hasLocalPack,
    hasKnowledgePanel: rand() < 0.05,
    hasImagePack: rand() < 0.2,
    hasVideoCarousel: rand() < 0.15,
    serpEntries,
  }
}

