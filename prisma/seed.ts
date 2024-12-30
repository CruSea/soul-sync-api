import { PrismaClient, RoleType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedBatchOne() {
  console.log('seedBatchOne');
  await prisma.role.createMany({
    data: [
      {
        name: 'Owner',
        type: RoleType.OWNER,
        isDefault: true,
      },
      {
        name: 'Mentor',
        type: RoleType.MENTOR,
        isDefault: true,
      },
    ],
    skipDuplicates: true, // Prevent duplicate seeding
  });
}

async function seedBatchTwo() {
  console.log('seedBatchTwo');
  const OwnerRole = await prisma.role.findFirst({
    where: { type: RoleType.OWNER },
  });
  const password = await bcrypt.hash('Password123#', 10);
  await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          password: password,
          imageUrl: faker.image.avatar(),
          AccountUser: {
            create: Array.from({ length: 3 }).map(() => ({
              Account: {
                create: {
                  name: faker.company.name(),
                  Channel: {
                    create: Array.from({
                      length: faker.number.int({ min: 1, max: 5 }),
                    }).map(() => ({
                      name: faker.company.name(),
                      metadata: { data: faker.lorem.paragraph() },
                      configuration: { data: faker.lorem.paragraph() },
                      Messages: {
                        create: Array.from({
                          length: faker.number.int({ min: 5, max: 50 }),
                        }).map(() => ({
                          address: faker.phone.number(),
                          type: faker.helpers.arrayElement([
                            'SENT',
                            'RECEIVED',
                          ]),
                          body: faker.lorem.sentence(),
                        })),
                      },
                    })),
                  },
                  Mentor: {
                    create: Array.from({ length: 10 }).map(() => {
                      const mentor = {
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
                      };
                      return mentor;
                    }),
                  },
                },
              },
              Role: { connect: { id: OwnerRole.id } },
            })),
          },
        },
      });
    }),
  );
}

async function seedBatchThree() {
  console.log('seedBatchThree');
  const MentorRole = await prisma.role.findFirst({
    where: { type: RoleType.MENTOR },
  });

  await (
    await prisma.mentor.findMany({})
  ).forEach(async (mentor) => {
    await prisma.user.create({
      data: {
        email: mentor.email,
        name: mentor.name,
        password: await bcrypt.hash('Password123#', 10),
        AccountUser: {
          create: {
            accountId: mentor.accountId,
            roleId: MentorRole.id,
          },
        },
      },
    });
  });
}

async function main() {
  await seedBatchOne();
  await seedBatchTwo();
  await seedBatchThree();
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
