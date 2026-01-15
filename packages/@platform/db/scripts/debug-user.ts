
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true
        }
      },
      userBusinessRoles: {
        include: {
          role: true,
          business: true
        }
      }
    }
  });

  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.id);
    console.log('User Roles (System):', JSON.stringify(user.userRoles, null, 2));
    console.log('User Business Roles:', JSON.stringify(user.userBusinessRoles, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
