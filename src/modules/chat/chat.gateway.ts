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
import { Server, Socket as BaseSocket } from 'socket.io';

interface Socket extends BaseSocket {
  user?: any;
}
import { WsGuardGuard } from '../auth/guard/ws-guard/ws-guard.guard';
import { ChatExchangeService } from'src/common/rabbitmq/chat-exchange/chat-exchange.service';
import { RabbitmqService } from'src/common/rabbitmq/rabbitmq.service';
import { Chat } from'src/types/chat';
import { MentorChatService } from'src/common/rabbitmq/consumers/chat-exchange/mentor-chat.service';
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

  async handleConnection(client: Socket) {
    try {
      const token = this.getTokenFromClient(client);
      const user = await this.verifyToken(token);
      await this.chatService.setSocket(user.email, client.id);
      console.log('User connected: ', user.email, " id: ", client.id);
    } catch (error) {
      console.error('Error handling client connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = this.getUserFromClient(client);
    if (user) {
      await this.chatService.removeSocket(user.email);
    }
    console.log('User disconnected: ', user.email, ' id: ', client.id);
  }

  @SubscribeMessage('message')
  @UseGuards(WsGuardGuard)
  async handleMessage(
    @MessageBody() data: string,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    try {
      const chatData = JSON.parse(data) as Chat;
      if (chatData.type === 'CHAT') {
        const chatExchangeData = this.rabbitmqService.getChatEchangeData(
          chatData,
          client.id,
        );
        await this.chatExchangeService.send('chat', chatExchangeData);
        return 'ACK';
      } else {
        throw new NotFoundException('Invalid chat data');
      }
    } catch (error) {
      console.error('Error handling message:', error);
      return 'ERROR';
    }
  }

  private getTokenFromClient(client: Socket): string {
    return (
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      client.handshake?.query?.token
    );
  }

  private async verifyToken(token: string): Promise<any> {
    const parsedToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    return this.jwtService.verifyAsync(parsedToken, {
      secret: process.env.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  private getUserFromClient(client: Socket): any {
    return client.user;
  }
}
