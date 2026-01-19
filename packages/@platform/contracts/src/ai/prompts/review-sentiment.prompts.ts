/**
 * AI Prompt Templates for Review Sentiment Analysis
 * 
 * These prompts are used to analyze review sentiment, extract emotions,
 * and identify keywords/themes using AI models like Google Gemini.
 */

export const SENTIMENT_ANALYSIS_PROMPT = `
You are an expert in sentiment analysis and customer feedback interpretation.

Analyze the following customer review and determine its overall sentiment.

Review Rating: {rating}/5
Review Content: "{content}"

Consider both the rating and the text content. A high rating with negative text should be flagged appropriately.

Return JSON matching this exact schema:
{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": number (0-100),
  "reasoning": "brief explanation of why this sentiment was chosen"
}

Guidelines:
- "positive": 4-5 star reviews with positive language, or 3 stars with enthusiastic language
- "neutral": 3 star reviews with balanced feedback, or mixed sentiment
- "negative": 1-2 star reviews, or 3+ stars with predominantly negative language
- Confidence should reflect how clear the sentiment is (ambiguous = lower confidence)
`;

export const EMOTION_EXTRACTION_PROMPT = `
You are an expert in emotional intelligence and customer psychology.

Analyze the following customer review and identify the emotions expressed.

Review Content: "{content}"
Overall Sentiment: {sentiment}

Extract specific emotions and emotional themes from the review. Focus on actionable emotional insights.

Return JSON matching this exact schema:
{
  "emotions": ["emotion1", "emotion2", ...] (2-5 emotions),
  "primaryEmotion": "the strongest emotion expressed"
}

Emotion Categories to Consider:
Positive: delight, satisfaction, gratitude, excitement, trust, appreciation, loyalty, impressed
Negative: frustration, disappointment, anger, confusion, concern, dissatisfaction, regret
Neutral: curiosity, indifference, acknowledgment

Specific Themes:
- "praise for staff" - when staff/employees are complimented
- "praise for service" - when service quality is highlighted
- "praise for product" - when products are complimented
- "frustration with wait time" - complaints about delays
- "frustration with pricing" - price concerns
- "confusion about process" - unclear procedures
- "concern about quality" - quality issues

Guidelines:
- Use specific, actionable emotion labels
- Prioritize emotions that provide business insights
- Limit to 2-5 most relevant emotions
- Primary emotion should be the most dominant
`;

export const KEYWORD_EXTRACTION_PROMPT = `
You are an expert in text analysis and business intelligence.

Analyze the following customer review and extract key themes, topics, and specific mentions.

Review Content: "{content}"

Identify recurring themes, specific mentions (staff names, products, services), and actionable topics.

Return JSON matching this exact schema:
{
  "keywords": ["keyword1", "keyword2", ...] (3-8 keywords),
  "topics": ["topic1", "topic2", ...] (1-3 main topics)
}

Keyword Categories:
Service Aspects: "service speed", "customer service", "professionalism", "friendliness", "responsiveness"
Product/Quality: "product quality", "cleanliness", "presentation", "freshness", "variety"
Pricing: "value for money", "pricing", "expensive", "affordable", "overpriced"
Location/Ambiance: "location", "parking", "atmosphere", "decor", "accessibility"
Staff: Extract actual staff names mentioned, or "staff" if general
Specific Services: Extract specific service/product names mentioned

Guidelines:
- Extract 3-8 most relevant keywords
- Use lowercase, standardized phrases
- Include specific names/products when mentioned
- Topics should be high-level themes (1-3 items)
- Prioritize actionable, business-relevant keywords
`;

// Zod schemas for validation
import { z } from 'zod';

export const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string()
});

export const EmotionExtractionSchema = z.object({
  emotions: z.array(z.string()).min(2).max(5),
  primaryEmotion: z.string()
});

export const KeywordExtractionSchema = z.object({
  keywords: z.array(z.string()).min(3).max(8),
  topics: z.array(z.string()).min(1).max(3)
});

export type SentimentAnalysisOutput = z.infer<typeof SentimentAnalysisSchema>;
export type EmotionExtractionOutput = z.infer<typeof EmotionExtractionSchema>;
export type KeywordExtractionOutput = z.infer<typeof KeywordExtractionSchema>;
