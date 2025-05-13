import { Test, TestingModule } from '@nestjs/testing';
import { ChannelController } from 'src/modules/admin/channel/channel.controller';
import { ChannelService } from 'src/modules/admin/channel/channel.service';
import { CreateChannelDto } from 'src/modules/admin/channel/dto/create-channel.dto';
import { UpdateChannelDto } from 'src/modules/admin/channel/dto/update-channel.dto';
import { GetChannelDto } from 'src/modules/admin/channel/dto/get-channel.dto';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';
import { StrategyResolver } from 'src/modules/admin/channel/strategy/strategy';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { REQUEST } from '@nestjs/core';
import { ChannelType } from '@prisma/client';

describe('ChannelController', () => {
  let controller: ChannelController;
  let channelService: ChannelService;

  const mockChannelService = {
    create: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPrismaService = {
    channel: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockStrategyResolver = {
    resolve: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'test-user-id' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        {
          provide: ChannelService,
          useValue: mockChannelService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StrategyResolver,
          useValue: mockStrategyResolver,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ChannelController>(ChannelController);
    channelService = module.get<ChannelService>(ChannelService);
    jest.clearAllMocks();
  });

  describe('POST /admin/channel', () => {
    it('should create a channel', async () => {
      const createDto: CreateChannelDto = {
        name: 'Test Channel',
        type: ChannelType.TELEGRAM,
        configuration: {},
        accountId: 'acc-id',
      };
      const expectedResult = { id: 'chan-id', name: 'Test Channel' };

      mockChannelService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);
      expect(result).toEqual(expectedResult);
      expect(channelService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('POST /admin/channel/:id/connect', () => {
    it('should connect a channel', async () => {
      const channelId = 'chan-id';
      const expectedResult = {
        ok: true,
        result: true,
        description: 'Connected successfully',
      };

      mockChannelService.connect.mockResolvedValue(expectedResult);

      const result = await controller.connect(channelId);
      expect(result).toEqual(expectedResult);
      expect(channelService.connect).toHaveBeenCalledWith(channelId);
    });
  });

  describe('POST /admin/channel/:id/disconnect', () => {
    it('should disconnect a channel', async () => {
      const channelId = 'chan-id';
      const expectedResult = {
        ok: true,
        result: true,
        description: 'Disconnected successfully',
      };

      mockChannelService.disconnect.mockResolvedValue(expectedResult);

      const result = await controller.disconnect(channelId);
      expect(result).toEqual(expectedResult);
      expect(channelService.disconnect).toHaveBeenCalledWith(channelId);
    });
  });

  describe('GET /admin/channel', () => {
    it('should return paginated channels', async () => {
      const query = { page: 1, limit: 10, accountId: 'acc-id' };
      const expectedResult = {
        data: [{ id: 'chan1' }, { id: 'chan2' }],
        meta: { total: 2, page: 1, limit: 10 },
      };

      mockChannelService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.getChannels(query);
      expect(result).toEqual(expectedResult);
      expect(channelService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('GET /admin/channel/:id', () => {
    it('should return a single channel', async () => {
      const channelId = 'chan-id';
      const getChannelDto: GetChannelDto = { accountId: 'acc-id' };
      const expectedResult = { id: channelId, name: 'Test Channel' };

      mockChannelService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(channelId, getChannelDto);
      expect(result).toEqual(expectedResult);
      expect(channelService.findOne).toHaveBeenCalledWith(
        channelId,
        getChannelDto,
      );
    });
  });

  describe('PATCH /admin/channel/:id', () => {
    it('should update a channel', async () => {
      const channelId = 'chan-id';
      const updateDto: UpdateChannelDto = {
        name: 'Updated Channel',
        configuration: {},
      };
      const expectedResult = { id: channelId, ...updateDto };

      mockChannelService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(channelId, updateDto);
      expect(result).toEqual(expectedResult);
      expect(channelService.update).toHaveBeenCalledWith(channelId, updateDto);
    });
  });

  describe('DELETE /admin/channel/:id', () => {
    it('should delete a channel', async () => {
      const channelId = 'chan-id';
      const expectedResult = { status: true };

      mockChannelService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(channelId);
      expect(result).toEqual(expectedResult);
      expect(channelService.remove).toHaveBeenCalledWith(channelId);
    });
  });
});
