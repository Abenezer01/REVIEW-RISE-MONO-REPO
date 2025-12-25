import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

/**
 * Seed script for SERP Visibility data
 * Creates test keywords and rank data for demonstration
 */

async function seedVisibilityData() {
  // Dynamic import to ensure env vars are loaded first
  const { prisma } = await import('../src/client');
  
  console.log('🌱 Seeding SERP visibility data...');

  try {
    // Get the first business from the database (or create one if needed)
    let business = await prisma.business.findFirst();

    if (!business) {
      console.log('📦 Creating test business...');
      business = await prisma.business.create({
        data: {
          name: 'Test Local Business',
          slug: 'test-local-business',
          description: 'A test business for SERP visibility tracking',
          status: 'active',
        },
      });
      console.log(`✓ Created business: ${business.name} (${business.id})`);
    } else {
      console.log(`✓ Using existing business: ${business.name} (${business.id})`);
    }

    // Get or create a location
    let location = await prisma.location.findFirst({
      where: { businessId: business.id },
    });

    if (!location) {
      console.log('📍 Creating test location...');
      location = await prisma.location.create({
        data: {
          name: 'Main Location',
          address: '123 Main St, New York, NY 10001',
          timezone: 'America/New_York',
          businessId: business.id,
          status: 'active',
          tags: ['main', 'nyc'],
        },
      });
      console.log(`✓ Created location: ${location.name} (${location.id})`);
    } else {
      console.log(`✓ Using existing location: ${location.name} (${location.id})`);
    }

    // Define test keywords with realistic search volumes
    const keywordsData = [
      { keyword: 'best coffee shop nyc', volume: 5400, difficulty: 72 },
      { keyword: 'coffee near me', volume: 33100, difficulty: 45 },
      { keyword: 'specialty coffee new york', volume: 880, difficulty: 58 },
      { keyword: 'third wave coffee nyc', volume: 320, difficulty: 42 },
      { keyword: 'artisan coffee manhattan', volume: 720, difficulty: 55 },
      { keyword: 'organic coffee shop', volume: 1900, difficulty: 48 },
      { keyword: 'cold brew coffee nyc', volume: 2400, difficulty: 52 },
      { keyword: 'espresso bar new york', volume: 1300, difficulty: 60 },
      { keyword: 'coffee roastery nyc', volume: 590, difficulty: 65 },
      { keyword: 'cafe with wifi nyc', volume: 1100, difficulty: 38 },
    ];
 
    console.log('🔑 Creating keywords...');
    const keywords = [];

    for (const kw of keywordsData) {
      const keyword = await prisma.keyword.create({
        data: {
          businessId: business.id,
          locationId: location.id,
          keyword: kw.keyword,
          searchVolume: kw.volume,
          difficulty: kw.difficulty,
          tags: ['coffee', 'local'],
          status: 'active',
        },
      });
      keywords.push(keyword);
    }

    console.log(`✓ Created ${keywords.length} keywords`);

    // Generate rank data for the last 30 days
    console.log('📊 Generating rank data for last 30 days...');
    const today = new Date();
    let totalRanks = 0;

    for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);

      for (const keyword of keywords) {
        // Simulate rank fluctuations (better ranks for higher volume keywords)
        const baseRank = keyword.searchVolume && keyword.searchVolume > 5000 
          ? Math.floor(Math.random() * 5) + 1 
          : Math.floor(Math.random() * 15) + 1;
        
        // Add some variance
        const variance = Math.floor(Math.random() * 5) - 2;
        const rankPosition = Math.max(1, Math.min(100, baseRank + variance));

        // Map Pack presence (30% chance for local keywords)
        const hasMapPack = Math.random() < 0.3;
        const mapPackPosition = hasMapPack ? Math.floor(Math.random() * 3) + 1 : null;

        // SERP features (various probabilities)
        await prisma.keywordRank.create({
          data: {
            keywordId: keyword.id,
            rankPosition,
            mapPackPosition,
            hasFeaturedSnippet: Math.random() < 0.1,
            hasPeopleAlsoAsk: Math.random() < 0.4,
            hasLocalPack: hasMapPack,
            hasKnowledgePanel: Math.random() < 0.05,
            hasImagePack: Math.random() < 0.2,
            hasVideoCarousel: Math.random() < 0.15,
            rankingUrl: 'https://example.com',
            searchLocation: 'New York, NY',
            device: 'desktop',
            capturedAt: date,
          },
        });

        totalRanks++;
      }
    }

    console.log(`✓ Created ${totalRanks} rank records`);

    // Now compute visibility metrics for the last 7 days
    console.log('📈 Computing visibility metrics...');
    const { visibilityComputationService } = await import('../src/services/visibility-computation.service');

    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const periodStart = new Date(today);
      periodStart.setDate(periodStart.getDate() - daysAgo);
      periodStart.setHours(0, 0, 0, 0);

      const periodEnd = new Date(periodStart);
      periodEnd.setHours(23, 59, 59, 999);

      await visibilityComputationService.computeAllMetrics(
        business.id,
        location.id,
        'daily',
        periodStart,
        periodEnd
      );
    }

    console.log('✓ Computed visibility metrics for last 7 days');

    console.log('\n✅ Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Business: ${business.name}`);
    console.log(`   - Location: ${location.name}`);
    console.log(`   - Keywords: ${keywords.length}`);
    console.log(`   - Rank records: ${totalRanks}`);
    console.log(`   - Visibility metrics: 7 days\n`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

async function main() {
  const { prisma } = await import('../src/client');
  try {
    await seedVisibilityData();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
