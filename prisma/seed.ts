import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'owner', isDefault: false },
      { name: 'mentor', isDefault: false },
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
