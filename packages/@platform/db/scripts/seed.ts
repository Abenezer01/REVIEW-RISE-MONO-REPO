import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

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
    const user1 = await prisma.user.upsert({
        where: { email: 'owner@example.com' },
        update: {},
        create: {
            email: 'owner@example.com',
            name: 'John Owner',
            phone: '+1-555-0101',
            status: 'active',
            emailVerified: new Date(),
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Jane Admin',
            phone: '+1-555-0102',
            status: 'active',
            emailVerified: new Date(),
        },
    });

    const user3 = await prisma.user.upsert({
        where: { email: 'manager@example.com' },
        update: {},
        create: {
            email: 'manager@example.com',
            name: 'Bob Manager',
            phone: '+1-555-0103',
            status: 'active',
            emailVerified: new Date(),
        },
    });

    console.log(`✅ Created 3 sample users\n`);

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
        where: { id: 'acme-downtown' },
        update: {},
        create: {
            id: 'acme-downtown',
            name: 'ACME Downtown',
            address: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US',
            phone: '+1-555-1001',
            status: 'active',
            businessId: business1.id,
        },
    });

    await prisma.location.upsert({
        where: { id: 'acme-uptown' },
        update: {},
        create: {
            id: 'acme-uptown',
            name: 'ACME Uptown',
            address: '456 Park Avenue',
            city: 'New York',
            state: 'NY',
            zipCode: '10021',
            country: 'US',
            phone: '+1-555-1002',
            status: 'active',
            businessId: business1.id,
        },
    });

    await prisma.location.upsert({
        where: { id: 'tech-cafe-main' },
        update: {},
        create: {
            id: 'tech-cafe-main',
            name: 'Tech Cafe Main',
            address: '789 Tech Boulevard',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'US',
            phone: '+1-555-2001',
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
        where: { id: 'sub-acme' },
        update: {},
        create: {
            id: 'sub-acme',
            businessId: business1.id,
            plan: 'professional',
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            stripeSubscriptionId: 'sub_test_acme_123',
            stripeCustomerId: 'cus_test_acme_123',
        },
    });

    await prisma.subscription.upsert({
        where: { id: 'sub-tech-cafe' },
        update: {},
        create: {
            id: 'sub-tech-cafe',
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
