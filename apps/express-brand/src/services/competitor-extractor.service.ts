import axios from 'axios';
import * as cheerio from 'cheerio';
import { prisma } from '@platform/db';

export interface ExtractedSnapshot {
    headline?: string;
    uvp?: string;
    serviceList: string[];
    pricingCues: string[];
    trustSignals: {
        badges: string[];
        certifications: string[];
        reviewCount?: number;
        avgRating?: number;
    };
    ctaStyles: string[];
    contentCategories: string[];
}

export const extractCompetitorData = async (url: string): Promise<ExtractedSnapshot> => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const snapshot: ExtractedSnapshot = {
            serviceList: [],
            pricingCues: [],
            trustSignals: {
                badges: [],
                certifications: []
            },
            ctaStyles: [],
            contentCategories: []
        };

        // 1. Extract Headline (H1) & UVP
        snapshot.headline = $('h1').first().text().trim() || $('title').text().trim();
        
        // UVP: Usually the first p tag after H1 or meta description
        const firstP = $('h1').first().next('p').text().trim();
        const metaDesc = $('meta[name="description"]').attr('content');
        snapshot.uvp = firstP || metaDesc || '';

        // 2. Extract Service List (Heuristic: Nav items or Lists in "Services" section)
        // Simple heuristic: Look for 'li' in nav or divs with class 'service'
        $('nav li, .services li, #services li').each((_, el) => {
            const text = $(el).text().trim();
            if (text.length > 3 && text.length < 50) {
                snapshot.serviceList.push(text);
            }
        });
        // Dedupe
        snapshot.serviceList = [...new Set(snapshot.serviceList)].slice(0, 10);

        // 3. Pricing Cues
        const pricingKeywords = ['price', 'pricing', 'plan', 'month', 'year', 'consultation', 'quote', '$'];
        $('body').text().split('\n').forEach(line => {
            const trimmed = line.trim();
            if (pricingKeywords.some(k => trimmed.toLowerCase().includes(k)) && trimmed.length < 100 && trimmed.length > 5) {
                // simple primitive check
                 // snapshot.pricingCues.push(trimmed); // This produces too much noise usually.
            }
        });
        // Better: Find buttons with pricing related text
        $('a, button').each((_, el) => {
            const text = $(el).text().toLowerCase();
            if (text.includes('get a quote') || text.includes('pricing') || text.includes('book now')) {
                snapshot.pricingCues.push($(el).text().trim());
            }
        });

        // 4. Trust Signals
        // Look for typical trust classes or images
        $('.badges img, .certifications img, .testimonials').each((_, el) => {
           const alt = $(el).attr('alt');
           if (alt) snapshot.trustSignals.badges.push(alt);
        });
        
        // 5. CTA Styles
        $('a.btn, button.btn, a.button, button.button').each((_, el) => {
            snapshot.ctaStyles.push($(el).text().trim());
        });
        snapshot.ctaStyles = [...new Set(snapshot.ctaStyles)];

        return snapshot;
    } catch (error: any) {
        console.error(`Failed to extract data from ${url}`, error.message);
        
        // Return mostly empty snapshot on failure, or rethrow as specific error
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
             throw new Error(`Could not resolve domain: ${url}. Please verify the website address.`);
        }
        
        if (error.response && error.response.status === 403) {
            throw new Error(`Access denied to ${url}. The site may block scrapers.`);
        }

        throw new Error(`Failed to extract data: ${error.message}`);
    }
};

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';

export const createSnapshot = async (competitorId: string) => {
    // Get competitor URL
    const competitor = await prisma.competitor.findUnique({
        where: { id: competitorId }
    });

    if (!competitor || !competitor.website) {
        throw new Error('Competitor not found or has no website');
    }

    try {
        const extracted = await extractCompetitorData(competitor.website);
        
        // AI Enrichment: Differentiation Analysis
        let aiAnalysis = {
            differentiators: {},
            whatToLearn: [],
            whatToAvoid: [],
            trustMetrics: { rating: null, clientCount: null, awardCount: null }
        };

        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/analyze-competitor`, {
                domain: competitor.domain || competitor.website,
                headline: extracted.headline,
                uvp: extracted.uvp,
                serviceList: extracted.serviceList,
                businessContext: 'Local business' // TODO: Context from Business definition
            });
            
            if (aiResponse.data) {
                aiAnalysis = aiResponse.data;
            }
        } catch (error: any) {
            console.warn('AI Analysis failed, proceeding with raw extraction.', error.message);
        }

        // Save Snapshot
        return prisma.competitorSnapshot.create({
            data: {
                competitorId,
                headline: extracted.headline,
                uvp: extracted.uvp,
                serviceList: extracted.serviceList,
                pricingCues: extracted.pricingCues,
                trustSignals: extracted.trustSignals as any,
                ctaStyles: extracted.ctaStyles,
                contentCategories: [], 
                // AI Fields
                differentiators: aiAnalysis.differentiators,
                whatToLearn: aiAnalysis.whatToLearn,
                whatToAvoid: aiAnalysis.whatToAvoid,
                metrics: {
                    trustMetrics: aiAnalysis.trustMetrics
                }
            }
        });
    } catch (e) {
        console.error(e);
        throw e;
    }
};
