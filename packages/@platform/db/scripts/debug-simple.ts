import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Simple Review Count...');
    
    // ACME Business ID
    const businessId = 'a1dd8e07-694c-499f-a01a-2b991c283921';

    const total = await prisma.review.count({
        where: { businessId }
    });

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const recent = await prisma.review.count({
        where: { 
            businessId,
            publishedAt: {
                gte: thirtyDaysAgo
            }
        }
    });

    console.log(`Total Reviews: ${total}`);
    console.log(`Recent (30d) Reviews: ${recent}`);
    
    // Check Sentiment distribution
    const sentiments = await prisma.review.groupBy({
        by: ['sentiment'],
        where: { businessId, publishedAt: { gte: thirtyDaysAgo } },
        _count: true
    });
    console.log('Sentiments:', sentiments);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
