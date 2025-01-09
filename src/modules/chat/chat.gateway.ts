import {
  forwardRef,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
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
import { MentorChatService } from 'src/common/rabbitmq/consumers/chat-exchange/mentor-chat.service';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

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
    @Inject(forwardRef(() => RabbitmqService))
    private readonly rabbitmqService: RabbitmqService,
    private readonly mentorChatService: MentorChatService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: any) {
    console.log('ChatGateway Initialized', server);
  }

  @UseGuards(WsGuardGuard)
  async handleConnection(client: any) {
    try {
      console.log('Client connected:', client.id);
      const token = client.handshake.headers.authorization.split(' ')[1];
      const userId = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
      console.log('User ID:', userId);
      await this.chatService.setClient(client.id, userId);
      this.mentorChatService.consume(client.id);
    } catch (error) {
      console.error('Error handling client connection:', error);
    }
  }

  @UseGuards(WsGuardGuard)
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
    this.chatService.removeClient(client.id);
  }

  @SubscribeMessage('message')
  @UseGuards(WsGuardGuard)
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: any,
  ): Promise<string> {
    try {
      const chatData: Chat = JSON.parse(data);
      if (chatData.type === 'CHAT') {
        const chatExchangeData = this.rabbitmqService.getChatEchangeData(
          chatData,
          client.id,
        );
        this.chatExchangeService.send('chat', chatExchangeData);
        return 'ACK';
      } else {
        throw new NotFoundException('Invalid chat data');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }
}
