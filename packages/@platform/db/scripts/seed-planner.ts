import { prisma } from '../src/client';

async function main() {
  console.log('🌱 Seeding Planner Data...');

  // 1. Content Templates
  const templates = [
    {
      industry: 'Local Restaurant',
      objective: 'Engagement',
      contentType: 'image',
      title: 'Behind the Scenes',
      content: 'Ever wondered how we make our signature {dish_name}? Here is a sneak peek into our kitchen! 👨‍🍳🔥 #LocalEats #BehindTheScenes',
      mediaPrompt: 'A professional photo of a chef plating a beautiful pasta dish in a cozy restaurant kitchen, warm lighting',
      tags: ['kitchen', 'chef', 'behind-the-scenes']
    },
    {
      industry: 'Local Restaurant',
      objective: 'Sales',
      contentType: 'carousel',
      title: 'Weekend Special',
      content: 'Our weekend specials are here! 🍷✨ Slide to see what we have prepared for you. Book your table now! #WeekendVibes #Foodie',
      mediaPrompt: 'Carousel of 3 images: 1. A glass of red wine and a steak, 2. A close up of a chocolate lava cake, 3. People laughing at a restaurant table',
      tags: ['special', 'weekend', 'menu']
    },
    {
      industry: 'Salon',
      objective: 'Awareness',
      contentType: 'image',
      title: 'New Style Alert',
      content: 'Transform your look with our latest {service_name}! 💇‍♀️✨ Book your appointment today and let us pamper you. #SalonLife #HairGoals',
      mediaPrompt: 'A woman with beautiful long wavy hair, smiling, in a bright modern hair salon',
      tags: ['hair', 'transformation', 'beauty']
    },
    {
      industry: 'Real Estate',
      objective: 'Sales',
      contentType: 'image',
      title: 'Just Listed',
      content: 'New listing alert! 🏠 This stunning {property_type} in {location} could be yours. DM for more details or to schedule a tour! #RealEstate #DreamHome',
      mediaPrompt: 'A beautiful modern house with a green lawn, blue sky, wide angle shot',
      tags: ['listing', 'home', 'real-estate']
    }
  ];

  for (const t of templates) {
    await prisma.contentTemplate.create({ data: t });
  }

  // 2. Seasonal Events (for 2026)
  const events = [
    {
      date: new Date('2026-02-14'),
      market: 'Global',
      name: "Valentine's Day",
      description: 'Day of love and affection',
      tags: ['holiday', 'love', 'valentines']
    },
    {
      date: new Date('2026-03-17'),
      market: 'Global',
      name: "St. Patrick's Day",
      description: 'Cultural and religious celebration',
      tags: ['holiday', 'celebration']
    },
    {
      date: new Date('2026-05-10'),
      market: 'US',
      name: "Mother's Day",
      description: 'Celebrating mothers and motherhood',
      tags: ['holiday', 'family']
    },
    {
      date: new Date('2026-07-04'),
      market: 'US',
      name: 'Independence Day',
      description: 'National day of the United States',
      tags: ['holiday', 'national']
    }
  ];

  for (const e of events) {
    await prisma.seasonalEvent.create({ data: e });
  }

  console.log('✅ Planner data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
