import { UseGuards } from '@nestjs/common';
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

@UseGuards(WsGuardGuard)
@WebSocketGateway(3002, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
  },
})
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatExchangeService: ChatExchangeService) {}

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
  handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: any,
  ): string {
    console.log('Message client:', client.user);
    this.chatExchangeService.send('message', data);
    return 'AKC';
  }
}
