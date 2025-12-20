import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' }); // Load root env
import { prisma } from '@platform/db';

async function checkSnapshots() {
    try {
        console.log('Checking database for SEO snapshots...');
        const count = await prisma.seoSnapshot.count();
        console.log(`Total Snapshots: ${count}`);
        
        const latest = await prisma.seoSnapshot.findFirst({
            where: { url: 'https://example.com' },
            orderBy: { createdAt: 'desc' }
        });

        if (latest) {
            console.log('✅ Found latest snapshot for example.com:');
            console.log(`- ID: ${latest.id}`);
            console.log(`- Score: ${latest.healthScore}`);
            console.log(`- CreatedAt: ${latest.createdAt}`);
            if (latest.categoryScores) {
                console.log('- Has Category Scores: Yes');
            }
        } else {
            console.log('❌ No snapshot found for example.com');
        }
    } catch (e) {
        console.error('Error querying DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkSnapshots();
