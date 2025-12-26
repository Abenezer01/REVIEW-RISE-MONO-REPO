import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

/**
 * Seed script for Competitor data
 * Creates test competitors and their rank data for demonstration
 */

async function seedCompetitorData() {
    // Dynamic import to ensure env vars are loaded first
    const { prisma } = await import('../src/client');

    console.log('🌱 Seeding competitor data...');

    try {
        // Get the first business from the database (or create one if needed)
        let business = await prisma.business.findFirst();

        if (!business) {
            console.log('📦 Creating test business...');
            business = await prisma.business.create({
                data: {
                    name: 'Test Local Business',
                    slug: 'test-local-business',
                    description: 'A test business for competitor tracking',
                    status: 'active',
                },
            });
            console.log(`✓ Created business: ${business.name} (${business.id})`);
        } else {
            console.log(`✓ Using existing business: ${business.name} (${business.id})`);
        }

        // Define test competitors with realistic data
        const competitorsData = [
            {
                domain: 'starbucks.com',
                name: 'Starbucks',
                avgRank: 2.5,
                visibilityScore: 85.3,
                reviewCount: 15420,
                rating: 4.3,
                gbpCompleteness: 95,
            },
            {
                domain: 'bluebottlecoffee.com',
                name: 'Blue Bottle Coffee',
                avgRank: 4.2,
                visibilityScore: 72.8,
                reviewCount: 8930,
                rating: 4.6,
                gbpCompleteness: 88,
            },
            {
                domain: 'intelligentsiacoffee.com',
                name: 'Intelligentsia Coffee',
                avgRank: 5.8,
                visibilityScore: 68.5,
                reviewCount: 6240,
                rating: 4.5,
                gbpCompleteness: 82,
            },
            {
                domain: 'stumptowncoffee.com',
                name: 'Stumptown Coffee Roasters',
                avgRank: 7.3,
                visibilityScore: 61.2,
                reviewCount: 5180,
                rating: 4.4,
                gbpCompleteness: 78,
            },
            {
                domain: 'lacolombeoffee.com',
                name: 'La Colombe Coffee',
                avgRank: 8.9,
                visibilityScore: 58.7,
                reviewCount: 4560,
                rating: 4.2,
                gbpCompleteness: 75,
            },
            {
                domain: 'gregoryscoffee.com',
                name: "Gregory's Coffee",
                avgRank: 11.2,
                visibilityScore: 52.3,
                reviewCount: 3890,
                rating: 4.1,
                gbpCompleteness: 70,
            },
            {
                domain: 'joecoffee.com',
                name: 'Joe Coffee Company',
                avgRank: 13.5,
                visibilityScore: 48.6,
                reviewCount: 3120,
                rating: 4.3,
                gbpCompleteness: 68,
            },
            {
                domain: 'thinkingcup.com',
                name: 'Thinking Cup',
                avgRank: 15.8,
                visibilityScore: 44.2,
                reviewCount: 2450,
                rating: 4.4,
                gbpCompleteness: 65,
            },
            {
                domain: 'birchcoffee.com',
                name: 'Birch Coffee',
                avgRank: 18.3,
                visibilityScore: 39.8,
                reviewCount: 1890,
                rating: 4.2,
                gbpCompleteness: 62,
            },
            {
                domain: 'boxkitecoffee.com',
                name: 'Box Kite Coffee',
                avgRank: 21.7,
                visibilityScore: 35.4,
                reviewCount: 1320,
                rating: 4.5,
                gbpCompleteness: 58,
            },
        ];

        console.log('🏢 Creating competitors...');
        const competitors = [];

        for (const comp of competitorsData) {
            const competitor = await prisma.competitor.upsert({
                where: {
                    businessId_domain: {
                        businessId: business.id,
                        domain: comp.domain,
                    },
                },
                update: {
                    name: comp.name,
                    avgRank: comp.avgRank,
                    visibilityScore: comp.visibilityScore,
                    reviewCount: comp.reviewCount,
                    rating: comp.rating,
                    gbpCompleteness: comp.gbpCompleteness,
                },
                create: {
                    businessId: business.id,
                    domain: comp.domain,
                    name: comp.name,
                    avgRank: comp.avgRank,
                    visibilityScore: comp.visibilityScore,
                    reviewCount: comp.reviewCount,
                    rating: comp.rating,
                    gbpCompleteness: comp.gbpCompleteness,
                },
            });
            competitors.push(competitor);
        }

        console.log(`✓ Created/updated ${competitors.length} competitors`);

        // Get keywords for the business to create competitor rank data
        const keywords = await prisma.keyword.findMany({
            where: { businessId: business.id },
            take: 10,
        });

        if (keywords.length === 0) {
            console.log('⚠️  No keywords found. Skipping competitor rank data creation.');
            console.log('   Run seed-visibility.ts first to create keywords.');
        } else {
            console.log(`📊 Generating competitor rank data for ${keywords.length} keywords...`);
            const today = new Date();
            let totalRanks = 0;

            // Generate rank data for the last 30 days
            for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
                const date = new Date(today);
                date.setDate(date.getDate() - daysAgo);
                date.setHours(0, 0, 0, 0);

                for (const competitor of competitors) {
                    for (const keyword of keywords) {
                        // Simulate rank fluctuations based on competitor's average rank
                        const baseRank = competitor.avgRank || 10;
                        const variance = Math.floor(Math.random() * 8) - 4; // ±4 positions
                        const rankPosition = Math.max(1, Math.min(100, Math.round(baseRank + variance)));

                        // Only create rank if within top 50 (to keep data realistic)
                        if (rankPosition <= 50) {
                            await prisma.competitorKeywordRank.create({
                                data: {
                                    competitorId: competitor.id,
                                    keywordId: keyword.id,
                                    rankPosition,
                                    rankingUrl: `https://${competitor.domain}/locations/new-york`,
                                    capturedAt: date,
                                },
                            });

                            totalRanks++;
                        }
                    }
                }
            }

            console.log(`✓ Created ${totalRanks} competitor rank records`);
        }

        console.log('\n✅ Competitor seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   - Business: ${business.name}`);
        console.log(`   - Competitors: ${competitors.length}`);
        console.log(`   - Keywords tracked: ${keywords.length}`);
        console.log(`   - Days of data: 30\n`);

    } catch (error) {
        console.error('❌ Error seeding competitor data:', error);
        throw error;
    }
}

async function main() {
    const { prisma } = await import('../src/client');
    try {
        await seedCompetitorData();
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
