import { NotFoundException, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
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
import { RedisService } from 'src/common/redis/redis.service';
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

  constructor(
    private readonly chatExchangeService: ChatExchangeService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly chatService: ChatService,
    private readonly reddisService: RedisService,
    private readonly socketService: SocketService,
  ) {}

  afterInit(server: any) {
    this.socketService.server = server;
    console.log('ChatGateway Initialized', server);
    server.on('disconnect', (socket) => {
      this.handleDisconnect(socket);
    });
  }

  async handleConnection(client: any) {
    try {
      const user = await this.chatService.getUserFromToken(client);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // Remove any existing socket ID for the user
      await this.reddisService.delete(user.email);
      // Store the new socket ID
      await this.reddisService.set(user.email, client.id);
      console.log('Client connected:', client.id);
    } catch (error) {
      console.log('error in handle connection', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: any) {
    const user = await this.chatService.getUserFromToken(client);
    if (user) {
      await this.reddisService.delete(user.email);
    }
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('message')
  @UseGuards(WsGuardGuard)  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: any,
  ): Promise<string> {
    try {
      const chatData: Chat = JSON.parse(data);
      console.log('client is : ', client.id);
      if (chatData.type === 'CHAT') {
        const data = this.rabbitmqService.getChatEchangeData(chatData);
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
      const chatData = typeof(data) ? data : JSON.parse(data);
      console.log('Received Internal Chat Data:', chatData);
      const socket = this.server.sockets.sockets.get(chatData.socketId);
      if (!socket) {
        throw new NotFoundException('Socket not found');
      }
      socket.emit('message', chatData.message);
      console.log('Message Sent: ', chatData.message);
      return 'AKG';
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Invalid Chat Data');
    }
  }
}
