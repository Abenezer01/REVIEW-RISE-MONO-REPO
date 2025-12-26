import { seoSnapshotRepository } from '@platform/db';
import { fetchWebsite } from './website-fetcher.service';
import { extractSEOData } from './html-parser.service';
import { evaluateRules } from './rules-engine.service';

export async function analyzeSEOHealth(url: string, userId?: string) {
    try {
        // Normalize URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // 1. Fetch
        const fetchResult = await fetchWebsite(url);
        if (fetchResult.error) {
            throw new Error(fetchResult.error);
        }

        // 2. Parse & Extract Data
        const seoData = await extractSEOData(url, fetchResult.html, fetchResult);
        
        // 3. Evaluate Rules
        const evaluation = evaluateRules(seoData);

        // 4. Construct Final Result
        const healthScore = evaluation.healthScore;

        const result = {
            url: fetchResult.finalUrl,
            healthScore: healthScore,
            timestamp: new Date().toISOString(),
            // Map new dynamic scores to existing API structure
            categoryScores: {
                onPage: evaluation.categoryScores['common_seo'] || { score: 0, percentage: 0 },
                technical: evaluation.categoryScores['server_security'] || { score: 0, percentage: 0 }, 
                content: evaluation.categoryScores['advanced_seo'] || { score: 0, percentage: 0 },
                local: evaluation.categoryScores['mobile'] || { score: 0, percentage: 0 },
            },
            recommendations: evaluation.recommendations.map((rec: any) => ({
                priority: rec.severity.toLowerCase(),
                category: rec.category,
                issue: rec.message,
                recommendation: rec.recommendation,
                impact: `Severity: ${rec.severity}`
            })),
            technicalAnalysis: {
                pageSpeed: {
                    score: seoData.metrics.ttfb < 0.8 ? 100 : (seoData.metrics.ttfb < 1.5 ? 70 : 40),
                    status: seoData.metrics.ttfb < 0.8 ? 'good' : (seoData.metrics.ttfb < 1.5 ? 'fair' : 'poor'),
                    loadTime: Math.round(seoData.metrics.ttfb * 1000)
                },
                mobileOptimization: {
                    score: seoData.mobile.viewport ? 100 : 0,
                    status: seoData.mobile.viewport ? 'good' : 'poor'
                },
                securityHTTPS: {
                    score: seoData.security.sslValid ? 100 : 0,
                    status: seoData.security.sslValid ? 'secure' : 'not-secure'
                }
            },
            seoElements: seoData,
            summary: {
                sitesAnalyzed: 50000,
                accuracyRate: 98,
                userRating: 4.9,
                availability: '24/7'
            }
        };

        // Persist to DB
        let snapshotId: string | undefined;
        try {
            const snapshot = await seoSnapshotRepository.create({
                url: fetchResult.finalUrl,
                healthScore: healthScore,
                categoryScores: result.categoryScores as any,
                recommendations: result.recommendations as any,
                seoElements: seoData as any,
                ...(userId ? { user: { connect: { id: userId } } } : {})
            });
            snapshotId = snapshot.id;
            // eslint-disable-next-line no-console
            console.log(`SEO Snapshot persisted for ${url} (ID: ${snapshotId}, User: ${userId || 'Anonymous'})`);
        } catch { 
            // ignore
            // console.error('Failed to save SEO snapshot to DB:', e); 
            // Don't throw, let the analysis return even if save fails
        }

        return {
            ...result,
            snapshotId
        };

    } catch (err: any) {
        throw new Error(`SEO analysis failed: ${err.message}`);
    }
}
