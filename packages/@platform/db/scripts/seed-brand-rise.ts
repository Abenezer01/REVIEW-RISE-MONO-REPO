
import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
try {
    dotenv.config({ path: envPath });
} catch (e) {
    // Ignore missing .env in production
}

async function seedBrandRiseData() {
  // Dynamic import to ensure env vars are loaded first
  const { prisma } = await import('../src/client');
  
  console.log('🌱 Seeding Brand Rise dashboard data...');

  const TECH_CAFE_LOCATION_ID = '33333333-3333-3333-3333-333333333333';

  // 0. Find the Tech Cafe business (created in seed.ts)
  let business = await prisma.business.findFirst({
    where: { OR: [{ slug: 'tech-cafe' }, { slug: 'tech-cafe-brand-rise' }] }
  });

  if (!business) {
    console.log('Business "tech-cafe" not found, creating it...');
    business = await prisma.business.create({
      data: {
        name: 'Tech Cafe',
        slug: 'tech-cafe',
        description: 'Modern cafe with great coffee and workspace',
        status: 'active',
      }
    });
  }

  const businessId = business.id;
  console.log(`Using Business ID: ${businessId} for ${business.name}`);

  // Ensure the location exists and is associated with this business
  let location = await prisma.location.findUnique({ where: { id: TECH_CAFE_LOCATION_ID } });
  if (!location) {
    console.log('Location not found, creating Tech Cafe Main location...');
    location = await prisma.location.create({
      data: {
        id: TECH_CAFE_LOCATION_ID,
        name: 'Tech Cafe Main',
        address: '789 Tech Boulevard, San Francisco, CA 94102, US',
        status: 'active',
        businessId: businessId,
      }
    });
  } else if (location.businessId !== businessId) {
    console.log('Updating location to match businessId...');
    await prisma.location.update({
      where: { id: TECH_CAFE_LOCATION_ID },
      data: { businessId: businessId }
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

  // 1.5 Brand Profile
  console.log('🏢 Seeding Brand Profile...');
  const brandProfileData = {
      businessId,
      websiteUrl: 'https://techcafe.io',
      title: 'Tech Cafe',
      description: 'Modern cafe with great coffee and workspace',
      status: 'completed',
      autoReplySettings: {
          enabled: true,
          mode: 'positive_neutral',
          manualNegativeApproval: true,
          delayHours: 2,
          maxRepliesPerDay: 50
      }
  };

  const existingProfile = await prisma.brandProfile.findFirst({
      where: { businessId, websiteUrl: 'https://techcafe.io' }
  });

  if (existingProfile) {
      await prisma.brandProfile.update({
          where: { id: existingProfile.id },
          data: brandProfileData as any
      });
  } else {
      await prisma.brandProfile.create({
          data: brandProfileData as any
      });
  }

  // 2. Competitors
  console.log('⚔️ Seeding Competitors...');
  const competitorsData = [
      { 
          name: 'Starbucks', 
          domain: 'starbucks.com',
          website: 'https://starbucks.com',
          type: 'DIRECT_LOCAL',
          source: 'manual',
          relevanceScore: 95,
          ranking: 1,
          snapshot: {
              headline: 'Starbucks Coffee - Handcrafted beverages and great-tasting food',
              uvp: 'Premium coffee experience with consistent quality and worldwide presence',
              serviceList: ['Coffee & Espresso', 'Tea', 'Bakery Items', 'Breakfast & Lunch', 'Mobile Ordering', 'Rewards Program'],
              pricingCues: ['Starting at $3.95', 'Rewards members save', 'Mobile order & pay'],
              trustSignals: { badges: ['#1 Coffee Chain'], certifications: ['Fair Trade Certified'], reviewCount: 50000, avgRating: 4.2 },
              ctaStyles: ['Order Now', 'Join Rewards', 'Find a Store'],
              contentCategories: ['Menu', 'Locations', 'Rewards', 'About Us'],
              differentiators: {
                  strengths: ['Global brand recognition', 'Extensive store network', 'Mobile app integration'],
                  weaknesses: ['Premium pricing', 'Corporate atmosphere', 'Inconsistent quality across locations'],
                  unique: ['Starbucks Rewards program', 'Seasonal specialty drinks', 'Third place experience']
              },
              whatToLearn: ['Customer loyalty program design', 'Mobile ordering system', 'Seasonal product launches'],
              whatToAvoid: ['Over-expansion losing local feel', 'Pricing out budget customers', 'Losing artisanal quality']
          }
      },
      { 
          name: 'Peets Coffee', 
          domain: 'peets.com',
          website: 'https://peets.com',
          type: 'DIRECT_LOCAL',
          source: 'manual',
          relevanceScore: 82,
          ranking: 2,
          snapshot: {
              headline: "Peet's Coffee - Fresher, Bolder, Better",
              uvp: 'Small-batch artisanal coffee with deep roasting expertise since 1966',
              serviceList: ['Specialty Coffee', 'Espresso Bar', 'Tea Selection', 'Pastries', 'Coffee Beans', 'Subscription Service'],
              pricingCues: ['Premium beans from $14.95/lb', 'Free shipping over $39', 'Subscribe & save 10%'],
              trustSignals: { badges: ['Founded 1966', 'Small Batch'], certifications: ['Organic Options', 'Rainforest Alliance'], reviewCount: 15000, avgRating: 4.5 },
              ctaStyles: ['Shop Now', 'Subscribe', 'Find Stores', 'Learn More'],
              contentCategories: ['Coffee Origins', 'Roasting Process', 'Brewing Guide', 'Locations'],
              differentiators: {
                  strengths: ['Artisanal roasting expertise', 'Heritage brand since 1966', 'Quality over quantity approach'],
                  weaknesses: ['Limited store locations', 'Higher price point', 'Less known outside West Coast'],
                  unique: ['Deep roast signature', 'Focus on coffee craftsmanship', 'Smaller footprint than competitors']
              },
              whatToLearn: ['Premium positioning strategy', 'Heritage storytelling', 'Subscription model implementation'],
              whatToAvoid: ['Limited accessibility', 'Regional focus limiting growth', 'Intimidating to casual coffee drinkers']
          }
      },
      { 
          name: 'Blue Bottle', 
          domain: 'bluebottlecoffee.com',
          website: 'https://bluebottlecoffee.com',
          type: 'DIRECT_LOCAL',
          source: 'discovery',
          relevanceScore: 88,
          ranking: 3,
          snapshot: {
              headline: 'Blue Bottle Coffee - Delicious coffee. Freshly roasted.',
              uvp: 'Freshly roasted, perfectly brewed coffee delivered within 48 hours of roasting',
              serviceList: ['Single-Origin Coffee', 'Espresso', 'Cold Brew', 'Pour Over', 'Coffee Subscriptions', 'Brewing Equipment'],
              pricingCues: ['Subscriptions from $11/week', 'Free shipping', '48-hour freshness guarantee'],
              trustSignals: { badges: ['Freshness Guarantee', 'Third Wave Coffee'], certifications: ['Organic', 'Direct Trade'], reviewCount: 8500, avgRating: 4.7 },
              ctaStyles: ['Start Subscription', 'Shop Coffee', 'Visit Cafe', 'Learn to Brew'],
              contentCategories: ['Our Coffee', 'Brew Guides', 'Stories', 'Cafes', 'Gear'],
              differentiators: {
                  strengths: ['48-hour freshness commitment', 'Minimalist aesthetic', 'Tech-savvy target audience'],
                  weaknesses: ['Premium pricing tier', 'Limited physical locations', 'May seem pretentious'],
                  unique: ['Freshness as core value proposition', 'Japanese-inspired design', 'Subscription-first model']
              },
              whatToLearn: ['Freshness commitment as differentiator', 'Minimalist brand aesthetic', 'Subscription engagement tactics'],
              whatToAvoid: ['Elitist positioning', 'Complexity over accessibility', 'Losing independent spirit after acquisition']
          }
      },
      {
          name: 'Yelp',
          domain: 'yelp.com',
          website: 'https://yelp.com',
          type: 'AGGREGATOR',
          source: 'discovery',
          relevanceScore: 70,
          ranking: 4,
          snapshot: {
              headline: 'Find Local Businesses & Reviews on Yelp',
              uvp: 'Connect with great local businesses through millions of reviews',
              serviceList: ['Business Listings', 'User Reviews', 'Business Photos', 'Reservation Booking', 'Food Delivery'],
              pricingCues: ['Free for users', 'Business advertising available'],
              trustSignals: { badges: ['Over 200M reviews'], certifications: [], reviewCount: 200000000, avgRating: null },
              ctaStyles: ['Write a Review', 'Find Businesses', 'Sign Up', 'For Business Owners'],
              contentCategories: ['Restaurants', 'Shopping', 'Services', 'Reviews'],
              differentiators: {
                  strengths: ['Massive review database', 'Strong local focus', 'User-generated content'],
                  weaknesses: ['Controversial business practices', 'Review filtering concerns', 'Declining relevance vs Google'],
                  unique: ['Community-driven reviews', 'Comprehensive business categories', 'Photo-rich profiles']
              },
              whatToLearn: ['User review systems', 'Photo integration', 'Local SEO strategies'],
              whatToAvoid: ['Aggressive monetization', 'Questionable review filtering', 'Alienating business owners']
          }
      }
  ];

  for (const comp of competitorsData) {
      // Robustly find existing competitor by domain OR name to avoid unique constraint violations
      const existingCompetitor = await prisma.competitor.findFirst({
          where: {
              businessId,
              OR: [
                  { domain: comp.domain },
                  { name: comp.name }
              ]
          } as any
      });

      let competitor;
      if (existingCompetitor) {
          competitor = await prisma.competitor.update({
              where: { id: existingCompetitor.id },
              data: {
                  name: comp.name, // Ensure name aligns with seed data
                  domain: comp.domain,
                  relevanceScore: comp.relevanceScore,
                  ranking: comp.ranking,
                  source: comp.source,
                  type: comp.type as any,
              } as any
          });
      } else {
          competitor = await prisma.competitor.create({
              data: {
                  businessId,
                  name: comp.name,
                  domain: comp.domain,
                  website: comp.website,
                  type: comp.type as any,
                  source: comp.source,
                  relevanceScore: comp.relevanceScore,
                  ranking: comp.ranking,
                  isUserAdded: comp.source === 'manual'
              } as any
          });
      }

      // Clear existing snapshots for this competitor to avoid duplicates
      await prisma.competitorSnapshot.deleteMany({
          where: { competitorId: competitor.id }
      });

      // Create a comprehensive snapshot for each competitor
      await prisma.competitorSnapshot.create({
          data: {
              competitorId: competitor.id,
              headline: comp.snapshot.headline,
              uvp: comp.snapshot.uvp,
              serviceList: comp.snapshot.serviceList,
              pricingCues: comp.snapshot.pricingCues,
              trustSignals: comp.snapshot.trustSignals as any,
              ctaStyles: comp.snapshot.ctaStyles,
              contentCategories: comp.snapshot.contentCategories,
              differentiators: comp.snapshot.differentiators as any,
              whatToLearn: comp.snapshot.whatToLearn,
              whatToAvoid: comp.snapshot.whatToAvoid,
              metrics: {
                  visibilityScore: Math.floor(Math.random() * 30) + 60,
                  socialFollowers: Math.floor(Math.random() * 10000) + 5000,
                  reviewCount: comp.snapshot.trustSignals.reviewCount || Math.floor(Math.random() * 500) + 100,
                  averageRating: comp.snapshot.trustSignals.avgRating || (Math.random() * 1.5 + 3.5).toFixed(1)
              },
              capturedAt: new Date()
          } as any
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
      { author: 'Dave W.', rating: 3, content: 'Service was slow today.', replyStatus: 'pending_approval' },
      { author: 'Eve S.', rating: 2, content: 'Coffee was cold and the staff was rude.', replyStatus: 'pending_approval' }
  ];

  for (const [i, review] of reviews.entries()) {
      await prisma.review.upsert({
        where: { platform_externalId: { platform: platforms[i % 3], externalId: `review-${i}` } },
        update: {
            businessId,
            locationId: TECH_CAFE_LOCATION_ID,
            replyStatus: (review as any).replyStatus || null,
            aiSuggestions: (review as any).replyStatus === 'pending_approval' ? {
                suggestedReply: `Hi ${review.author.split(' ')[0]}, we're sorry to hear about your experience. We'd love to make it right!`,
                analysis: "Customer expressed dissatisfaction with service/staff."
            } : null
        },
        create: {
          businessId,
          locationId: TECH_CAFE_LOCATION_ID,
          platform: platforms[i % 3],
          externalId: `review-${i}`,
          author: review.author,
          rating: review.rating,
          content: review.content,
          replyStatus: (review as any).replyStatus || null,
          aiSuggestions: (review as any).replyStatus === 'pending_approval' ? {
              suggestedReply: `Hi ${review.author.split(' ')[0]}, we're sorry to hear about your experience. We'd love to make it right!`,
              analysis: "Customer expressed dissatisfaction with service/staff."
          } : null,
          publishedAt: new Date(Date.now() - i * 86400000), // 1 day apart
          createdAt: new Date()
        }
      } as any);
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
