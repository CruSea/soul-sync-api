import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/modules/admin/user/user.controller';
import { UserService } from 'src/modules/admin/user/user.service';
import { CreateUserDto } from 'src/modules/admin/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/admin/user/dto/update-user.dto';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { Reflector } from '@nestjs/core';

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

jest.mock('src/modules/auth/auth.decorator', () => ({
  Roles: () => () => {},
}));

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn().mockResolvedValue({}),
      findAllUsers: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      updateUser: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword',
        accountId: 'mockAccountId',
        roleId: 'mockRoleId',
      };
      const result = await controller.create(dto);
      expect(result).toEqual({});
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all users for an account', async () => {
      const result = await controller.findAll('mockAccountId');
      expect(result).toEqual([]);
      expect(service.findAllUsers).toHaveBeenCalledWith('mockAccountId');
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const result = await controller.findOne('mockAccountId', 'mockUserId');
      expect(result).toEqual({});
      expect(service.findOne).toHaveBeenCalledWith(
        'mockAccountId',
        'mockUserId',
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'updatedPassword',
      };
      const result = await controller.update(
        'mockAccountId',
        'mockUserId',
        updateDto,
      );
      expect(result).toEqual({});
      expect(service.updateUser).toHaveBeenCalledWith(
        'mockAccountId',
        'mockUserId',
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      const result = await controller.remove('mockAccountId', 'mockUserId');
      expect(result).toEqual({});
      expect(service.remove).toHaveBeenCalledWith(
        'mockAccountId',
        'mockUserId',
      );
    });
  });
});
