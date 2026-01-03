"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankTrackingService = exports.RankTrackingService = void 0;
const repositories_1 = require("../repositories");
const rank_provider_mock_1 = require("./rank-provider.mock");
class RankTrackingService {
    async fetchAndStoreDailyRanks(businessId, devices = ['desktop', 'mobile']) {
        const keywords = await repositories_1.keywordRepository.getActiveKeywords(businessId);
        if (keywords.length === 0)
            return { created: 0 };
        const inputs = [];
        for (const kw of keywords) {
            const location = kw.locationId ? await repositories_1.locationRepository.findById(kw.locationId) : null;
            const searchLocation = location?.name || null;
            for (const device of devices) {
                const result = await (0, rank_provider_mock_1.fetchMockRankData)(kw.keyword, searchLocation, device);
                const capturedAt = new Date();
                capturedAt.setHours(0, 0, 0, 0);
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
                });
            }
        }
        if (inputs.length === 0)
            return { created: 0 };
        const payload = await repositories_1.keywordRankRepository.createBatch(inputs);
        return { created: payload.count };
    }
    async computeRankChange(keywordId, period, device) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(today);
        const baselineDays = period === 'daily' ? 1 : 7;
        start.setDate(start.getDate() - baselineDays);
        const ranks = await repositories_1.keywordRankRepository.findByKeyword(keywordId, {
            startDate: start,
            endDate: today,
            device,
            limit: 50
        });
        if (!ranks.length)
            return { delta: null, direction: 'none', significant: false };
        const latest = ranks[0];
        const baseline = ranks.find(r => {
            const d = new Date(latest.capturedAt);
            const target = new Date(d);
            target.setDate(d.getDate() - baselineDays);
            return r.capturedAt.toDateString() === target.toDateString();
        }) || ranks[ranks.length - 1];
        const latestPos = latest.rankPosition ?? null;
        const baselinePos = baseline.rankPosition ?? null;
        if (latestPos == null || baselinePos == null)
            return { delta: null, direction: 'none', significant: false };
        const delta = baselinePos - latestPos;
        const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'none';
        const threshold = period === 'daily' ? 5 : 10;
        const significant = Math.abs(delta) >= threshold;
        return { delta, direction, significant };
    }
}
exports.RankTrackingService = RankTrackingService;
exports.rankTrackingService = new RankTrackingService();
