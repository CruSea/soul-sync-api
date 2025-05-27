import { Test, TestingModule } from '@nestjs/testing';
import { MentorService } from './mentor.service';
import { prismaService } from '../../../../test/setupTests.e2e';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleType } from '@prisma/client';
import { REQUEST } from '@nestjs/core';
import { CreateMentorDto } from './dto/create-mentor.dto';
import { UpdateMentorDto } from './dto/update-mentor.dto';
import { NotFoundException } from '@nestjs/common';

describe('MentorService (Integration)', () => {
  let service: MentorService;

  const mockRequest = {
    user: {
      id: 'mock-user-id',
      accountId: 'mock-account-id',
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        { provide: REQUEST, useValue: mockRequest },
      ],
    }).compile();

    service = module.get<MentorService>(MentorService);

    await prismaService.role.create({
      data: {
        name: 'Mentor',
        type: RoleType.MENTOR,
        isDefault: true,
      },
    });
  });

  afterEach(async () => {
    await prismaService.accountUser.deleteMany();
    await prismaService.mentor.deleteMany();
    await prismaService.user.deleteMany();
  });

  it('should create a mentor with a default role', async () => {
    const account = await prismaService.account.create({
      data: {
        name: 'Test Account',
      },
    });

    const result = await service.create({
      name: 'Bikila Ketema',
      email: 'test@mentor.com',
      accountId: account.id,
    });

    expect(result.email).toBe('test@mentor.com');
    expect(result.user).toBeDefined();

    const accountUser = await prismaService.accountUser.findFirst({
      where: { userId: result.user.id },
      include: { Role: true },
    });

    expect(accountUser?.Role?.type).toBe(RoleType.MENTOR);
  });

  it('should find a mentor by id with the associated user', async () => {
    const account = await prismaService.account.create({
      data: {
        name: 'FindOne Test Account',
      },
    });

    const user = await prismaService.user.create({
      data: {
        name: 'Test Mentor',
        email: 'findone@mentor.com',
        password: '',
      },
    });

    const mentor = await prismaService.mentor.create({
      data: {
        name: 'Test Mentor',
        email: 'findone@mentor.com',
        accountId: account.id,
      },
    });

    const result = await service.findOne(mentor.id, { accountId: account.id });

    expect(result).toBeDefined();
    expect(result.id).toBe(mentor.id);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(user.email);
  });

  it('should return a paginated list of mentors for the given accountId', async () => {
    const account = await prismaService.account.create({
      data: { name: 'FindAll Account' },
    });

    for (let i = 1; i <= 5; i++) {
      await prismaService.mentor.create({
        data: {
          name: `Mentor ${i}`,
          email: `mentor${i}@test.com`,
          accountId: account.id,
        },
      });
    }

    const result = await service.findAll({
      accountId: account.id,
      page: 1,
      limit: 3,
    });

    expect(result).toBeDefined();
    expect(result.data.length).toBeLessThanOrEqual(3);
    expect(result.meta.total).toBeGreaterThanOrEqual(5);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(3);
  });

  it('should update a mentor successfully', async () => {
    const account = await prismaService.account.create({
      data: {
        name: 'FindOne Test Account',
      },
    });

    const createMentorDto: CreateMentorDto = {
      name: 'John Doe',
      email: 'johndoe@test.com',
      accountId: account.id,
    };

    const createdMentor = await service.create(createMentorDto);

    const updateMentorDto: UpdateMentorDto = {
      name: 'John Updated',
      email: 'johnupdated@test.com',
      availability: JSON.stringify(['Monday', 'Wednesday']),
    };

    const updatedMentor = await service.update(
      createdMentor.id,
      updateMentorDto,
    );

    expect(updatedMentor).toBeDefined();
    expect(updatedMentor.name).toBe(updateMentorDto.name);
    expect(updatedMentor.email).toBe(updateMentorDto.email);
    expect(updatedMentor.availability).toEqual(
      JSON.parse(updateMentorDto.availability),
    );
  });

  it('should throw an error if mentor is not found', async () => {
    const updateMentorDto: UpdateMentorDto = {
      name: 'Non-Existent Mentor',
      email: 'nonexistent@test.com',
      availability: JSON.stringify(['Monday']),
    };

    try {
      await service.update('nonexistent-id', updateMentorDto);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('Mentor not found');
    }
  });

  it('should delete a mentor successfully', async () => {
    const account = await prismaService.account.create({
      data: {
        name: 'FindOne Test Account',
      },
    });

    const createMentorDto: CreateMentorDto = {
      name: 'John Doe',
      email: 'johndoe@test.com',
      accountId: account.id,
    };

    const createdMentor = await service.create(createMentorDto);

    const deletedResponse = await service.delete(createdMentor.id);

    expect(deletedResponse.status).toBe(true);

    const deletedMentor = await prismaService.mentor.findUnique({
      where: { id: createdMentor.id },
    });

    expect(deletedMentor.deletedAt).toBeDefined();
  });
});
