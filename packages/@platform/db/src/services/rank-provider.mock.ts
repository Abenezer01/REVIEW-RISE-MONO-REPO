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

const seededRandom = (seed: string) => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
}

export async function fetchMockRankData(
  keyword: string,
  searchLocation: string | null,
  device: DeviceType
): Promise<MockRankResult> {
  const today = new Date()
  const seed = `${keyword}|${searchLocation || 'global'}|${device}|${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`
  const rand = seededRandom(seed)

  const baseRank = Math.floor(rand() * 20) + 1
  const variance = Math.floor(rand() * 6) - 3
  const rankPosition = Math.max(1, Math.min(100, baseRank + variance))

  const hasLocalPack = rand() < 0.35
  const mapPackPosition = hasLocalPack ? (Math.floor(rand() * 3) + 1) : null

  const rankingUrl = rand() < 0.8 ? `https://www.example.com/${encodeURIComponent(keyword)}` : undefined

  return {
    rankPosition,
    mapPackPosition,
    rankingUrl,
    hasFeaturedSnippet: rand() < 0.1,
    hasPeopleAlsoAsk: rand() < 0.4,
    hasLocalPack,
    hasKnowledgePanel: rand() < 0.05,
    hasImagePack: rand() < 0.2,
    hasVideoCarousel: rand() < 0.15
  }
}

