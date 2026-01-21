import { prisma } from '../src/client';
import { reviewRepository } from '../src/repositories/review.repository';

async function main() {
    console.log('🔍 Starting Analytics Debug...');

    // 1. Find the target business (ACME)
    const businessId = 'a1dd8e07-694c-499f-a01a-2b991c283921'; // ACME from seed.ts
    const business = await prisma.business.findUnique({ where: { id: businessId } });

    if (!business) {
        console.error('❌ Business not found!');
        return;
    }
    console.log(`✅ Found Business: ${business.name} (${business.id})`);

    // 2. Count total reviews for this business
    const totalReviews = await prisma.review.count({ where: { businessId } });
    console.log(`📊 Total Reviews in DB for Business: ${totalReviews}`);

    // 3. Inspect a few reviews to check dates and sentiment
    const sampleReviews = await prisma.review.findMany({
        where: { businessId },
        take: 5,
        orderBy: { publishedAt: 'desc' },
        select: { id: true, publishedAt: true, sentiment: true, rating: true, platform: true }
    });
    console.log('📋 Recent 5 Reviews:');
    console.table(sampleReviews);

    // 4. Test Repository Function directly
    console.log('\n🧪 Testing reviewRepository.getDashboardMetrics(period=30)...');
    try {
        const metrics = await reviewRepository.getDashboardMetrics({
            businessId,
            periodDays: 30
        });
        console.log('📈 Metrics Result:', JSON.stringify(metrics, null, 2));

        if (metrics.current.totalReviews === 0 && totalReviews > 0) {
            console.warn('⚠️  Mismatch: Reviews exist but Metrics return 0. Check Date Filtering or Logic.');
            
            // Debug Date Range
            const now = new Date();
            const start = new Date();
            start.setDate(now.getDate() - 30);
            console.log(`📅 Query Range: ${start.toISOString()} to ${now.toISOString()}`);
            
            const inRangeCount = await prisma.review.count({
                where: {
                    businessId,
                    publishedAt: { gte: start, lt: now }
                }
            });
            console.log(`🧐 Reviews found in Date Range via direct Prisma count: ${inRangeCount}`);
        } else {
            console.log('✅ Metrics match expectations.');
        }

    } catch (e) {
        console.error('❌ Error executing repository method:', e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
