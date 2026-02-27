
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

let prisma: PrismaClient;

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const clientModule = await import('../src/client.js');
    prisma = clientModule.prisma;

    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`🔌 Connecting to database: ${dbUrl.replace(/:[^:@]*@/, ':****@')}`);

    console.log('🌱 Seeding GBP Profile Snapshot and Audit...');

    const businessId = 'a1dd8e07-694c-499f-a01a-2b991c283921'; // ACME Restaurant
    const locationId = '11111111-1111-4111-8111-111111111111'; // ACME Downtown

    // Ensure business and location exist (in case seed hasn't run)
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
        console.error(`❌ Business ${businessId} not found. Please run 'pnpm db:seed' first.`);
        return;
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
        console.error(`❌ Location ${locationId} not found. Please run 'pnpm db:seed' first.`);
        return;
    }

    // Delete old snapshots for this location to keep dev env clean
    const existing = await prisma.gbpProfileSnapshot.findMany({ where: { locationId } });
    for (const s of existing) {
        await prisma.gbpProfileAudit.deleteMany({ where: { snapshotId: s.id } });
    }
    await prisma.gbpProfileSnapshot.deleteMany({ where: { locationId } });
    console.log('🧹 Cleaned up old snapshots and audits');

    // ── Raw snapshot mimics real GBP API response format ─────────────────────
    const now = new Date();
    const d25 = new Date(now); d25.setDate(d25.getDate() - 25); // < 30 days
    const d60 = new Date(now); d60.setDate(d60.getDate() - 60); // 30-90 days
    const d120 = new Date(now); d120.setDate(d120.getDate() - 120); // > 90 days
    const d200 = new Date(now); d200.setDate(d200.getDate() - 200);

    const snapshotData = {
        // Normalized source marker so audit.service picks it up as normalized
        source: 'google_business_profile',

        // Core GBP Fields
        locationTitle: 'ACME Downtown Coffee',
        category: 'Restaurant',
        address: {
            formatted: '123 Main St, San Francisco, CA 94105',
            locality: 'San Francisco',
            administrativeArea: 'CA',
            postalCode: '94105',
            countryCode: 'US'
        },
        phone: '+1 415-555-0199',
        website: 'https://acme-downtown.com',
        description:
            'Welcome to ACME Downtown — your neighborhood breakfast and brunch spot in the heart of San Francisco. ' +
            'We serve organic, locally-sourced food with a strong focus on quality and community. ' +
            'Perfect for remote workers looking for great wifi and a cozy atmosphere. Visit us today!',
        hours: {
            periods: [
                { openDay: 'MONDAY', openTime: '07:00', closeDay: 'MONDAY', closeTime: '18:00' },
                { openDay: 'TUESDAY', openTime: '07:00', closeDay: 'TUESDAY', closeTime: '18:00' },
                { openDay: 'WEDNESDAY', openTime: '07:00', closeDay: 'WEDNESDAY', closeTime: '18:00' },
                { openDay: 'THURSDAY', openTime: '07:00', closeDay: 'THURSDAY', closeTime: '18:00' },
                { openDay: 'FRIDAY', openTime: '07:00', closeDay: 'FRIDAY', closeTime: '20:00' },
                { openDay: 'SATURDAY', openTime: '08:00', closeDay: 'SATURDAY', closeTime: '20:00' },
            ]
        },

        // Media items - for photo evaluator
        media: [
            // Cover photo (< 30 days)
            { locationAssociation: { category: 'COVER' }, createTime: d25.toISOString(), dimensions: { widthPixels: 1920, heightPixels: 1080 } },
            // Logo
            { locationAssociation: { category: 'LOGO' }, createTime: d25.toISOString(), dimensions: { widthPixels: 800, heightPixels: 800 } },
            // Recent photos (< 30 days)
            { locationAssociation: { category: 'INTERIOR' }, createTime: d25.toISOString(), dimensions: { widthPixels: 1280, heightPixels: 960 } },
            // 30-90 day photos
            { locationAssociation: { category: 'FOOD_AND_DRINK' }, createTime: d60.toISOString(), dimensions: { widthPixels: 1200, heightPixels: 900 } },
            { locationAssociation: { category: 'FOOD_AND_DRINK' }, createTime: d60.toISOString(), dimensions: { widthPixels: 1100, heightPixels: 820 } },
            { locationAssociation: { category: 'FOOD_AND_DRINK' }, createTime: d60.toISOString(), dimensions: { widthPixels: 1000, heightPixels: 750 } },
            // Older photos (> 90 days) - one with low res to trigger warning
            { locationAssociation: { category: 'EXTERIOR' }, createTime: d120.toISOString(), dimensions: { widthPixels: 640, heightPixels: 480 } },
            { locationAssociation: { category: 'EXTERIOR' }, createTime: d200.toISOString(), dimensions: { widthPixels: 1280, heightPixels: 720 } },
        ],

        // Metadata freshness
        metadata: {
            updateTime: d25.toISOString(),
            mapsUri: 'https://maps.google.com/maps?cid=987654321',
            newReviewUri: 'https://search.google.com/local/writereview?placeid=ChIJAcme'
        },

        // Service items for keyword evaluator
        serviceItems: [
            { serviceTypeId: 'Breakfast' },
            { serviceTypeId: 'Brunch' },
            { serviceTypeId: 'Coffee' },
            { serviceTypeId: 'Vegan Options' }
        ]
    };

    const snapshot = await prisma.gbpProfileSnapshot.create({
        data: {
            businessId,
            locationId,
            captureType: 'manual',
            snapshot: snapshotData,
            capturedAt: new Date(),
        }
    });

    console.log(`✅ Created Snapshot: ${snapshot.id}`);

    // ── Build the AuditResult matching our new V2 schema ─────────────────────
    const auditResult = {
        snapshotId: snapshot.id,
        totalScore: 72,
        createdAt: new Date().toISOString(),

        breakdown: {
            completeness: 100,
            description: 78,
            media: 70,
            freshness: 90,
            categories: 70,
            photoQuality: 65,
            keywordOptimization: 60
        },

        // Category Intelligence
        categoryIntelligence: {
            primaryCategory: 'Restaurant',
            isGeneric: true,
            suggestedAlternatives: ['Coffee Shop', 'Breakfast Restaurant', 'Brunch Restaurant']
        },

        // Photo Quality Details
        photoQualityDetails: {
            totalPhotos: 8,
            hasCoverPhoto: true,
            hasLogo: true,
            recency: {
                last30Days: 3,
                last30To90Days: 3,
                older: 2
            }
        },

        // Photo Improvement Plan
        photoImprovementPlan: [
            'Upload 7+ more food & beverage photos',
            'Replace 1 low-resolution exterior photo',
            'Add team/staff photos for social proof'
        ],

        // Issues grouped by severity
        groupedIssues: {
            critical: [
                {
                    code: 'cat_generic_warning',
                    severity: 'critical',
                    title: 'Primary Category is Too Generic',
                    whyItMatters: 'Generic categories like "Restaurant" compete with millions of businesses, reducing your local search relevance.',
                    recommendation: 'Switch to "Coffee Shop" or "Breakfast Restaurant" for more targeted local ranking.',
                    nextAction: 'Change primary category to "Coffee Shop".',
                    impactWeight: 9,
                    suggestedCategories: ['Coffee Shop', 'Breakfast Restaurant', 'Brunch Restaurant']
                }
            ],
            warning: [
                {
                    code: 'photo_resolution_warning',
                    severity: 'warning',
                    title: 'Low Resolution Exterior Photo',
                    whyItMatters: 'Low resolution photos (below 720px) look unprofessional on modern screens and Maps listings.',
                    recommendation: 'Replace the 640×480 exterior photo with a high-resolution version (minimum 1080px wide).',
                    nextAction: 'Re-shoot or replace the low-res exterior photo.',
                    impactWeight: 5
                },
                {
                    code: 'desc_missing_cta',
                    severity: 'warning',
                    title: 'Missing Call-to-Action in Description',
                    whyItMatters: 'A CTA guides users on what to do next, increasing conversion rates.',
                    recommendation: 'Add a phrase like "Call to reserve a table" or "Order online at acme-downtown.com".',
                    nextAction: 'Edit business description to include a clear call-to-action.',
                    impactWeight: 4
                }
            ],
            opportunity: [
                {
                    code: 'kw_gap_specialty_coffee',
                    severity: 'opportunity',
                    title: 'Missing Keyword: "specialty coffee"',
                    whyItMatters: '"Specialty coffee" is searched 2,400x/month in San Francisco and is not found in your profile.',
                    recommendation: 'Add "specialty coffee" to your description or as a service.',
                    nextAction: 'Edit description to include "specialty coffee".',
                    recommendedPlacement: ['Description', 'Services'],
                    impactWeight: 6
                },
                {
                    code: 'kw_gap_artisan_pastries',
                    severity: 'opportunity',
                    title: 'Missing Keyword: "artisan pastries"',
                    whyItMatters: '"Artisan pastries" helps you rank for high-intent food searches near your location.',
                    recommendation: 'Add "artisan pastries" to your description or service list.',
                    nextAction: 'Add "Artisan Pastries" as a service item.',
                    recommendedPlacement: ['Services', 'Posts'],
                    impactWeight: 5
                },
                {
                    code: 'kw_gap_coworking_space',
                    severity: 'opportunity',
                    title: 'Missing Keyword: "coworking space"',
                    whyItMatters: 'Attracts remote workers and freelancers looking for cafe-style workspaces.',
                    recommendation: 'Mention your wifi and workspace-friendly atmosphere in a post or Q&A.',
                    nextAction: 'Create a Google Post about "workspace-friendly" environment.',
                    recommendedPlacement: ['Posts', 'Q&A'],
                    impactWeight: 4
                }
            ]
        },

        // Flat issues list (all combined)
        issues: [
            {
                code: 'cat_generic_warning',
                severity: 'critical',
                title: 'Primary Category is Too Generic',
                whyItMatters: 'Generic categories like "Restaurant" compete with millions of businesses, reducing your local search relevance.',
                recommendation: 'Switch to "Coffee Shop" or "Breakfast Restaurant" for more targeted local ranking.',
                nextAction: 'Change primary category to "Coffee Shop".',
                impactWeight: 9,
                suggestedCategories: ['Coffee Shop', 'Breakfast Restaurant', 'Brunch Restaurant']
            },
            {
                code: 'photo_resolution_warning',
                severity: 'warning',
                title: 'Low Resolution Exterior Photo',
                whyItMatters: 'Low resolution photos (below 720px) look unprofessional on modern screens and Maps listings.',
                recommendation: 'Replace the 640×480 exterior photo with a high-resolution version (minimum 1080px wide).',
                nextAction: 'Re-shoot or replace the low-res exterior photo.',
                impactWeight: 5
            },
            {
                code: 'desc_missing_cta',
                severity: 'warning',
                title: 'Missing Call-to-Action in Description',
                whyItMatters: 'A CTA guides users on what to do next, increasing conversion rates.',
                recommendation: 'Add a phrase like "Call to reserve a table" or "Order online at acme-downtown.com".',
                nextAction: 'Edit business description to include a clear call-to-action.',
                impactWeight: 4
            },
            {
                code: 'kw_gap_specialty_coffee',
                severity: 'opportunity',
                title: 'Missing Keyword: "specialty coffee"',
                whyItMatters: '"Specialty coffee" is searched 2,400x/month in San Francisco and is not found in your profile.',
                recommendation: 'Add "specialty coffee" to your description or as a service.',
                nextAction: 'Edit description to include "specialty coffee".',
                recommendedPlacement: ['Description', 'Services'],
                impactWeight: 6
            },
            {
                code: 'kw_gap_artisan_pastries',
                severity: 'opportunity',
                title: 'Missing Keyword: "artisan pastries"',
                whyItMatters: '"Artisan pastries" helps you rank for high-intent food searches near your location.',
                recommendation: 'Add "artisan pastries" to your description or service list.',
                nextAction: 'Add "Artisan Pastries" as a service item.',
                recommendedPlacement: ['Services', 'Posts'],
                impactWeight: 5
            },
            {
                code: 'kw_gap_coworking_space',
                severity: 'opportunity',
                title: 'Missing Keyword: "coworking space"',
                whyItMatters: 'Attracts remote workers and freelancers looking for cafe-style workspaces.',
                recommendation: 'Mention your wifi and workspace-friendly atmosphere in a post or Q&A.',
                nextAction: 'Create a Google Post about "workspace-friendly" environment.',
                recommendedPlacement: ['Posts', 'Q&A'],
                impactWeight: 4
            }
        ],

        // Keyword Gap Summary
        keywordGapSummary: {
            missingCount: 3,
            topPriorityKeywords: ['specialty coffee', 'artisan pastries', 'coworking space'],
            extractedKeywords: ['breakfast', 'brunch', 'organic', 'coffee', 'wifi', 'san francisco', 'locally-sourced', 'vegan', 'remote']
        }
    };

    const audit = await prisma.gbpProfileAudit.create({
        data: {
            snapshotId: snapshot.id,
            score: auditResult.totalScore,
            details: auditResult as any
        }
    });

    console.log(`✅ Created Audit: ${audit.id} (Score: ${auditResult.totalScore})`);
    console.log(`\n📋 Snapshot ID for testing: ${snapshot.id}`);
    console.log(`📋 Location ID: ${locationId}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
