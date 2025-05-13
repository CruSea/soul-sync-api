import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from 'src/modules/chat/chat.gateway';
import { ChatExchangeService } from 'src/common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { SocketService } from 'src/modules/chat/socket.service';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatExchangeService: ChatExchangeService;
  let rabbitmqService: RabbitmqService;
  let chatService: ChatService;

  const mockClient: any = {
    id: '123',
    handshake: {
      auth: {
        token: 'Bearer valid-token',
      },
    },
    disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn().mockResolvedValue({ sub: 'user-id' }),
          },
        },
        {
          provide: ChatExchangeService,
          useValue: { send: jest.fn() },
        },
        {
          provide: RabbitmqService,
          useValue: { getChatEchangeData: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: ChatService,
          useValue: {
            getUserFromToken: jest.fn().mockResolvedValue({
              email: 'test@example.com',
            }),
          },
        },
        {
          provide: SocketService,
          useValue: {
            server: {
              sockets: {
                sockets: new Map(),
              },
            },
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    rabbitmqService = module.get<RabbitmqService>(RabbitmqService);
    chatExchangeService = module.get<ChatExchangeService>(ChatExchangeService);

    // Set gateway.server
    const socketService = module.get<SocketService>(SocketService);
    gateway.server = socketService.server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should add client to connectedClients map', async () => {
      await gateway.handleConnection(mockClient);
      expect(gateway['connectedClients'].get('test@example.com')).toBe('123');
    });

    it('should disconnect client if user is not found', async () => {
      jest.spyOn(chatService, 'getUserFromToken').mockResolvedValueOnce(null);
      await gateway.handleConnection(mockClient);
      expect(mockClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove client from connectedClients map', async () => {
      gateway['connectedClients'].set('test@example.com', '123');
      await gateway.handleDisconnect(mockClient);
      expect(gateway['connectedClients'].has('test@example.com')).toBe(false);
    });
  });

  describe('handleMessage', () => {
    it('should call RabbitmqService and ChatExchangeService when type is CHAT', async () => {
      const chatData = {
        type: 'CHAT',
        conversationId: '1',
        body: 'Hello',
        createdAt: new Date().toISOString(),
        email: 'test@example.com',
      };

      const message = JSON.stringify(chatData);

      const result = await gateway.handleMessage(message);
      expect(rabbitmqService.getChatEchangeData).toHaveBeenCalled();
      expect(chatExchangeService.send).toHaveBeenCalledWith('chat', {});
      expect(result).toBe('AKC');
    });

    it('should throw NotFoundException for invalid data', async () => {
      await expect(gateway.handleMessage('not-json')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('handleChat', () => {
    it('should emit message to the correct socket', async () => {
      const mockSocket = {
        emit: jest.fn(),
      };

      const data = {
        email: 'test@example.com',
        conversationId: '1',
        body: 'Hi',
        type: 'CHAT',
        createdAt: new Date().toISOString(),
      };

      gateway['connectedClients'].set(data.email, 'socket-id');
      gateway.server.sockets.sockets.set('socket-id', mockSocket as any);

      const result = await gateway.handleChat(JSON.stringify(data));
      expect(mockSocket.emit).toHaveBeenCalledWith('message', {
        conversationId: '1',
        type: 'CHAT',
        body: 'Hi',
        createdAt: data.createdAt,
      });
      expect(result).toBe('AKG');
    });

    it('should throw NotFoundException if socket is not found', async () => {
      const data = {
        email: 'test@example.com',
        conversationId: '1',
        body: 'Hi',
        type: 'CHAT',
        createdAt: new Date().toISOString(),
      };

      gateway['connectedClients'].set(data.email, 'invalid-socket-id');

      await expect(gateway.handleChat(JSON.stringify(data))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
