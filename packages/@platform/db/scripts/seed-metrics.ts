import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

let prisma: PrismaClient;

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate gradual growth trend: base × (1 + growthRate * dayOffset / totalDays)
function trendedValue(base: number, growthFraction: number, dayOffset: number, totalDays: number, jitter = 0.15) {
    const trend = base * (1 + growthFraction * (dayOffset / totalDays));
    const noise = trend * jitter * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(trend + noise));
}

async function main() {
    const clientModule = await import('../src/client.js');
    prisma = clientModule.prisma;

    const locationId = '11111111-1111-4111-8111-111111111111'; // ACME Downtown

    console.log('🌱 Seeding location_metrics for ACME Downtown (90 days)...');

    // Verify location exists
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
        console.error('❌ Location not found. Run pnpm db:seed first.');
        process.exit(1);
    }

    // Wipe existing metrics for a clean seed
    await prisma.$executeRawUnsafe(
        `DELETE FROM "location_metrics" WHERE "locationId" = $1::uuid`,
        locationId
    );
    await prisma.$executeRawUnsafe(
        `DELETE FROM "metric_jobs" WHERE "locationId" = $1::uuid`,
        locationId
    );
    console.log('🧹 Cleaned existing metrics');

    // Seed 90 days of daily metrics (trending upward ~30% growth)
    const DAYS = 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let seeded = 0;

    for (let i = DAYS; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayOffset = DAYS - i;  // 0 = oldest, 90 = today

        const impressionsDiscovery = trendedValue(320, 0.3, dayOffset, DAYS);
        const impressionsDirect = trendedValue(110, 0.2, dayOffset, DAYS);
        const impressionsTotal = impressionsDiscovery + impressionsDirect;
        const photoViews = trendedValue(90, 0.4, dayOffset, DAYS);
        const visibilityScore = Math.min(100, Math.round(60 + (dayOffset / DAYS) * 18 + (Math.random() * 4 - 2)));

        await prisma.$executeRawUnsafe(
            `INSERT INTO "location_metrics" (
                "id", "locationId", "date",
                "impressionsTotal", "impressionsDiscovery", "impressionsDirect",
                "photoViews", "visibilityScore", "createdAt", "updatedAt"
            )
            VALUES (gen_random_uuid(), $1::uuid, $2::date, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT ("locationId", "date") DO UPDATE SET
                "impressionsTotal" = $3,
                "impressionsDiscovery" = $4,
                "impressionsDirect" = $5,
                "photoViews" = $6,
                "visibilityScore" = $7,
                "updatedAt" = NOW()`,
            locationId,
            date,
            impressionsTotal,
            impressionsDiscovery,
            impressionsDirect,
            photoViews,
            visibilityScore
        );
        seeded++;
    }

    // Log a success job
    await prisma.$executeRawUnsafe(
        `INSERT INTO "metric_jobs" ("id", "locationId", "jobType", "status", "startedAt", "finishedAt")
         VALUES (gen_random_uuid(), $1::uuid, 'metrics_backfill', 'success', NOW(), NOW())`,
        locationId
    );

    console.log(`✅ Seeded ${seeded} daily metric records`);

    // Seed 3 sample location_competitors
    console.log('\n🌱 Seeding location_competitors...');
    await prisma.$executeRawUnsafe(
        `DELETE FROM "location_competitors" WHERE "locationId" = $1::uuid`,
        locationId
    );

    const competitors = [
        { name: "Blue Bottle Coffee", rating: 4.7, reviewCount: 2100, photoCount: 85, estVisibility: 82 },
        { name: "Ritual Coffee Roasters", rating: 4.6, reviewCount: 1450, photoCount: 62, estVisibility: 74 },
        { name: "Equator Coffees", rating: 4.5, reviewCount: 980, photoCount: 40, estVisibility: 61 },
    ];

    for (const c of competitors) {
        await prisma.$executeRawUnsafe(
            `INSERT INTO "location_competitors" (
                "id", "locationId", "competitorName", "rating", "reviewCount", "photoCount", "estimatedVisibility", "createdAt"
            )
            VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, $6, NOW())`,
            locationId, c.name, c.rating, c.reviewCount, c.photoCount, c.estVisibility
        );
        console.log(`  ✓ Added competitor: ${c.name}`);
    }

    console.log('\n✅ Seed complete!');
    console.log(`📊 Location: ${locationId}`);
    console.log(`📈 90 days of daily metrics seeded (trending +30% impressions, +40% photo views)`);
    console.log(`🏆 3 local competitors added`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
