import { prisma } from '@platform/db';
import axios from 'axios';
import crypto from 'crypto';
// import puppeteer from 'puppeteer'; // defer import until needed to avoid startup overhead if problematic

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';

export const generateReport = async (businessId: string) => {
    // 1. Fetch Business & Competitors with Snapshots
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new Error('Business not found');

    const competitors = await prisma.competitor.findMany({
        where: { 
            businessId, 
            isHidden: false 
        },
        include: {
            snapshots: {
                orderBy: { capturedAt: 'desc' },
                take: 1
            }
        },
        orderBy: { relevanceScore: 'desc' },
        take: 10
    });

    if (competitors.length === 0) {
        throw new Error('No competitors found. Discover competitors first.');
    }

    // 2. Prepare Data for AI
    const analysisData = competitors.map(c => {
        const snap = c.snapshots[0] || {};
        return {
            name: c.name,
            domain: c.domain,
            uvp: snap.uvp,
            serviceList: snap.serviceList,
            differentiators: snap.differentiators // { strengths, weaknesses, unique }
        };
    });

    // 3. Call AI Service
    let reportData = {
        gaps: [],
        strategies: [],
        suggestedTaglines: [],
        contentIdeas: [],
        positioningMap: {}
    };

    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/v1/ai/generate-report`, {
            competitors: analysisData,
            businessType:  'Local Service Business' // TODO: Get from business.type or dna
        });
        if (response.data) {
            reportData = response.data;
        }
    } catch (e: any) {
        console.error('AI Report Gen Failed:', e.message);
        // Fallback or empty report
    }

    // 4. Save to DB
    const report = await prisma.opportunitiesReport.create({
        data: {
            businessId,
            positioningMap: reportData.positioningMap,
            gaps: reportData.gaps,
            strategies: reportData.strategies,
            suggestedTaglines: reportData.suggestedTaglines,
            contentIdeas: reportData.contentIdeas,
            shareToken: crypto.randomBytes(16).toString('hex')
        }
    });

    return report;
};

export const listReports = async (businessId: string) => {
    return prisma.opportunitiesReport.findMany({
        where: { businessId },
        orderBy: { generatedAt: 'desc' },
        select: {
            id: true,
            generatedAt: true,
            // Select summary fields if needed, or all
        }
    });
};

export const getLatestReport = async (businessId: string) => {
    return prisma.opportunitiesReport.findFirst({
        where: { businessId },
        orderBy: { generatedAt: 'desc' }
    });
};



export const generatePdf = async (reportId: string): Promise<string> => {
    // Placeholder: In a real app, this would use Puppeteer to render a localized HTML template
    // and save to S3/Cloud storage.
    // For now, return a mock URL or implementation later.
    return `https://api.review-rise.com/reports/${reportId}.pdf`;
};
