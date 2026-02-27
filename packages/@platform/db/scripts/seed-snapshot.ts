
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../../.env');
dotenv.config({ path: envPath });

let prisma: PrismaClient;

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const clientModule = await import('../src/client.js');
    prisma = clientModule.prisma;

    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`🔌 Connecting to database: ${dbUrl.replace(/:[^:@]*@/, ':****@')}`);

    console.log('🌱 Seeding GBP Profile Snapshot and Audit...');

    const businessId = 'a1dd8e07-694c-499f-a01a-2b991c283921'; // ACME Restaurant
    const locationId = '11111111-1111-4111-8111-111111111111'; // ACME Downtown

    // Ensure business and location exist (in case seed hasn't run)
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business) {
        console.error(`❌ Business ${businessId} not found. Please run 'pnpm db:seed' first.`);
        return;
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
        console.error(`❌ Location ${locationId} not found. Please run 'pnpm db:seed' first.`);
        return;
    }

    // Create Snapshot
    const snapshotData = {
        name: `locations/${locationId}`,
        title: "ACME Downtown",
        storeCode: "ACME-001",
        languageCode: "en-US",
        phoneNumbers: {
            primaryPhone: "+1 555-1000"
        },
        categories: {
            primaryCategory: {
                displayName: "Restaurant",
                categoryId: "gcid:restaurant"
            }
        },
        websiteUri: "https://acme-restaurant.com",
        regularHours: {
            periods: [
                {
                    openDay: "MONDAY",
                    openTime: "09:00",
                    closeDay: "MONDAY",
                    closeTime: "17:00"
                }
            ]
        },
        profile: {
            description: "A fine dining experience in the heart of the city. We serve the best food in town."
        },
        serviceArea: {
            businessType: "CUSTOMER_LOCATION_ONLY",
            places: {
                placeInfos: []
            }
        },
        metadata: {
            mapsUri: "https://maps.google.com/maps?cid=123456789",
            newReviewUri: "https://search.google.com/local/writereview?placeid=ChIJ..."
        }
    };

    const snapshot = await prisma.gbpProfileSnapshot.create({
        data: {
            businessId,
            locationId,
            captureType: 'manual',
            snapshot: snapshotData,
            capturedAt: new Date(),
        }
    });

    console.log(`✅ Created Snapshot: ${snapshot.id}`);

    // Create Audit Result
    const auditDetails = {
        completeness: {
            score: 85,
            totalFields: 12,
            filledFields: 10,
            missingFields: ["menuUri", "appointmentUri"]
        },
        quality: {
            score: 75,
            description: {
                length: 80,
                hasKeywords: true,
                issues: ["Could be longer for better SEO"]
            }
        },
        issues: [
            {
                id: "missing_menu",
                type: "missing_field",
                severity: "opportunity",
                field: "menuUri",
                message: "Add a link to your menu",
                whyItMatters: "Customers want to see what you offer before visiting.",
                scoreImpact: -5
            },
            {
                id: "short_description",
                type: "quality",
                severity: "warning",
                field: "description",
                message: "Description is too short",
                whyItMatters: "Longer descriptions help with SEO and customer conversion.",
                scoreImpact: -10
            }
        ]
    };

    const audit = await prisma.gbpProfileAudit.create({
        data: {
            snapshotId: snapshot.id,
            score: 80.0,
            details: auditDetails
        }
    });

    console.log(`✅ Created Audit: ${audit.id} (Score: 80)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
