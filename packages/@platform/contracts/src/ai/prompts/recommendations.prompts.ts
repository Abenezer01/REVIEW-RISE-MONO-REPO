/**
 * AI Prompt Templates for Brand Recommendations
 * 
 * These prompts are used to generate category-specific recommendations
 * using AI models like Google Gemini.
 */

export const RECOMMENDATION_PROMPTS = {
    search: `
You are an SEO expert analyzing a business's search visibility.

Business Context:
{brandDNA}

Current Data:
{currentMetrics}

Competitor Analysis:
{competitorInsights}

Generate 3-5 high-impact SEO recommendations to improve search visibility.
Focus on: keyword optimization, content gaps, technical SEO, backlink opportunities.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "search",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,

    local: `
You are a Local SEO specialist.

Business Context:
{brandDNA}

Current Metrics:
{currentMetrics}

Generate 3-5 actionable recommendations to improve local search visibility.
Focus on: GMB optimization, local citations, review generation, local content.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "local",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,

    social: `
You are a Social Media strategist.

Business Context:
{brandDNA}

Current Presence:
{socialMetrics}

Generate 3-5 recommendations to boost social media visibility and engagement.
Focus on: content strategy, platform optimization, engagement tactics, brand consistency.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "social",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,

    reputation: `
You are an Online Reputation Management expert.

Business Context:
{brandDNA}

Review Data:
{reviewMetrics}

Generate 3-5 recommendations to improve online reputation and trust signals.
Focus on: review generation, response strategy, sentiment improvement, trust building.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "reputation",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,

    conversion: `
You are a Conversion Rate Optimization specialist.

Business Context:
{brandDNA}

Website Data:
{websiteMetrics}

Generate 3-5 recommendations to improve conversion rates and user experience.
Focus on: CTA optimization, trust signals, UX improvements, messaging clarity.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "conversion",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,

    content: `
You are a Content Marketing strategist.

Business Context:
{brandDNA}

Competitor Content:
{competitorContent}

Generate 3-5 content recommendations to fill gaps and establish authority.
Focus on: topic clusters, content types, SEO opportunities, thought leadership.

Return JSON matching this schema:
{
  "recommendations": [
    {
      "category": "content",
      "title": "string (10-200 chars)",
      "description": "string (50-2000 chars)",
      "why": ["reason1", "reason2", ...] (1-5 items),
      "steps": ["step1", "step2", ...] (1-10 items),
      "impact": "low|medium|high|critical",
      "effort": "low|medium|high",
      "confidence": number (0-100),
      "kpiTarget": {
        "metric": "string",
        "target": number,
        "timeframe": "string"
      } (optional)
    }
  ]
}
`,
};

export const VISIBILITY_PLAN_PROMPT = `
You are a Brand Visibility strategist creating a comprehensive 30-day action plan.

Business Context:
{brandDNA}

Current Scores:
- Visibility: {visibilityScore}/100
- Trust: {trustScore}/100
- Consistency: {consistencyScore}/100

Top Recommendations:
{topRecommendations}

Create a detailed 30-day visibility improvement plan with:
1. Clear goals with metrics
2. Week-by-week breakdown (4 weeks)
3. Specific tasks with time estimates
4. Expected outcomes

Return JSON matching this schema:
{
  "title": "string",
  "overview": "string",
  "goals": [
    {
      "metric": "string",
      "current": number,
      "target": number,
      "timeframe": "string"
    }
  ],
  "weeks": [
    {
      "weekNumber": number,
      "focus": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "category": "string",
          "estimatedHours": number
        }
      ]
    }
  ],
  "expectedOutcomes": ["string", ...]
}
`;
