import { AccountService } from './account.service';
import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { RoleType } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as paginationHelper from 'src/common/helpers/pagination';

describe('AccountService', () => {
  let service: AccountService;

  const mockRequest = {
    user: { id: 'test-user-id' },
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
    account: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    accountUser: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrismaService.$transaction.mockImplementation(async (arg) => {
      if (typeof arg === 'function') {
        return arg(mockPrismaService);
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      throw new Error('Unsupported argument to $transaction');
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: REQUEST, useValue: mockRequest },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  describe('create()', () => {
    it('should create an account with default owner role', async () => {
      const createDto = { name: 'Test Account', domain: null };
      const role = { id: 'role-id', type: RoleType.OWNER, isDefault: true };
      const createdAccount = { id: 'acc-id', name: 'Test Account' };

      mockPrismaService.$transaction.mockImplementation(async (arg) => {
        if (typeof arg === 'function') {
          return arg(mockPrismaService);
        }
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        throw new Error('Unsupported argument to $transaction');
      });

      mockPrismaService.role.findFirst.mockResolvedValue(role);
      mockPrismaService.account.create.mockResolvedValue(createdAccount);

      const result = await service.create(createDto);
      expect(result).toEqual(createdAccount);
    });

    it('should throw error if default owner role is not found', async () => {
      mockPrismaService.role.findFirst.mockResolvedValue(null);

      await expect(service.create({ name: 'X', domain: null })).rejects.toThrow(
        'Default owner role not found',
      );
    });
  });

  describe('findAll()', () => {
    it('should return paginated accounts for the user', async () => {
      const mockPagination: PaginationDto = { page: 1, limit: 10 };
      const mockPaginateResult = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };

      jest
        .spyOn(paginationHelper, 'paginate')
        .mockResolvedValue(mockPaginateResult);

      const result = await service.findAll(mockPagination);
      expect(result.meta).toHaveProperty('page', 1);
      expect(result.meta).toHaveProperty('limit', 10);
    });
  });

  describe('findOne()', () => {
    it('should return an account if it exists and belongs to the user', async () => {
      const mockAccount = { id: 'acc-id', name: 'Test Account' };

      mockPrismaService.account.findFirst.mockResolvedValue(mockAccount);
      const result = await service.findOne('acc-id');

      expect(result).toEqual(mockAccount);
    });

    it('should throw error if account is not found', async () => {
      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        'Account not found',
      );
    });
  });

  describe('update()', () => {
    it('should update and return the account', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedAccount = { id: 'acc-id', name: 'Updated Name' };

      mockPrismaService.account.findFirst.mockResolvedValue(updatedAccount);
      mockPrismaService.account.update.mockResolvedValue(updatedAccount);

      const result = await service.update('acc-id', updateDto);

      expect(result).toEqual(updatedAccount);
    });

    it('should throw error if account is not found', async () => {
      mockPrismaService.account.findFirst.mockResolvedValue(null);

      await expect(
        service.update('invalid-id', { name: 'Updated Name' }),
      ).rejects.toThrow('Account not found');
    });
  });

  describe('remove()', () => {
    it('should delete the account and return a success message', async () => {
      const accountId = 'acc-id';
      const account = { id: accountId, deletedAt: null };

      mockPrismaService.account.findUnique.mockResolvedValue(account);
      mockPrismaService.account.update.mockResolvedValue({
        ...account,
        deletedAt: new Date(),
      });
      mockPrismaService.accountUser.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.remove(accountId);

      expect(result).toEqual({ message: 'Account deleted successfully' });
      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        expect.any(Object),
        expect.any(Object),
      ]);
    });
  });

  it('should throw error if account is not found', async () => {
    mockPrismaService.account.findUnique.mockResolvedValue(null);

    await expect(service.remove('invalid-id')).rejects.toThrow(
      'Account not found',
    );
  });

  it('should return a message if the account is already deleted', async () => {
    const accountId = 'acc-id';
    const account = { id: accountId, deletedAt: new Date() };

    mockPrismaService.account.findUnique.mockResolvedValue(account);

    const result = await service.remove(accountId);

    expect(result).toEqual({ message: 'Account is already deleted' });
  });
});
