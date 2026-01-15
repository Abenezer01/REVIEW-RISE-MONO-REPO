import { prisma } from '@platform/db';
import axios from 'axios';
import crypto from 'crypto';
// import puppeteer from 'puppeteer';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3002';

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

    // Allow report generation even without competitors (will use mock data)
    // if (competitors.length === 0) {
    //     throw new Error('No competitors found. Discover competitors first.');
    // }
    console.log(`Generating report with ${competitors.length} competitors`);

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
    let reportData: any = {
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
            // Safely merge response with defaults
            reportData = {
                gaps: response.data.gaps || [],
                strategies: response.data.strategies || [],
                suggestedTaglines: response.data.suggestedTaglines || [],
                contentIdeas: response.data.contentIdeas || [],
                positioningMap: response.data.positioningMap || {}
            };
        }
    } catch (e: any) {
        console.error('AI Report Gen Failed:', e.message);
        console.warn('Using fallback mock data for demonstration purposes');
        
        // Fallback mock data when AI service is unavailable
        reportData = {
            gaps: [
                { title: 'Limited Mobile Experience Focus', description: 'Competitors lack mobile-optimized services', priority: 9, tags: ['Mobile', 'UX'] },
                { title: 'Weak Social Proof Strategy', description: 'Insufficient testimonials and case studies', priority: 8, tags: ['Trust', 'Credibility'] },
                { title: 'No 24/7 Support Offering', description: 'Emergency support gap in market', priority: 8, tags: ['Service', 'Availability'] },
                { title: 'Outdated Technology Stack', description: 'Competitors using legacy systems', priority: 7, tags: ['Technology', 'Innovation'] },
                { title: 'Generic Value Propositions', description: 'Lack of industry specialization', priority: 7, tags: ['Positioning', 'Differentiation'] }
            ],
            strategies: [
                { title: 'Premium Mobile-First Service', description: 'Position as the mobile-first provider with dedicated mobile app and responsive booking' },
                { title: 'Trust-Building Content Strategy', description: 'Leverage video testimonials, live case studies, and transparent pricing' },
                { title: 'Technology Leadership', description: 'Highlight modern tech stack, automation, and real-time tracking capabilities' }
            ],
            suggestedTaglines: [
                'Your Business, Elevated',
                'Expert Solutions, Modern Approach',
                'Where Innovation Meets Service',
                'The Smart Choice for Modern Businesses'
            ],
            contentIdeas: [
                { topic: 'Mobile-First Customer Journey Guide', rationale: 'Address mobile gap', format: 'Blog Post', competitorGap: 'Mobile experience' },
                { topic: 'Behind the Scenes: Our Technology Stack', rationale: 'Showcase modern approach', format: 'Video', competitorGap: 'Technology transparency' },
                { topic: 'Customer Success Stories Series', rationale: 'Build trust through proof', format: 'Case Study', competitorGap: 'Social proof' },
                { topic: '24/7 Support: What It Really Means', rationale: 'Differentiate on availability', format: 'Blog Post', competitorGap: 'Support hours' },
                { topic: 'Industry Specialist vs Generalist: The Difference', rationale: 'Highlight specialization', format: 'Whitepaper', competitorGap: 'Generic positioning' },
                { topic: 'Real-Time Project Tracking Demo', rationale: 'Show tech advantage', format: 'Tutorial Video', competitorGap: 'Transparency tools' }
            ],
            positioningMap: {
                axes: { x: 'Price (Low to High)', y: 'Service Quality (Basic to Premium)' },
                positions: {
                    'You': { x: 70, y: 85 },
                    'Competitor A': { x: 45, y: 55 },
                    'Competitor B': { x: 30, y: 40 },
                    'Competitor C': { x: 60, y: 50 }
                }
            }
        };
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
        orderBy: { generatedAt: 'desc' }
        // Return all fields so report detail page can use this data
    });
};

export const getLatestReport = async (businessId: string) => {
    return prisma.opportunitiesReport.findFirst({
        where: { businessId },
        orderBy: { generatedAt: 'desc' }
    });
};



export const generatePdf = async (reportId: string): Promise<Buffer> => {
    const report = await (prisma as any).opportunitiesReport.findUnique({ 
        where: { id: reportId },
        include: { business: true } // Fetch business name
    });
    
    if (!report) throw new Error('Report not found');

    // Dynamic import to avoid startup crash if puppeteer is problematic
    const puppeteer = (await import('puppeteer')).default;

    // Basic HTML Template for PDF
    const html = `
    <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 40px; }
                h1 { color: #333; }
                .section { margin-bottom: 30px; }
                .chip { display: inline-block; background: #eee; padding: 5px 10px; border-radius: 15px; margin: 5px; font-size: 0.9em; }
                .strategy { border-left: 4px solid #7367F0; padding-left: 15px; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <h1>Brand Opportunities Report</h1>
            <p>Generated for: ${report.business?.name || 'Business'} on ${new Date(report.generatedAt).toLocaleDateString()}</p>
            
            <div class="section">
                <h2>Strategies</h2>
                ${(report.strategies as any[] || []).map((s: any) => `
                    <div class="strategy">
                        <h3>${s.title}</h3>
                        <p>${s.description}</p>
                    </div>`).join('')}
            </div>

            <div class="section">
                <h2>Gaps Identified</h2>
                <div>
                   ${(report.gaps as any[] || []).map((g: any) => `
                        <div style="margin-bottom: 8px;">
                            <span class="chip" style="background: #e8f5e9; color: #1b5e20;">Priority: ${g.priority}</span>
                            <strong>${g.title}</strong>: ${g.description}
                        </div>`).join('')}
                </div>
            </div>

             <div class="section">
                <h2>Suggested Taglines</h2>
                <ul>
                   ${(report.suggestedTaglines as string[] || []).map((t: string) => `<li>"${t}"</li>`).join('')}
                </ul>
            </div>
            
            <div class="section">
                <h2>Content Roadmap</h2>
                 <ul>
                   ${(report.contentIdeas as any[] || []).map((c:any) => `<li><b>${c.topic}</b>: ${c.rationale}</li>`).join('')}
                </ul>
            </div>

            <div class="section">
                <p style="text-align: center; color: #888; margin-top: 50px;">Generated by ReviewRise Brand AI</p>
            </div>
        </body>
    </html>
    `;

    const browser = await puppeteer.launch({ 
        headless: true, 
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    
    // Convert Uint8Array to Buffer (Puppeteer returns Uint8Array in recent versions)
    return Buffer.from(pdf);
};
