import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

console.log('Script started...');

// Load environment variables
const envPath = path.resolve(__dirname, '../../../../.env');
console.log('Loading .env from:', envPath);
try {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.warn('⚠️  Dotenv loaded with error:', result.error.message);
    } else {
        console.log('✅ Loaded .env');
    }
} catch (error: any) {
    console.log('ℹ️  Skipping .env load:', error.message);
}

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is missing from environment variables');
    process.exit(1);
} else {
    // Obscure password/key
    const safeUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@');
    console.log('ℹ️  DATABASE_URL found:', safeUrl);
}

let prisma: PrismaClient;

async function main() {
    console.log('Importing Prisma client...');
    try {
        const clientModule = await import('../src/client');
        prisma = clientModule.prisma;
        console.log('✅ Prisma client imported');
    } catch (e) {
        console.error('❌ Failed to import Prisma client:', e);
        throw e;
    }

    console.log('🌱 Starting review seed...');

    // Get all locations
    let locations;
    try {
        console.log('Fetching locations...');
        locations = await prisma.location.findMany();
    } catch (e) {
        console.error('❌ Failed to fetch locations:', e);
        throw e;
    }

    if (locations.length === 0) {
        console.log('⚠️ No locations found. Please run basic seed first.');
        return;
    }

    console.log(`Found ${locations.length} locations. Generating reviews...`);

    const reviewTemplates = [
        // Positive Reviews
        { rating: 5, sentiment: 'Positive', content: 'Absolutely loved the service! The staff was friendly and efficient.', tags: ['service', 'staff', 'friendly'] },
        { rating: 5, sentiment: 'Positive', content: 'Best experience I have had in a long time. Highly recommend to everyone.', tags: ['experience', 'recommend'] },
        { rating: 4, sentiment: 'Positive', content: 'Great food, but the wait was a bit long. Still worth it!', tags: ['food', 'wait time'] },
        { rating: 5, sentiment: 'Positive', content: 'Amazing atmosphere and delicious meals. Will definitely come back.', tags: ['atmosphere', 'food'] },
        { rating: 4, sentiment: 'Positive', content: 'Good value for money. The portions were huge.', tags: ['value', 'portions'] },

        // Neutral Reviews
        { rating: 3, sentiment: 'Neutral', content: 'It was okay. Nothing special, but not bad either.', tags: ['average'] },
        { rating: 3, sentiment: 'Neutral', content: 'Service was average. Food was decent.', tags: ['service', 'food'] },
        { rating: 3, sentiment: 'Neutral', content: 'A bit pricey for what you get, but convenient location.', tags: ['price', 'location'] },

        // Negative Reviews
        { rating: 2, sentiment: 'Negative', content: 'Disappointed with the quality. The food was cold.', tags: ['quality', 'food', 'cold'] },
        { rating: 1, sentiment: 'Negative', content: 'Terrible service. Waiter was rude and ignored us.', tags: ['service', 'rude', 'waiter'] },
        { rating: 1, sentiment: 'Negative', content: 'Complete waste of money. Do not recommend.', tags: ['value', 'recommend'] },
        { rating: 2, sentiment: 'Negative', content: 'Too noisy and crowded. Could not hear myself think.', tags: ['atmosphere', 'noise'] },
    ];

    const platforms = ['google', 'facebook', 'yelp'];

    let totalCreated = 0;

    for (const location of locations) {
        console.log(`Generating reviews for location: ${location.name}`);
        
        // Generate 10-15 random reviews per location
        const count = Math.floor(Math.random() * 6) + 10;

        for (let i = 0; i < count; i++) {
            const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            
            // Randomly decide if this review is already analyzed or needs analysis
            // 70% analyzed, 30% unanalyzed (sentiment: null)
            const isAnalyzed = Math.random() > 0.3;

            const publishedAt = new Date();
            publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 90)); // Random date in last 90 days

            try {
                await prisma.review.create({
                    data: {
                        businessId: location.businessId!,
                        locationId: location.id,
                        platform: platform,
                        externalId: `seed-${location.id}-${i}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        author: `User ${Math.floor(Math.random() * 1000)}`,
                        rating: template.rating,
                        content: template.content,
                        sentiment: isAnalyzed ? template.sentiment : null,
                        tags: isAnalyzed ? template.tags : [],
                        publishedAt: publishedAt,
                        createdAt: publishedAt, // To simulate history
                        aiSuggestions: isAnalyzed ? {
                            analysis: `Simulated analysis for: ${template.content}`,
                            confidence: 85 + Math.floor(Math.random() * 15),
                            reasoning: "Based on keywords and sentiment score.",
                            primaryEmotion: template.sentiment === 'Positive' ? 'Joy' : template.sentiment === 'Negative' ? 'Frustration' : 'Indifference',
                            topics: template.tags
                        } : undefined
                    }
                });
                totalCreated++;
            } catch (err) {
                 console.error('Failed to create review:', err);
            }
        }
    }

    console.log(`✅ Successfully seeded ${totalCreated} reviews.`);
}

main()
    .catch((e) => {
        console.error('CRITICAL ERROR in main:', e);
        process.exit(1);
    })
    .finally(async () => {
        if (prisma) {
            console.log('Disconnecting...');
            await prisma.$disconnect();
        }
    });
