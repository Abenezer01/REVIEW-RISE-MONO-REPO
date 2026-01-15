import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables
// Load environment variables (optional, for local dev)
const envPath = path.resolve(__dirname, '../../../../.env');
try {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.warn('⚠️  Dotenv loaded with error (ignoring if env vars exist):', result.error.message);
    } else {
        console.log('✅ Loaded .env from:', envPath);
    }
} catch (error: any) {
    console.log('ℹ️  Skipping .env load (likely in production/docker):', error.message);
}

console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

// Prisma instance will be imported dynamically
let prisma: PrismaClient;


async function main() {
    // Dynamic import to ensure env vars are loaded first
    const clientModule = await import('../src/client');
    prisma = clientModule.prisma;
    console.log('🌱 Starting database seed...\n');

    // Helper to safely assign roles using findMany + JS checks (safest for NULL unique constraints)
    const assignRole = async (uId: string, bId: string, rId: string, lId: string | null) => {
        try {
            // Fetch all roles for this user/business/role combo (ignoring location for now)
            const existingRoles = await prisma.userBusinessRole.findMany({
                where: {
                    userId: uId,
                    businessId: bId,
                    roleId: rId,
                }
            });

            // Check if exact match exists (handling null locationId explicitly in JS)
            const exists = existingRoles.find(r => r.locationId === lId);
            
            if (!exists) {
                const createData: any = {
                    userId: uId,
                    businessId: bId,
                    roleId: rId,
                };
                if (lId) {
                    createData.locationId = lId;
                }
                
                await prisma.userBusinessRole.create({
                    data: createData
                });
            }
        } catch (e) {
            console.error(`FAILED assignRole for u=${uId} b=${bId} r=${rId} l=${lId}`, e);
            throw e; 
        }
    };

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

    // Helper for system roles
    const assignSystemRole = async (userId: string, roleName: string) => {
        const role = await prisma.role.findUnique({ where: { name: roleName } });
        if (role) {
             await prisma.userRole.upsert({
                where: { userId_roleId: { userId, roleId: role.id } },
                create: { userId, roleId: role.id },
                update: {}
             });
        }
    };

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

    // 4b. Assign System Roles to Users (CRITICAL for login)
    console.log('🔗 Assigning system roles (UserRole) to users...');
    await assignSystemRole(user1.id, 'Owner');
    await assignSystemRole(user2.id, 'Admin');
    await assignSystemRole(user3.id, 'Manager');
    console.log(`✅ Assigned system roles to users\n`);

    // 4b. Assign System Roles to Users
    
    // (Moved helper to top of main)

    // Cannot run this here because business1 is not yet defined
    // We will assign after businesses are created
    /* 
    console.log('🔗 Assigning system roles to users...');
    await assignRole(user1.id, business1.id, ownerRole.id, null);
    await assignRole(user2.id, business1.id, adminRole.id, null);
    await assignRole(user3.id, business2.id, managerRole.id, null);
    console.log(`✅ Assigned system roles to users\n`);
    */

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

    // Re-enabled System Roles assignment now that business1 is defined
    console.log('🔗 Assigning system roles to users...');
     // Assign Owner role to user1
    await assignRole(user1.id, business1.id, ownerRole.id, null);
    // Assign Admin role to user2
    await assignRole(user2.id, business1.id, adminRole.id, null);
    // Assign Manager role to user3
    await assignRole(user3.id, business2.id, managerRole.id, null);
    console.log(`✅ Assigned system roles to users\n`);


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

    // 7. Assign Users to Businesses with Roles (Again? The logic was duplicated in original file?)
    // In original file, step 4b assigned roles, step 7 assigned MORE roles?
    // Let's check step 7 content in previous view.
    /*
    357:     // 7. Assign Users to Businesses with Roles
    358:     console.log('🔗 Assigning users to businesses...');
    ...
    397:     await assignRole(user1.id, business1.id, ownerRole.id, null);
    398:     await assignRole(user2.id, business1.id, adminRole.id, null);
    399:     await assignRole(user3.id, business2.id, managerRole.id, null);
    400:     await assignRole(user2.id, business1.id, managerRole.id, location1.id);
    */
   
    // It seems step 4b and step 7 were duplicate or similar in original file structure?
    // In my previous edit I introduced 4b.
    // The original file had 7. 
    // I should probably remove 4b logic to avoid confusion or duplication, OR rely on 7.
    // However, 7 needs `assignRole` helper.
    // The previous edit inserted `assignRole` at line 242 (step 4b).
    // And also at line 360 (step 7). 
    // This caused the "Cannot redeclare block-scoped variable" error.
    
    // SO, I will define `assignRole` at the TOP (as I'm doing in this replacement).
    // And then I will use it in step 7.
    // I will REMOVE step 4b completely from this replacement block to clean up.
    // The replacement covers lines 24-402 (huge block).
    
    // WAIT. Replacing lines 24 to 402 is risky if I miss anything.
    // Step 1879 view shows lines 1-729.
    // I can replace the whole `main` function body or relevant parts.
    // Lines 24 to 402 covers creation of Roles, Permissions, Assignment, Users, Businesses, Locations.
    
    // I will construct the content correctly:
    // 1. Roles
    // 2. Permissions
    // 3. Assign Permissions
    // 4. Users
    // 5. Businesses (Moved UP before 4b/7) -> No, Businesses depend on nothing.
    // But Step 7 (UserBusinessRole) depends on Users AND Businesses.
    
    // Current structure:
    // 1. Roles
    // 2. Permissions
    // 3. RolePermissions
    // 4. Users
    // 4b. UserBusinessRoles (System roles) -> FAILED because `business1` not defined.
    // 5. Businesses (defines business1)
    // 6. Locations
    // 7. UserBusinessRoles (Again?)
    
    // Strategy:
    // Define `assignRole` at top of `main`.
    // Keep 1, 2, 3, 4.
    // Remove 4b completely (it's premature).
    // Keep 5 (Businesses).
    // Keep 6 (Locations).
    // Keep 7 (UserBusinessRoles) - THIS is where we assign roles.
    
    console.log('🔗 Assigning users to businesses...');
    // assignRole is already defined at top of scope.
    
    // Assuming location1 is defined somewhere above
    const location1 = await prisma.location.findUniqueOrThrow({ where: { id: '33333333-3333-3333-3333-333333333333' } });

    await assignRole(user1.id, business1.id, ownerRole.id, null);
    await assignRole(user2.id, business1.id, adminRole.id, null);
    await assignRole(user3.id, business2.id, managerRole.id, null);
    await assignRole(user2.id, business1.id, managerRole.id, location1.id);

    console.log(`✅ Assigned users to businesses\n`);

    console.log(`✅ Assigned users to businesses\n`);

    console.log('🗑️ Deleting existing audit logs...');
    await prisma.auditLog.deleteMany({});
    console.log('✅ Deleted audit logs');

    console.log('🗑️ Deleting existing subscriptions...');
    await prisma.subscription.deleteMany({});
    console.log('✅ Deleted subscriptions\n');

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

    // 8.1 Create Problematic Subscriptions (for Subscription Issues feature)
    console.log('💳 Creating problematic subscriptions...');
    // Unpaid subscription (e.g., payment failed on renewal)
    await prisma.subscription.upsert({
      where: { id: '99999999-9999-9999-9999-999999999999' },
      update: {},
      create: {
        id: '99999999-9999-9999-9999-999999999999',
        businessId: business1.id,
        plan: 'professional',
        status: 'unpaid',
        currentPeriodEnd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        stripeSubscriptionId: 'sub_test_acme_unpaid',
        stripeCustomerId: 'cus_test_acme_123',
      },
    });
    // Incomplete subscription (e.g., payment method requires action)
    await prisma.subscription.upsert({
      where: { id: '00000000-0000-0000-0000-000000000000' },
      update: {},
      create: {
        id: '00000000-0000-0000-0000-000000000000',
        businessId: business2.id,
        plan: 'starter',
        status: 'incomplete',
        currentPeriodEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now (but incomplete)
        stripeSubscriptionId: 'sub_test_tech_incomplete',
        stripeCustomerId: 'cus_test_tech_123',
      },
    });
    // Incomplete_expired subscription (e.g., payment action not taken in time)
    await prisma.subscription.upsert({
      where: { id: '11111111-1111-1111-1111-111111111111' },
      update: {},
      create: {
        id: '11111111-1111-1111-1111-111111111111',
        businessId: business1.id,
        plan: 'basic',
        status: 'incomplete_expired',
        currentPeriodEnd: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        stripeSubscriptionId: 'sub_test_acme_incomplete_expired',
        stripeCustomerId: 'cus_test_acme_123',
      },
    });
    console.log(`✅ Created 3 problematic subscriptions\n`);

    // 8.2 Create Audit Logs for Problematic Subscriptions
    console.log('📝 Creating audit logs for problematic subscriptions...');

    // Audit log for unpaid subscription (Insufficient funds)
    await prisma.auditLog.create({
      data: {
        userId: user2.id, // Admin user
        action: 'subscription:issue_contacted',
        entityType: 'Subscription',
        entityId: '99999999-9999-9999-9999-999999999999', // Unpaid subscription
        details: {
          reason: 'Insufficient funds or exceeded credit limit',
          status: 'contacted',
          notes: 'Customer contacted regarding payment failure due to insufficient funds.',
        },
      },
    });

    // Audit log for incomplete subscription (Fraud suspicion)
    await prisma.auditLog.create({
      data: {
        userId: user2.id, // Admin user
        action: 'subscription:issue_contacted',
        entityType: 'Subscription',
        entityId: '00000000-0000-0000-0000-000000000000', // Incomplete subscription
            details: {
          reason: 'Fraud suspicion or security flags',
          status: 'contacted',
          notes: 'Payment flagged for potential fraud, customer notified for verification.',
        },
      },
    });

    // Audit log for incomplete_expired subscription (Technical or processing issues)
    await prisma.auditLog.create({
      data: {
        userId: user2.id, // Admin user
        action: 'subscription:issue_contacted',
        entityType: 'Subscription',
        entityId: '11111111-1111-1111-1111-111111111111', // Incomplete_expired subscription
            details: {
          reason: 'Technical or processing issues',
          status: 'contacted',
          notes: 'Payment failed due to a technical issue during processing. Retrying payment.',
        },
      },
    });

    console.log(`✅ Created 3 audit logs for problematic subscriptions\n`);

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
