
import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

async function seedBrandRiseData() {
  // Dynamic import to ensure env vars are loaded first
  const { prisma } = await import('../src/client');
  
  console.log('🌱 Seeding Brand Rise dashboard data...');

  const businessId = '33333333-3333-3333-3333-333333333333'; // Tech Cafe (from seed.ts)
  // Check if business exists, if not create it (in case seed.ts wasn't run)
  let business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) {
      console.log('Business not found, creating Tech Cafe...');
       business = await prisma.business.create({
          data: {
              id: businessId,
              name: 'Tech Cafe',
              slug: 'tech-cafe-brand-rise',
              description: 'Modern cafe with great coffee and workspace',
              status: 'active',
          }
       });
  }

  // 1. Brand DNA
  console.log('🧬 Seeding Brand DNA...');
  await prisma.brandDNA.upsert({
      where: { businessId },
      update: {},
      create: {
          businessId,
          values: ['Innovation', 'Community', 'Quality', 'Sustainability'],
          voice: 'Friendly, modern, and professional',
          audience: 'Tech professionals, remote workers, and coffee enthusiasts',
          mission: 'To provide the best fuel for the modern workforce.'
      }
  });

  // 2. Competitors
  console.log('⚔️ Seeding Competitors...');
  const competitors = [
      { name: 'Starbucks', website: 'https://starbucks.com' },
      { name: 'Peets Coffee', website: 'https://peets.com' },
      { name: 'Blue Bottle', website: 'https://bluebottlecoffee.com' }
  ];

  for (const comp of competitors) {
      const competitor = await prisma.competitor.upsert({
          where: { businessId_name: { businessId, name: comp.name } },
          update: {},
          create: {
              businessId,
              name: comp.name,
              website: comp.website
          }
      });

      // Create a snapshot for each competitor
      await prisma.competitorSnapshot.create({
          data: {
              competitorId: competitor.id,
              metrics: {
                  visibilityScore: Math.floor(Math.random() * 30) + 60,
                  socialFollowers: Math.floor(Math.random() * 10000) + 5000,
                  reviewCount: Math.floor(Math.random() * 500) + 100,
                  averageRating: (Math.random() * 1.5 + 3.5).toFixed(1)
              },
              capturedAt: new Date()
          }
      });
  }

  // 3. Content Ideas
  console.log('💡 Seeding Content Ideas...');
  const ideas = [
      { title: 'Remote Work Tips', description: '5 tips for staying productive while working from a cafe.', platform: 'LinkedIn' },
      { title: 'Latte Art Showcase', description: 'Video reel of our baristas best creations.', platform: 'Instagram' },
      { title: 'New Bean Launch', description: 'Announcing our new Ethiopian blend.', platform: 'Email' },
      { title: 'Customer Spotlight', description: 'Interview with a regular freelancer.', platform: 'Blog' }
  ];

  for (const idea of ideas) {
      await prisma.contentIdea.create({
          data: {
              businessId,
              title: idea.title,
              description: idea.description,
              platform: idea.platform,
              status: ['draft', 'scheduled', 'published'][Math.floor(Math.random() * 3)]
          }
      });
  }

  // 4. Reviews
  console.log('⭐ Seeding Reviews...');
  const platforms = ['google', 'facebook', 'yelp'];
  const reviews = [
      { author: 'Alice M.', rating: 5, content: 'Best coffee in the city! fast wifi too.' },
      { author: 'Bob D.', rating: 4, content: 'Great atmosphere, but a bit crowded.' },
      { author: 'Charlie T.', rating: 5, content: 'Love the new cold brew.' },
      { author: 'Dave W.', rating: 3, content: 'Service was slow today.' },
      { author: 'Eve S.', rating: 5, content: 'My go-to spot for meetings.' }
  ];

  for (const [i, review] of reviews.entries()) {
      await prisma.review.upsert({
        where: { platform_externalId: { platform: platforms[i % 3], externalId: `review-${i}` } },
        update: {},
        create: {
          businessId,
          platform: platforms[i % 3],
          externalId: `review-${i}`,
          author: review.author,
          rating: review.rating,
          content: review.content,
          publishedAt: new Date(Date.now() - i * 86400000), // 1 day apart
          createdAt: new Date()
        }
      });
  }

  // 5. Reports
  console.log('📊 Seeding Reports...');
  for (let i = 1; i <= 3; i++) {
      await prisma.report.create({
          data: {
              businessId,
              title: `Monthly Performance Report - ${new Date(Date.now() - i * 30 * 86400000).toLocaleString('default', { month: 'long' })}`,
              version: 'v1.0',
              htmlContent: '<h1>Performance Report</h1><p>This is a generated report.</p>',
              generatedAt: new Date(Date.now() - i * 30 * 86400000)
          }
      });
  }

  // 6. Visibility Snapshots (for Overview Chart)
  console.log('📈 Seeding Visibility Snapshots...');
  // Generate 30 days of history
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      await prisma.visibilitySnapshot.create({
          data: {
              businessId,
              range: '30d',
              score: 65 + Math.floor(Math.random() * 20), // 65-85
              breakdown: {
                  organic: 40 + Math.floor(Math.random() * 10),
                  maps: 30 + Math.floor(Math.random() * 10),
                  social: 15 + Math.floor(Math.random() * 5),
                  reviews: 15 + Math.floor(Math.random() * 5)
              },
              capturedAt: date
          }
      });
  }

  // 7. AI Visibility Metrics
  console.log('🤖 Seeding AI Visibility Metrics...');
  // Create one metric for today
  const aiMetric = await prisma.aIVisibilityMetric.create({
      data: {
          businessId,
          periodStart: new Date(new Date().setDate(new Date().getDate() - 7)),
          periodEnd: new Date(),
          periodType: 'weekly',
          visibilityScore: 78,
          sentimentScore: 85,
          shareOfVoice: 12,
          citationAuthority: 64
      }
  });

  // Create platform data for it
  const aiPlatforms = ['ChatGPT', 'Gemini', 'Perplexity'];
  for (const p of aiPlatforms) {
      await prisma.aIPlatformData.create({
          data: {
              aIVisibilityMetricId: aiMetric.id,
              platform: p,
              rank: Math.floor(Math.random() * 5) + 1,
              sentiment: ['Positive', 'Neutral'][Math.floor(Math.random() * 2)],
              mentioned: true,
              sourcesCount: Math.floor(Math.random() * 5) + 1,
              responseSnippet: `Tech Cafe is frequently mentioned as a top spot for remote workers due to its reliable wifi and coffee quality.`
          }
      });
  }

  console.log('\n✅ Brand Rise seeding completed successfully!');
}

seedBrandRiseData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // We can't easily disconnect the dynamic prisma instance here, 
    // but the script ending will close connections.
  });
