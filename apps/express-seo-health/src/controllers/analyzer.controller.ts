import type { Request, Response } from 'express'
import { createSuccessResponse } from '@platform/contracts'
import { analyzeSEOHealth } from '../services/seo-analyzer.service'

export const getAnalyzerSummary = async (req: Request, res: Response) => {
    try {
        const url = (req.query.url as string) || 'https://google.com'; // Fallback if no URL provided

        // Run the real analysis service
        const analysis = await analyzeSEOHealth(url);

        // Map the real analysis output to the V2 Frontend schema
        const data = {
            seoScore: analysis.healthScore,
            scanId: analysis.snapshotId || `scan-${Date.now()}`,
            lastScannedAt: new Date(analysis.timestamp).toISOString(),
            url: analysis.url,
            issues: {
                critical: analysis.recommendations.filter((r: any) => r.priority === 'critical').length,
                high: analysis.recommendations.filter((r: any) => r.priority === 'high').length,
                medium: analysis.recommendations.filter((r: any) => r.priority === 'medium').length,
                low: analysis.recommendations.filter((r: any) => r.priority === 'low').length
            },

            alerts: analysis.recommendations.slice(0, 3).map((rec: any, i: number) => ({
                id: `alert-${i}`,
                type: rec.priority === 'critical' ? 'Critical' : 'Opportunity',
                message: rec.issue,
                actionLabel: rec.priority === 'critical' ? 'Fix Now' : 'Review'
            })),

            htmlDetails: {
                metaTitle: {
                    value: analysis.seoElements.title?.value || 'Missing',
                    isOptimal: (analysis.seoElements.title?.length || 0) > 30 && (analysis.seoElements.title?.length || 0) < 65,
                    statusLabel: (analysis.seoElements.title?.length || 0) > 30 ? 'Optimal Length' : 'Needs Work'
                },
                metaDescription: {
                    value: 'Hidden in analysis', // The parser only gives exists & length and not value.
                    isOptimal: (analysis.seoElements.metaDescription?.length || 0) > 120,
                    statusLabel: (analysis.seoElements.metaDescription?.length || 0) > 120 ? 'Optimal Length' : 'Too Short'
                },
                wordCount: analysis.seoElements.content?.wordCount || 0,
                statusCode: 200, // Assuming 200 if fetch succeeded
            },

            categoryScores: [
                {
                    id: 'onPage',
                    label: 'On-Page SEO',
                    score: analysis.categoryScores.onPage.score,
                    description: 'Meta tags, headers, image alt text, and internal linking structure.',
                    checks: analysis.recommendations.filter((r: any) => r.category === 'common_seo').map((rec: any, i: number) => ({
                        id: `op-${i}`,
                        label: rec.issue,
                        status: rec.priority === 'critical' ? 'Critical' : rec.priority === 'high' ? 'Warning' : 'Good',
                        detail: rec.issue,
                        severity: rec.priority,
                        recommendation: rec.recommendation,
                        impact: rec.impact
                    }))
                },
                {
                    id: 'technical',
                    label: 'Technical Performance',
                    score: analysis.categoryScores.technical.score,
                    description: 'Server response, Core Web Vitals, and mobile usability.',
                    checks: analysis.recommendations.filter((r: any) => r.category === 'server_security' || r.category === 'mobile').map((rec: any, i: number) => ({
                        id: `tech-${i}`,
                        label: rec.issue,
                        status: rec.priority === 'critical' ? 'Critical' : rec.priority === 'high' ? 'Warning' : 'Good',
                        detail: rec.issue,
                        severity: rec.priority,
                        recommendation: rec.recommendation,
                        impact: rec.impact
                    }))
                },
                {
                    id: 'content',
                    label: 'Content Quality',
                    score: analysis.categoryScores.content.score,
                    description: 'Relevance, keyword density, readability, and topic coverage.',
                    checks: analysis.recommendations.filter((r: any) => r.category === 'advanced_seo').map((rec: any, i: number) => ({
                        id: `cont-${i}`,
                        label: rec.issue,
                        status: rec.priority === 'critical' ? 'Critical' : rec.priority === 'high' ? 'Warning' : 'Good',
                        detail: rec.issue,
                        severity: rec.priority,
                        recommendation: rec.recommendation,
                        impact: rec.impact
                    }))
                }
            ],

            strategicRecommendations: analysis.strategicRecommendations,

            fixPlan: analysis.recommendations.map((rec: any, i: number) => ({
                id: `fix-${i}`,
                title: rec.recommendation,
                impactPts: rec.priority === 'critical' ? 15 : rec.priority === 'high' ? 10 : 5,
                effort: rec.priority === 'critical' ? 'High' : 'Medium',
                category: rec.category,
                severity: rec.priority
            })),

            pagePerformance: {
                mobileSpeed: analysis.technicalAnalysis.mobileOptimization.score,
                desktopSpeed: analysis.technicalAnalysis.pageSpeed.score,
                coreWebVitals: analysis.technicalAnalysis.pageSpeed.score,
                avgLoadMs: analysis.technicalAnalysis.pageSpeed.loadTime,
            },

            keywords: {
                total: 247, // Mocks for now until integration with SEMRush
                top10: 89,
                top20: 34,
                improved: 23,
                declined: 8,
            },
        }

        res.json(createSuccessResponse(data))
    } catch (error) {
        console.error('Error in getAnalyzerSummary:', error)
        res.status(500).json({ error: 'Internal server error', details: (error as Error).message, stack: (error as Error).stack })
    }
}
