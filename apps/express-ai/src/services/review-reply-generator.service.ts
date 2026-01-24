import { llmService } from './llm.service';
import { 
    ReviewReplyVariationsSchema, 
    REVIEW_REPLY_PROMPT,
    ReviewReplyVariations
} from '@platform/contracts';
import { repositories } from '@platform/db';

export class ReviewReplyGeneratorService {
    /**
     * Generates multiple review reply variations using shared LLM Service
     */
    async generateReplyVariations(
        reviewId: string,
        options: {
            tonePreset?: string;
            customBrandVoice?: string;
        } = {}
    ): Promise<ReviewReplyVariations> {
        // 1. Fetch Review Context
        const review = await repositories.review.findById(reviewId);
        if (!review) throw new Error('Review not found');

        // 2. Fetch Brand Context
        const businessId = review.businessId;
        const brandProfile = await repositories.brandProfile.findFirst({
            where: { businessId }
        });
        const brandDNA = await repositories.brandDNA.findByBusinessId(businessId);

        // 3. Prepare Inputs
        const inputs = {
            reviewText: review.content || 'No content provided',
            rating: review.rating,
            sentiment: review.sentiment || (review.rating >= 4 ? 'Positive' : review.rating <= 2 ? 'Negative' : 'Neutral'),
            tags: review.tags.join(', ') || 'none',
            platform: review.platform,
            author: review.author,
            brandVoice: options.customBrandVoice || brandProfile?.description || brandDNA?.voice || 'A professional and customer-focused brand.',
            tone: options.tonePreset || 'Professional'
        };

        // 4. Build Prompt
        let prompt = REVIEW_REPLY_PROMPT;
        Object.entries(inputs).forEach(([key, value]) => {
            prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
        });

        // 5. Call AI
        console.log(`[ReviewReplyGenerator] Generating replies for review ${reviewId} with tone: ${inputs.tone}`);
        
        try {
            const variations = await llmService.generateJSON<ReviewReplyVariations>(prompt, { temperature: 0.8 });
            return ReviewReplyVariationsSchema.parse(variations);
        } catch (error) {
            console.error('[ReviewReplyGenerator] Failed to generate reply variations:', error);
            throw new Error('Failed to generate valid reply variations');
        }
    }
}
