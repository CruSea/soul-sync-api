import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      {
        name: 'OWNER',
        type: RoleType.OWNER,
        isDefault: true,
        createdAt: new Date(),
      },
      {
        name: 'ADMIN',
        type: RoleType.ADMIN,
        isDefault: true,
        createdAt: new Date(),
      },
      {
        name: 'MENTOR',
        type: RoleType.MENTOR,
        isDefault: true,
        createdAt: new Date(),
      },
      {
        name: 'MENTEE',
        type: RoleType.MENTEE,
        isDefault: true,
        createdAt: new Date(),
      },
    ],
    skipDuplicates: true, // Prevent duplicate seeding
  });
  console.log('Roles seeded!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
