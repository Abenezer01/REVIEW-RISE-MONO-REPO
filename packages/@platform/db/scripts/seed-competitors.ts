import dotenv from 'dotenv';
import path from 'path';

// Properly load env vars from root
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

async function seedCompetitorData() {
    // Dynamic import to ensure env vars are loaded first
    const { prisma } = await import('../src/client');
    console.log('🌱 Seeding Competitor data...');

    try {
        // 1. Get the ACME Restaurant business
        const business = await prisma.business.findUnique({
            where: { slug: 'acme-restaurant' },
        });

        if (!business) {
            console.log('⚠️ ACME Restaurant not found. Skipping competitor seeding. Please run the main seed script first.');
            return;
        }

        console.log(`✓ Found business: ${business.name} (${business.id})`);

        // 2. Create Competitors
        const competitorsData = [
            {
                domain: 'joeys-pizza.com',
                name: "Joey's Pizza",
                type: 'DIRECT_LOCAL',
                website: 'https://joeys-pizza.com',
            },
            {
                domain: 'dominos.com',
                name: "Domino's",
                type: 'AGGREGATOR', // Technically a chain, but acting as a major external force
                website: 'https://dominos.com',
            },
            {
                domain: 'sliceup.com',
                name: "Slice Up",
                type: 'UNKNOWN',
                website: 'https://sliceup.com',
            }
        ];

        const createdCompetitors = [];

        for (const data of competitorsData) {
            const competitor = await prisma.competitor.upsert({
                where: {
                    businessId_domain: {
                        businessId: business.id,
                        domain: data.domain,
                    },
                },
                update: {
                    type: data.type as any,
                },
                create: {
                    businessId: business.id,
                    name: data.name, // Added name here
                    domain: data.domain,
                    website: data.website,
                    type: data.type as any,
                },
            });
            createdCompetitors.push(competitor);
            console.log(`✓ Upserted competitor: ${competitor.domain}`);
        }

        // 3. Create a Competitor Snapshot for Joey's Pizza
        const joeys = createdCompetitors.find(c => c.name === "Joey's Pizza");
        if (joeys) {
            await prisma.competitorSnapshot.create({
                data: {
                    competitorId: joeys.id,
                    headline: "Best Pizza in Town",
                    uvp: "Authentic NY Style Pizza made with fresh ingredients.",
                    serviceList: ["Dine-in", "Takeout", "Delivery", "Catering"], // Renamed from services
                    pricingCues: ["$$"], // Mapped pricing to pricingCues array or similar logic
                    trustSignals: { badges: ["4.5 stars on Google"], certifications: ["Family owned since 1990"] }, // structured as JSON
                    ctaStyles: ["Order Now", "View Menu"],
                    differentiators: {
                        strengths: ["Strong local reputation", "High quality ingredients"],
                        weaknesses: ["Limited delivery radius", "No online ordering app"],
                        opportunities: ["Expand delivery", "Launch loyalty program"],
                        threats: ["Rising cheese prices"],
                        unique: ["Secret family recipe sauce", "Brick oven"],
                        summary: "A strong local competitor with a loyal following."
                    },
                    whatToLearn: ["Community engagement", "Authenticity"],
                    whatToAvoid: ["Slow delivery times during peak hours"]
                },
            });
            console.log(`✓ Created snapshot for ${joeys.name}`);
        }

        // 4. Create an Opportunities Report
        await prisma.opportunitiesReport.create({
            data: {
                businessId: business.id,
                // Removed status, summary (not in schema)
                gaps: [
                    { title: "Ordering Speed", description: "Your online ordering process is slower than Domino's", priority: 8 },
                    { title: "Catering", description: "Joey's Pizza offers better catering deals", priority: 6 }
                ],
                strategies: [
                    { title: "Improve Speed", description: "Optimize website load time", pros: ["Better UX"], cons: ["Cost"] },
                    { title: "Lunch Special", description: "Launch a 'Lunch Special' to compete with Slice Up", pros: ["Volume"], cons: ["Lower margin"] }
                ],
                positioningMap: {
                    x_axis: "Price",
                    y_axis: "Quality",
                    entities: [
                        { name: "You", x: 7, y: 8 },
                        { name: "Joey's Pizza", x: 6, y: 7 },
                        { name: "Domino's", x: 4, y: 5 },
                    ]
                },
                contentIdeas: [
                    { topic: "Fresh Ingredients", rationale: "Highlight quality difference", competitorGap: "High" },
                    { topic: "Kitchen Tour", rationale: "Show transparency", competitorGap: "Medium" }
                ],
                suggestedTaglines: ["Pizza Done Right", "Taste the Tradition"],
                generatedAt: new Date(),
            },
        });
        console.log(`✓ Created sample Opportunities Report`);

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
