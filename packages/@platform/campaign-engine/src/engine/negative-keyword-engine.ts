import { CampaignInput } from '../schema/campaign-plan';
import { VERTICAL_PROFILES } from '../config/vertical-profiles';

export interface NegativeKeywordOutput {
    negativeKeywords: string[];
    complianceReviewFlag: boolean;
    reviewNotice: string;
}

export class NegativeKeywordEngine {

    private GLOBAL_NEGATIVES = [
        'free', 'cheap', 'torrent', 'crack', 'hack',
        'jobs', 'hiring', 'career', 'salary', 'resume',
        'training', 'course', 'learn to', 'diy', 'how to make',
        'youtube', 'video', 'pics', 'images'
    ];

    public generateNegatives(input: CampaignInput): NegativeKeywordOutput {
        const profile = VERTICAL_PROFILES[input.vertical];

        let negatives = [...this.GLOBAL_NEGATIVES];

        // Vertical Specifics
        if (profile.negativeKeywords) {
            negatives = [...negatives, ...profile.negativeKeywords];
        }

        // Geo Mismatch (Simple Heuristic: "State" if Local?)
        // In a real system, we'd add "neighboring states" or cities not in target.
        // For now, if Local, we add generic "out of area" checks if possible, or just flag it.
        if (input.vertical === 'Local Service' && input.geo) {
            negatives.push('national', 'usa', 'worldwide');
        }

        // Deduplication
        negatives = Array.from(new Set(negatives));

        return {
            negativeKeywords: negatives,
            complianceReviewFlag: true,
            reviewNotice: "Review before activation to ensure no relevant terms are blocked."
        };
    }
}

export const negativeKeywordEngine = new NegativeKeywordEngine();
