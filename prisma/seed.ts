import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      {
        name: 'Owner',
        type: RoleType.OWNER,
        isDefault: true,
      },
      {
        name: 'Admin',
        type: RoleType.ADMIN,
        isDefault: true,
      },
      {
        name: 'Mentor',
        type: RoleType.MENTOR,
        isDefault: true,
      },
      {
        name: 'Mentee',
        type: RoleType.MENTEE,
        isDefault: true,
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
