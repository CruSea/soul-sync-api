import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { AuthGuard } from '../../auth/guard/auth/auth.guard';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: MessageService;

  const mockMessageService = {
    getAllMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MessageController>(MessageController);
    messageService = module.get<MessageService>(MessageService);
    jest.clearAllMocks();
  });

  describe('GET /admin/messages', () => {
    it('should return paginated messages for an account', async () => {
      const accountId = 'test-account-id';
      const query = { page: '1', limit: '10' };

      const expectedResult = {
        data: [
          {
            id: 'msg1',
            content: 'Hello',
            name: 'Channel A',
            platform: 'WHATSAPP',
          },
          {
            id: 'msg2',
            content: 'Hi',
            name: 'Channel B',
            platform: 'TELEGRAM',
          },
        ],
        meta: { total: 2, page: 1, limit: 10 },
      };

      mockMessageService.getAllMessages.mockResolvedValue(expectedResult);

      const result = await controller.getAllMessages(accountId, query);
      expect(result).toEqual(expectedResult);
      expect(messageService.getAllMessages).toHaveBeenCalledWith(
        accountId,
        query,
      );
    });

    it('should throw error if accountId is missing', async () => {
      mockMessageService.getAllMessages.mockImplementation(() => {
        throw new Error('Account ID is required');
      });

      await expect(
        controller.getAllMessages(undefined as any, {}),
      ).rejects.toThrow('Account ID is required');

      expect(messageService.getAllMessages).toHaveBeenCalled();
    });
  });
});
