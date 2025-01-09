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
  ) {}

  afterInit(server: any) {
    console.log('ChatGateway Initialized', server);
  }

  handleConnection(client: any) {
    console.log('Client connected:', client);
  }

  handleDisconnect(client: any) {
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
        const data = this.rabbitmqService.getChatEchangeData(chatData, client.id);
        this.chatExchangeService.send('chat', data);
        return 'AKC';
      }
    } catch (e) {
      console.log(e);
      throw new NotFoundException('Invalid Chat Data');
    }
  }
}
