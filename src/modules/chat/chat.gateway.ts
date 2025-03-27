import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsGuardGuard } from '../auth/guard/ws-guard/ws-guard.guard';
import { ChatExchangeService } from 'src/common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { ChatService } from './chat.service';
import { SocketService } from './socket.service';

@WebSocketGateway(Number(process.env.CHAT_PORT), {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;
  private connectedClients = new Map<string, string>();

  constructor(
    private readonly chatExchangeService: ChatExchangeService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly chatService: ChatService,
    private readonly socketService: SocketService,
  ) {}

  afterInit(server: any) {
    this.socketService.server = server;
    console.log('ChatGateway Initialized', server);
  }

  async handleConnection(client: any) {
    try {
      const user = await this.chatService.getUserFromToken(client);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.connectedClients.set(user.email, client.id);
      console.log('Client connected:', client.id);
    } catch (error) {
      console.log('error in handle connection', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: any) {
    const user = await this.chatService.getUserFromToken(client);
    if (user) {
      await this.connectedClients.delete(user.email);
    }
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  @UseGuards(WsGuardGuard)
  async handleMessage(@MessageBody() data: string): Promise<string> {
    try {
      const chatData: Chat = JSON.parse(data);
      if (chatData.type === 'CHAT') {
        const data = await this.rabbitmqService.getChatEchangeData(chatData);
        console.log('data', data);
        await this.chatExchangeService.send('chat', data);
        return 'AKC';
      }
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Invalid Chat Data');
    }
  }

  @SubscribeMessage('internal')
  async handleChat(@MessageBody() data: string): Promise<string> {
    try {
      const chatData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Received Internal Chat Data:', chatData);
      const socketId = this.connectedClients.get(chatData.email);
      const socket = this.server.sockets.sockets.get(socketId);
      if (!socket) {
        throw new NotFoundException('Socket not found');
      }
      const chat = {
        conversationId: chatData.conversationId,
        type: chatData.type,
        body: chatData.body,
        createdAt: chatData.createdAt,
      };
      socket.emit('message', chat);
      console.log('Message Sent: ', chat);
      return 'AKG';
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Invalid Chat Data');
    }
  }
}
