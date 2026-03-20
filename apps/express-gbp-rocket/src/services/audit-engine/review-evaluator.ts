import { AuditIssue, EvaluatorResult } from './types';

export interface ReviewEvaluatorResult extends EvaluatorResult {
    reputationDetails: {
        reviewCount: number;
        averageRating: number;
        responseRate: number | null;
    };
}

export class ReviewEvaluator {
    evaluate(rawProfile: any): ReviewEvaluatorResult {
        const issues: AuditIssue[] = [];
        let score = 100;

        // Extract metrics flexibly from potential raw profile shapes
        // Real GBP location payload doesn't inherently contain reviews securely unless enriched
        const reviewCount = rawProfile?.reviewMetrics?.reviewCount || rawProfile?.userRatingCount || (Array.isArray(rawProfile?.reviews) ? rawProfile.reviews.length : 0);
        const averageRating = rawProfile?.reviewMetrics?.averageRating || rawProfile?.rating || 0;

        let responseRate: number | null = null;
        if (Array.isArray(rawProfile?.reviews) && rawProfile.reviews.length > 0) {
            const reviewsWithReplies = rawProfile.reviews.filter((r: any) => r.reviewReply);
            responseRate = (reviewsWithReplies.length / rawProfile.reviews.length) * 100;
        }

        const reputationDetails = {
            reviewCount,
            averageRating,
            responseRate
        };

        // 1. Review Count
        if (reviewCount === 0) {
            score -= 50;
            issues.push({
                code: 'reviews_missing',
                severity: 'critical',
                title: 'No Reviews Found',
                whyItMatters: 'Reviews are the top trust signal for local businesses. Having zero reviews strongly deters customers.',
                recommendation: 'Launch a campaign to ask your best customers for reviews.',
                nextAction: 'Send a review request link to 5 past customers.',
                impactWeight: 10
            });
        } else if (reviewCount < 10) {
            score -= 20;
            issues.push({
                code: 'reviews_low_count',
                severity: 'critical',
                title: 'Low Review Count',
                whyItMatters: 'Profiles with less than 10 reviews lack sufficient social proof compared to established competitors.',
                recommendation: 'Set a goal to reach at least 10 positive reviews.',
                nextAction: 'Ask recent satisfied customers for a review.',
                impactWeight: 8
            });
        }

        // 2. Average Rating
        if (reviewCount > 0 && averageRating < 4.0) {
            score -= 30;
            issues.push({
                code: 'reviews_low_rating',
                severity: 'warning',
                title: 'Low Average Rating',
                whyItMatters: 'Consumers are hesitant to choose businesses with ratings below 4.0 stars.',
                recommendation: 'Actively generate more 5-star reviews to boost your overall average.',
                impactWeight: 8
            });
        }

        // 3. Response Rate
        if (responseRate !== null && responseRate < 80) {
            score -= 10;
            issues.push({
                code: 'reviews_low_response_rate',
                severity: 'opportunity',
                title: 'Low Review Response Rate',
                whyItMatters: 'Responding to reviews shows potential customers that you care about their experience.',
                recommendation: `You have responded to ${Math.round(responseRate)}% of your reviews. Aim for 100%.`,
                nextAction: 'Reply to unanswered reviews.',
                impactWeight: 4
            });
        }

        // Penalty limits bounds
        score = Math.max(0, Math.min(100, score));

        return { score, issues, reputationDetails };
    }
}

export const reviewEvaluator = new ReviewEvaluator();
