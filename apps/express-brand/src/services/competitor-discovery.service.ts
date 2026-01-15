import { prisma, CompetitorType } from '@platform/db';
import { fetchSerpResults } from './serp.service';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

// Interface for Discovered Competitor
export interface DiscoveredCompetitor {
    domain: string;
    name?: string;
    url?: string; // Main URL found
    relevanceScore: number;
    ranking: number;
    type: CompetitorType;
    source: string;
}

export const runDiscoveryPipeline = async (businessId: string, keywords: string[]): Promise<any[]> => {
    // 1. Fetch SERP results
    const allDomains: Map<string, { rankSum: number; count: number; urls: string[]; title?: string; snippet?: string }> = new Map();

    for (const keyword of keywords) {
        try {
            const result = await fetchSerpResults(keyword);
            
            result.organic.forEach((item, index) => {
                const domain = item.domain.toLowerCase().replace('www.', '');
                
                if (!allDomains.has(domain)) {
                    allDomains.set(domain, { 
                        rankSum: 0, 
                        count: 0, 
                        urls: [], 
                        title: item.title, 
                        snippet: item.snippet 
                    });
                }
                
                const entry = allDomains.get(domain)!;
                entry.rankSum += (index + 1);
                entry.count += 1;
                entry.urls.push(item.url);
                // Keep the longest snippet/title found? Or first? Keeping first for now.
            });
        } catch (error: any) {
            console.error(`Failed to fetch SERP for keyword: ${keyword}`, error.message);
        }
    }

    // 2. Rank and Deduplicate
    const rankedDomains: any[] = [];
    
    allDomains.forEach((data, domain) => {
        // Simple ranking algorithm
        const score = (100 * data.count) - data.rankSum;
        
        rankedDomains.push({
            domain,
            score,
            urls: data.urls,
            title: data.title,
            snippet: data.snippet,
            rankSum: data.rankSum,
            count: data.count
        });
    });

    // Sort by score descending
    rankedDomains.sort((a, b) => b.score - a.score);

    // Take top 20
    const topDomains = rankedDomains.slice(0, 20);

    // 3. Classify & Save
    const savedCompetitors = [];
    
    // Get existing competitors to avoid duplicates
    const existing = await prisma.competitor.findMany({
        where: { businessId },
        select: { domain: true }
    });
    const existingDomains = new Set(existing.map(c => c.domain));

    let rankCounter = 1;
    for (const item of topDomains) {
        if (existingDomains.has(item.domain)) continue;

        // Classification Logic via Express AI
        let type: CompetitorType = CompetitorType.UNKNOWN;
        
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/classify-competitor`, {
                domain: item.domain,
                title: item.title,
                snippet: item.snippet,
                businessContext: 'Local business' // TODO: Fetch from Business DNA/Settings
            });
            
            if (response.data && response.data.type) {
                // Validate against enum
                const aiType = response.data.type as keyof typeof CompetitorType;
                if (Object.values(CompetitorType).includes(aiType as any)) {
                    type = aiType as CompetitorType;
                }
            }
        } catch (error: any) {
             console.warn(`AI classification failed for ${item.domain}, falling back to heuristics. `, error.message);
             // Fallback heuristics
             if (item.domain.includes('yelp') || item.domain.includes('tripadvisor') || item.domain.includes('angieslist')) {
                type = CompetitorType.AGGREGATOR; 
            } else if (item.domain.includes('wikipedia') || item.domain.includes('medium')) {
                type = CompetitorType.CONTENT;
            } else {
                type = CompetitorType.DIRECT_LOCAL;
            }
        }

        // Create Competitor
        const name = item.domain.split('.')[0].toUpperCase(); // Rudimentary name extraction
        
        try {
            const competitor = await prisma.competitor.create({
                data: {
                    businessId,
                    name: name, // Placeholder name
                    domain: item.domain,
                    website: item.urls[0], // Use first URL found
                    type: type,
                    source: 'discovery',
                    relevanceScore: item.score,
                    ranking: rankCounter++,
                    isUserAdded: false
                }
            });
            savedCompetitors.push(competitor);
        } catch (e: any) {
            console.error(`Failed to save competitor ${item.domain}`, e.message);
        }
    }

    return savedCompetitors;
};

// Helper for manual classification if moved here
export const classifyCompetitor = async (domain: string): Promise<CompetitorType> => {
     try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/classify-competitor`, {
            domain,
            businessContext: 'Local business'
        });
        return response.data.type as CompetitorType;
    } catch {
        return CompetitorType.UNKNOWN;
    }
};
