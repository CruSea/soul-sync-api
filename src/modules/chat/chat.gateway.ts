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
  }

  async handleConnection(client: any) {
    const user = await this.chatService.getUserFromToken(client);
    await this.reddisService.set(user.email, client.id);
    console.log('Client connected:', client);
  }

  async handleDisconnect(client: any) {
    const user = await this.chatService.getUserFromToken(client);
    await this.reddisService.delete(user.email);
    console.log('Client disconnected:', client);
  }

  @SubscribeMessage('message')
  @UseGuards(WsGuardGuard)
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: any,
  ): string {
    try {
      const chatData: Chat = JSON.parse(data);
      if (chatData.type === 'CHAT') {
        const data = this.rabbitmqService.getChatEchangeData(chatData, client);
        this.chatExchangeService.send('chat', data);
        return 'AKC';
      }
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Invalid Chat Data');
    }
  }
}
