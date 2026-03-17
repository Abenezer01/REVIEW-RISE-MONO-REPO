import { AuditIssue, EvaluatorResult } from './types';

export interface CompetitorEvaluatorResult extends EvaluatorResult {
    competitorInsights: {
        competitorCount: number;
        avgCompetitorRating: number | null;
        avgCompetitorReviewCount: number | null;
        avgCompetitorPhotoCount: number | null;
    };
}

export class CompetitorEvaluator {
    evaluate(rawProfile: any, competitors: any[]): CompetitorEvaluatorResult {
        const issues: AuditIssue[] = [];
        let score = 100;

        if (!competitors || competitors.length === 0) {
            return {
                score: 100,
                issues: [],
                competitorInsights: {
                    competitorCount: 0,
                    avgCompetitorRating: null,
                    avgCompetitorReviewCount: null,
                    avgCompetitorPhotoCount: null
                }
            };
        }

        const competitorCount = competitors.length;

        const avgRating = competitors.reduce((acc, c) => acc + (c.rating || 0), 0) / competitorCount;
        const avgReviews = competitors.reduce((acc, c) => acc + (c.reviewCount || 0), 0) / competitorCount;
        const avgPhotos = competitors.reduce((acc, c) => acc + (c.photoCount || 0), 0) / competitorCount;

        const profileReviewCount = rawProfile?.reviewMetrics?.reviewCount || rawProfile?.userRatingCount || 0;
        const profileRating = rawProfile?.reviewMetrics?.averageRating || rawProfile?.rating || 0;
        const profilePhotoCount = Array.isArray(rawProfile?.media) ? rawProfile.media.length : 0;

        // Review count comparison
        if (avgReviews > 0 && profileReviewCount < avgReviews) {
            const gap = Math.round(avgReviews - profileReviewCount);
            const severity = profileReviewCount < avgReviews * 0.5 ? 'critical' : 'warning';
            score -= severity === 'critical' ? 25 : 15;
            issues.push({
                code: 'competitor_review_gap',
                severity,
                title: 'Below Average Review Count vs Competitors',
                whyItMatters: `Your competitors average ${Math.round(avgReviews)} reviews. You are ${gap} reviews behind, which reduces your competitive visibility.`,
                recommendation: `Generate at least ${gap} more positive reviews to match your competitors' average.`,
                nextAction: 'Launch a review request campaign to catch up.',
                impactWeight: severity === 'critical' ? 9 : 6
            });
        }

        // Rating comparison
        if (avgRating > 0 && profileRating < avgRating - 0.3) {
            score -= 15;
            issues.push({
                code: 'competitor_rating_gap',
                severity: 'warning',
                title: 'Lower Average Rating than Competitors',
                whyItMatters: `Competitors in your area average ${avgRating.toFixed(1)} stars. Your rating is below the local benchmark.`,
                recommendation: 'Focus on improving customer experience to raise your average rating.',
                nextAction: 'Respond to all reviews (especially negatives) and follow up with dissatisfied customers.',
                impactWeight: 7
            });
        }

        // Photo count comparison
        if (avgPhotos > 5 && profilePhotoCount < avgPhotos) {
            const photoGap = Math.round(avgPhotos - profilePhotoCount);
            score -= 10;
            issues.push({
                code: 'competitor_photo_gap',
                severity: 'opportunity',
                title: 'Fewer Photos than Competitor Average',
                whyItMatters: `Competitors average ${Math.round(avgPhotos)} photos. Uploading ${photoGap} more photos could significantly improve your listing attractiveness.`,
                recommendation: `Upload ${photoGap}+ high-quality photos to match your competitors.`,
                nextAction: 'Schedule a photo shoot for your location.',
                impactWeight: 5
            });
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            issues,
            competitorInsights: {
                competitorCount,
                avgCompetitorRating: avgRating || null,
                avgCompetitorReviewCount: avgReviews || null,
                avgCompetitorPhotoCount: avgPhotos || null
            }
        };
    }
}

export const competitorEvaluator = new CompetitorEvaluator();
