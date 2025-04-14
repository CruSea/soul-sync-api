import { Test, TestingModule } from '@nestjs/testing';
import { MentorService } from './mentor.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { postgresClient, prismaService } from '../../../../test/setupTests.e2e';

describe('MentorService', () => {
  let service: MentorService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MentorService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .compile();
    service = module.get<MentorService>(MentorService);
  });

  it('should create a mentor', async () => {
    // Start a transaction
    await postgresClient.query('BEGIN');
    try {
      // Perform the create operation
      const createResult = await service.create({
        email: 'test@gmail.com',
        accountId: '12dse3ded8y3di3d3d',
        name: 'Bikila Ketema',
      });
      // Commit the transaction
      await postgresClient.query('COMMIT');
      // Query the database for the newly created car
      const result = await postgresClient.query(
        'SELECT * FROM "public"."Mentor"',
      );
      // Log the results
      console.log(result.rows);
      // Assert the create result
      expect(createResult).toEqual({
        id: 1,
        email: 'test@gmail.com',
        accountId: '12dse3ded8y3di3d3d',
        name: 'Bikila Ketema',
      });
    } catch (error) {
      // Rollback the transaction in case of an error
      await postgresClient.query('ROLLBACK');
      throw error;
    }
  });
});
