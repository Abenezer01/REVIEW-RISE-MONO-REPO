import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const business = await prisma.business.findUnique({
        where: { slug: 'acme-restaurant' },
    });
    if (business) {
        console.log(`BUSINESS_ID:${business.id}`);
    } else {
        console.log('BUSINESS_NOT_FOUND');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
