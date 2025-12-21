import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
const envPath = path.resolve(__dirname, '../../../../.env');
const result = dotenv.config({ path: envPath });

console.log('Loading .env from:', envPath);
console.log('Dotenv result error:', result.error);
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

// Prisma instance will be imported dynamically
let prisma: PrismaClient;


async function main() {
    // Dynamic import to ensure env vars are loaded first
    const clientModule = await import('../src/client');
    prisma = clientModule.prisma;
    console.log('🌱 Starting database seed...\n');

    // 1. Create Roles
    console.log('📋 Creating roles...');
    const ownerRole = await prisma.role.upsert({
        where: { name: 'Owner' },
        update: {},
        create: {
            name: 'Owner',
            description: 'Full business ownership and control',
        },
    });

    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrative access to business operations',
        },
    });

    const managerRole = await prisma.role.upsert({
        where: { name: 'Manager' },
        update: {},
        create: {
            name: 'Manager',
            description: 'Operational management access',
        },
    });

    const staffRole = await prisma.role.upsert({
        where: { name: 'Staff' },
        update: {},
        create: {
            name: 'Staff',
            description: 'Basic staff access',
        },
    });

    console.log(`✅ Created 4 roles\n`);

    // 2. Create Permissions
    console.log('🔐 Creating permissions...');
    const permissions = [
        { action: 'business:read', description: 'View business information' },
        { action: 'business:write', description: 'Edit business information' },
        { action: 'business:delete', description: 'Delete business' },
        { action: 'location:read', description: 'View locations' },
        { action: 'location:write', description: 'Create and edit locations' },
        { action: 'location:delete', description: 'Delete locations' },
        { action: 'user:read', description: 'View users' },
        { action: 'user:write', description: 'Invite and edit users' },
        { action: 'user:delete', description: 'Remove users' },
        { action: 'subscription:read', description: 'View subscription details' },
        { action: 'subscription:write', description: 'Manage subscription' },
        { action: 'review:read', description: 'View reviews' },
        { action: 'review:write', description: 'Create and edit reviews' },
        { action: 'review:respond', description: 'Respond to reviews' },
    ];

    const createdPermissions: Record<string, any> = {};
    for (const perm of permissions) {
        const permission = await prisma.permission.upsert({
            where: { action: perm.action },
            update: {},
            create: perm,
        });
        createdPermissions[perm.action] = permission;
    }

    console.log(`✅ Created ${permissions.length} permissions\n`);

    // 3. Assign Permissions to Roles
    console.log('🔗 Assigning permissions to roles...');

    // Owner: All permissions
    const ownerPermissions = Object.values(createdPermissions);
    for (const permission of ownerPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: ownerRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: ownerRole.id,
                permissionId: permission.id,
            },
        });
    }

    // Admin: All except business:delete
    const adminPermissions = ownerPermissions.filter(
        (p) => p.action !== 'business:delete'
    );
    for (const permission of adminPermissions) {
        await prisma.rolePermission.upsert({
            where: {
                roleId_permissionId: {
                    roleId: adminRole.id,
                    permissionId: permission.id,
                },
            },
            update: {},
            create: {
                roleId: adminRole.id,
                permissionId: permission.id,
            },
        });
    }

    // Manager: Read/write for business, locations, reviews
    const managerPermissionActions = [
        'business:read',
        'business:write',
        'location:read',
        'location:write',
        'user:read',
        'review:read',
        'review:write',
        'review:respond',
    ];
    for (const action of managerPermissionActions) {
        const permission = createdPermissions[action];
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: managerRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: managerRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    // Staff: Read-only access
    const staffPermissionActions = [
        'business:read',
        'location:read',
        'review:read',
    ];
    for (const action of staffPermissionActions) {
        const permission = createdPermissions[action];
        if (permission) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: staffRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: staffRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    console.log(`✅ Assigned permissions to all roles\n`);

    // 4. Create Sample Users (for development only)
    console.log('👤 Creating sample users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'owner@example.com',
            name: 'John Owner',
            emailVerified: new Date(),
            password: hashedPassword,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'admin@example.com',
            name: 'Jane Admin',
            emailVerified: new Date(),
            password: hashedPassword,
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'manager@example.com',
            name: 'Bob Manager',
            emailVerified: new Date(),
            password: hashedPassword,
        },
    });

    console.log(`✅ Created 3 sample users\n`);

    // 4b. Assign System Roles to Users
    console.log('🔗 Assigning system roles to users...');

    // Assign Owner role to user1
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: user1.id,
                roleId: ownerRole.id,
            },
        },
        update: {},
        create: {
            userId: user1.id,
            roleId: ownerRole.id,
        },
    });

    // Assign Admin role to user2
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: user2.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: user2.id,
            roleId: adminRole.id,
        },
    });

    // Assign Manager role to user3
    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: user3.id,
                roleId: managerRole.id,
            },
        },
        update: {},
        create: {
            userId: user3.id,
            roleId: managerRole.id,
        },
    });

    console.log(`✅ Assigned system roles to users\n`);

    // 5. Create Sample Businesses
    console.log('🏢 Creating sample businesses...');
    const business1 = await prisma.business.upsert({
        where: { slug: 'acme-restaurant' },
        update: {},
        create: {
            name: 'ACME Restaurant',
            slug: 'acme-restaurant',
            description: 'Fine dining experience in the heart of the city',
            phone: '+1-555-1000',
            email: 'contact@acme-restaurant.com',
            website: 'https://acme-restaurant.com',
            status: 'active',
        },
    });

    const business2 = await prisma.business.upsert({
        where: { slug: 'tech-cafe' },
        update: {},
        create: {
            name: 'Tech Cafe',
            slug: 'tech-cafe',
            description: 'Modern cafe with great coffee and workspace',
            phone: '+1-555-2000',
            email: 'hello@techcafe.com',
            website: 'https://techcafe.com',
            status: 'active',
        },
    });

    console.log(`✅ Created 2 sample businesses\n`);

    // 6. Create Locations
    console.log('📍 Creating locations...');
    await prisma.location.upsert({
        where: { id: '11111111-1111-1111-1111-111111111111' },
        update: {},
        create: {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'ACME Downtown',
            address: '123 Main Street, New York, NY 10001, US',
            status: 'active',
            businessId: business1.id,
        },
    });

    await prisma.location.upsert({
        where: { id: '22222222-2222-2222-2222-222222222222' },
        update: {},
        create: {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'ACME Uptown',
            address: '456 Park Avenue, New York, NY 10021, US',
            status: 'active',
            businessId: business1.id,
        },
    });

    await prisma.location.upsert({
        where: { id: '33333333-3333-3333-3333-333333333333' },
        update: {},
        create: {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Tech Cafe Main',
            address: '789 Tech Boulevard, San Francisco, CA 94102, US',
            status: 'active',
            businessId: business2.id,
        },
    });

    console.log(`✅ Created 3 locations\n`);

    // 7. Assign Users to Businesses with Roles
    console.log('🔗 Assigning users to businesses...');
    await prisma.userBusinessRole.upsert({
        where: {
            userId_businessId_roleId: {
                userId: user1.id,
                businessId: business1.id,
                roleId: ownerRole.id,
            },
        },
        update: {},
        create: {
            userId: user1.id,
            businessId: business1.id,
            roleId: ownerRole.id,
        },
    });

    await prisma.userBusinessRole.upsert({
        where: {
            userId_businessId_roleId: {
                userId: user2.id,
                businessId: business1.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: user2.id,
            businessId: business1.id,
            roleId: adminRole.id,
        },
    });

    await prisma.userBusinessRole.upsert({
        where: {
            userId_businessId_roleId: {
                userId: user3.id,
                businessId: business2.id,
                roleId: managerRole.id,
            },
        },
        update: {},
        create: {
            userId: user3.id,
            businessId: business2.id,
            roleId: managerRole.id,
        },
    });

    console.log(`✅ Assigned users to businesses\n`);

    // 8. Create Sample Subscriptions
    console.log('💳 Creating subscriptions...');
    await prisma.subscription.upsert({
        where: { id: '44444444-4444-4444-4444-444444444444' },
        update: {},
        create: {
            id: '44444444-4444-4444-4444-444444444444',
            businessId: business1.id,
            plan: 'professional',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            stripeSubscriptionId: 'sub_test_acme_123',
            stripeCustomerId: 'cus_test_acme_123',
        },
    });

    await prisma.subscription.upsert({
        where: { id: '55555555-5555-5555-5555-555555555555' },
        update: {},
        create: {
            id: '55555555-5555-5555-5555-555555555555',
            businessId: business2.id,
            plan: 'starter',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            stripeSubscriptionId: 'sub_test_tech_123',
            stripeCustomerId: 'cus_test_tech_123',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
    });

    console.log(`✅ Created 2 subscriptions\n`);

    // 9. Create Failed Jobs
    console.log('⚠️ Creating failed jobs...');
    
    // Job 1: Review Fetch Failure
    await prisma.job.upsert({
        where: { id: '66666666-6666-6666-6666-666666666666' },
        update: {},
        create: {
            id: '66666666-6666-6666-6666-666666666666',
            type: 'reviews',
            status: 'failed',
            businessId: business1.id,
            locationId: '11111111-1111-1111-1111-111111111111',
            error: {
                message: 'Google API rate limit exceeded',
                code: 'RATE_LIMIT_EXCEEDED',
                details: 'Quota 1000/1000 used'
            },
            payload: {
                source: 'google',
                days: 30
            },
            retryCount: 3,
            maxRetries: 3,
            failedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
    });

    // Job 2: Social Post Failure
    await prisma.job.upsert({
        where: { id: '77777777-7777-7777-7777-777777777777' },
        update: {},
        create: {
            id: '77777777-7777-7777-7777-777777777777',
            type: 'social_posts',
            status: 'failed',
            businessId: business2.id,
            locationId: '33333333-3333-3333-3333-333333333333',
            error: {
                message: 'Invalid image format',
                code: 'INVALID_FORMAT',
                details: 'Image must be JPG or PNG'
            },
            payload: {
                platform: 'facebook',
                content: 'Check out our new latte art!',
                media: ['image.webp']
            },
            retryCount: 1,
            maxRetries: 3,
            failedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        },
    });

    // Job 3: AI Task Failure
    await prisma.job.upsert({
        where: { id: '88888888-8888-8888-8888-888888888888' },
        update: {},
        create: {
            id: '88888888-8888-8888-8888-888888888888',
            type: 'ai_tasks',
            status: 'failed',
            businessId: business1.id,
            error: {
                message: 'OpenAI API timeout',
                code: 'TIMEOUT',
                details: 'Request took longer than 30s'
            },
            payload: {
                prompt: 'Generate a response to a positive review about our steak',
                model: 'gpt-4'
            },
            retryCount: 5,
            maxRetries: 5,
            failedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            createdAt: new Date(Date.now() - 40 * 60 * 1000),
        },
    });

    console.log(`✅ Created 3 failed jobs\n`);

    // 10. Create Review Sync Logs
    console.log('📝 Creating review sync logs...');

    // Log 1: Successful Google Sync for ACME Downtown
    await prisma.reviewSyncLog.create({
        data: {
            businessId: business1.id,
            locationId: '11111111-1111-1111-1111-111111111111',
            platform: 'google',
            status: 'success',
            reviewsSynced: 15,
            durationMs: 1250,
            startedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
            completedAt: new Date(Date.now() - 1000 * 60 * 60 + 1250),
            requestData: {
                accountId: 'accounts/12345',
                locationId: 'locations/67890',
                pageSize: 50
            },
            responseData: {
                reviews: [
                    { id: 'r1', rating: 5, comment: 'Great service!' },
                    { id: 'r2', rating: 4, comment: 'Good food.' }
                ],
                nextPageToken: null
            }
        }
    });

    // Log 2: Failed Facebook Sync for ACME Uptown (Linked to Failed Job)
    await prisma.reviewSyncLog.create({
        data: {
            businessId: business1.id,
            locationId: '22222222-2222-2222-2222-222222222222',
            platform: 'facebook',
            status: 'failed',
            errorMessage: 'Facebook Graph API Error: Session expired',
            errorStack: 'Error: Session expired\n    at FacebookClient.getReviews (src/clients/facebook.ts:45:12)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)',
            durationMs: 500,
            startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 500),
            jobId: '66666666-6666-6666-6666-666666666666',
            requestData: {
                pageId: '1029384756',
                fields: 'rating,review_text,created_time'
            },
            responseData: {
                error: {
                    message: 'Session has expired',
                    type: 'OAuthException',
                    code: 190
                }
            }
        }
    });

    // Log 3: Successful Yelp Sync for Tech Cafe
    await prisma.reviewSyncLog.create({
        data: {
            businessId: business2.id,
            locationId: '33333333-3333-3333-3333-333333333333',
            platform: 'yelp',
            status: 'success',
            reviewsSynced: 5,
            durationMs: 800,
            startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            completedAt: new Date(Date.now() - 1000 * 60 * 30 + 800),
            requestData: {
                businessId: 'tech-cafe-sf',
                limit: 20
            },
            responseData: {
                reviews: [
                    { id: 'y1', rating: 5, text: 'Best coffee in town!' }
                ],
                total: 150
            }
        }
    });

    console.log(`✅ Created 3 review sync logs\n`);

    console.log('✨ Seed completed successfully!\n');
    console.log('Summary:');
    console.log('  - 4 roles (Owner, Admin, Manager, Staff)');
    console.log(`  - ${permissions.length} permissions`);
    console.log('  - Role-permission mappings');
    console.log('  - 3 sample users');
    console.log('  - 2 sample businesses');
    console.log('  - 3 locations');
    console.log('  - 3 user-business-role assignments');
    console.log('  - 2 active subscriptions');
    console.log('  - 3 failed jobs');
}

main()
    .catch((e) => {
        console.error('❌ Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        if (prisma) {
            await prisma.$disconnect();
        }
    });
