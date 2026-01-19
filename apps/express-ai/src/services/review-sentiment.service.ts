import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import {
    SENTIMENT_ANALYSIS_PROMPT,
    EMOTION_EXTRACTION_PROMPT,
    KEYWORD_EXTRACTION_PROMPT,
    SentimentAnalysisSchema,
    EmotionExtractionSchema,
    KeywordExtractionSchema,
    type SentimentAnalysisOutput,
    type EmotionExtractionOutput,
    type KeywordExtractionOutput
} from '@platform/contracts';

// AI Provider selection from environment
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

export class ReviewSentimentService {
    private async callAI(prompt: string, useJsonFormat: boolean = true): Promise<string | null> {
        console.log(`[ReviewSentiment] Calling AI with provider: ${AI_PROVIDER}`);
        try {
            if (AI_PROVIDER === 'gemini') {
                const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
                const model = gemini.getGenerativeModel({
                    model: 'gemini-3-flash-preview',
                    generationConfig: {
                        temperature: 0.3, // Lower temperature for more consistent analysis
                        ...(useJsonFormat && { responseMimeType: 'application/json' })
                    }
                });
                const result = await model.generateContent(prompt);
                return result.response.text();
            } else {
                // OpenAI
                const apiKey = process.env.OPENAI_API_KEY;
                if (!apiKey) {
                    console.warn('[ReviewSentiment] OPENAI_API_KEY not set.');
                }

                const openai = new OpenAI({
                    apiKey: apiKey,
                });
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "gpt-3.5-turbo-0125",
                    ...(useJsonFormat && { response_format: { type: "json_object" } }),
                    temperature: 0.3,
                });

                const choice = completion.choices?.[0];
                if (!choice?.message) {
                    throw new Error('Invalid response from OpenAI: No message found');
                }

                return choice.message.content;
            }
        } catch (error) {
            console.error(`AI call failed (${AI_PROVIDER}):`, error);
            throw error;
        }
    }

    /**
     * Analyze sentiment of a review
     * @param reviewContent - The text content of the review
     * @param rating - The star rating (1-5)
     * @returns Sentiment analysis with confidence score
     */
    async analyzeSentiment(
        reviewContent: string,
        rating: number
    ): Promise<SentimentAnalysisOutput> {
        // Handle empty reviews
        if (!reviewContent || reviewContent.trim().length === 0) {
            // Infer sentiment from rating alone
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
            if (rating >= 4) sentiment = 'positive';
            else if (rating <= 2) sentiment = 'negative';

            return {
                sentiment,
                confidence: 60, // Lower confidence for rating-only analysis
                reasoning: 'No text content provided, sentiment inferred from rating only'
            };
        }

        const prompt = SENTIMENT_ANALYSIS_PROMPT
            .replace('{rating}', rating.toString())
            .replace('{content}', reviewContent);

        const content = await this.callAI(prompt);
        if (!content) throw new Error('No response from AI for sentiment analysis');

        try {
            const parsed = JSON.parse(content);
            return SentimentAnalysisSchema.parse(parsed);
        } catch (e) {
            console.error('Failed to parse sentiment analysis response:', content);
            throw e;
        }
    }

    /**
     * Extract emotions from a review
     * @param reviewContent - The text content of the review
     * @param sentiment - The overall sentiment (from analyzeSentiment)
     * @returns Array of emotion tags and primary emotion
     */
    async extractEmotions(
        reviewContent: string,
        sentiment: string
    ): Promise<EmotionExtractionOutput> {
        // Handle empty reviews
        if (!reviewContent || reviewContent.trim().length === 0) {
            return {
                emotions: ['indifference'],
                primaryEmotion: 'indifference'
            };
        }

        const prompt = EMOTION_EXTRACTION_PROMPT
            .replace('{content}', reviewContent)
            .replace('{sentiment}', sentiment);

        const content = await this.callAI(prompt);
        if (!content) throw new Error('No response from AI for emotion extraction');

        try {
            const parsed = JSON.parse(content);
            return EmotionExtractionSchema.parse(parsed);
        } catch (e) {
            console.error('Failed to parse emotion extraction response:', content);
            throw e;
        }
    }

    /**
     * Extract keywords and topics from a review
     * @param reviewContent - The text content of the review
     * @returns Keywords and main topics
     */
    async extractKeywords(
        reviewContent: string
    ): Promise<KeywordExtractionOutput> {
        // Handle empty reviews
        if (!reviewContent || reviewContent.trim().length === 0) {
            return {
                keywords: [],
                topics: []
            };
        }

        const prompt = KEYWORD_EXTRACTION_PROMPT
            .replace('{content}', reviewContent);

        const content = await this.callAI(prompt);
        if (!content) throw new Error('No response from AI for keyword extraction');

        try {
            const parsed = JSON.parse(content);
            return KeywordExtractionSchema.parse(parsed);
        } catch (e) {
            console.error('Failed to parse keyword extraction response:', content);
            throw e;
        }
    }

    /**
     * Analyze a complete review (sentiment + emotions + keywords)
     * @param reviewContent - The text content of the review
     * @param rating - The star rating (1-5)
     * @returns Complete analysis
     */
    async analyzeReview(reviewContent: string, rating: number) {
        console.log(`[ReviewSentiment] Analyzing review with rating ${rating}`);

        // Run sentiment analysis first
        const sentimentResult = await this.analyzeSentiment(reviewContent, rating);

        // Run emotions and keywords in parallel
        const [emotionResult, keywordResult] = await Promise.all([
            this.extractEmotions(reviewContent, sentimentResult.sentiment),
            this.extractKeywords(reviewContent)
        ]);

        return {
            sentiment: sentimentResult.sentiment,
            confidence: sentimentResult.confidence,
            reasoning: sentimentResult.reasoning,
            emotions: emotionResult.emotions,
            primaryEmotion: emotionResult.primaryEmotion,
            keywords: keywordResult.keywords,
            topics: keywordResult.topics
        };
    }
}

export const reviewSentimentService = new ReviewSentimentService();
