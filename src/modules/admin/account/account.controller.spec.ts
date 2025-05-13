import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from 'src/modules/admin/account/account.controller';
import { AccountService } from 'src/modules/admin/account/account.service';
import { CreateAccountDto } from 'src/modules/admin/account/dto/create-account.dto';
import { UpdateAccountDto } from 'src/modules/admin/account/dto/update-account.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { PrismaService } from 'src/modules/prisma/prisma.service';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: AccountService;

  const mockAccountService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    account: {
      findFirst: jest.fn(),
    },
  };

  const mockRequest = {
    user: { id: 'test-user-id' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: mockAccountService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'REQUEST',
          useValue: mockRequest,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get<AccountService>(AccountService);
    jest.clearAllMocks();
  });

  describe('POST /admin/account', () => {
    it('should create an account', async () => {
      const createDto: CreateAccountDto = {
        name: 'Test Account',
        domain: null,
      };
      const expectedResult = { id: 'acc-id', name: 'Test Account' };

      mockAccountService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(accountService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('GET /admin/account', () => {
    it('should return paginated accounts', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [{ id: 'acc1' }, { id: 'acc2' }],
        meta: { total: 2, page: 1, limit: 10 },
      };

      mockAccountService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(paginationDto);
      expect(result).toEqual(expectedResult);
      expect(accountService.findAll).toHaveBeenCalledWith(paginationDto);
    });
  });

  describe('GET /admin/account/:id', () => {
    it('should return a single account', async () => {
      const accountId = 'acc-id';
      const expectedResult = { id: accountId, name: 'Test Account' };

      mockAccountService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(accountId);
      expect(result).toEqual(expectedResult);
      expect(accountService.findOne).toHaveBeenCalledWith(accountId);
    });
  });

  describe('PATCH /admin/account/:id', () => {
    it('should update an account', async () => {
      const accountId = 'acc-id';
      const updateDto: UpdateAccountDto = { name: 'Updated Name' };
      const expectedResult = { id: accountId, ...updateDto };

      mockAccountService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(accountId, updateDto);
      expect(result).toEqual(expectedResult);
      expect(accountService.update).toHaveBeenCalledWith(accountId, updateDto);
    });
  });

  describe('DELETE /admin/account/:id', () => {
    it('should delete an account', async () => {
      const accountId = 'acc-id';
      const expectedResult = { message: 'Account deleted successfully' };

      mockAccountService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(accountId);
      expect(result).toEqual(expectedResult);
      expect(accountService.remove).toHaveBeenCalledWith(accountId);
    });
  });
});
