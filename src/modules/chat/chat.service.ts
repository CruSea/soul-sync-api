import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { Server } from 'socket.io';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private server: Server;

  constructor(
    private redisService: RedisService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {
    this.server = this.chatGateway.server;
  }

  async setSocket(email: string, clientId: string) {
    await this.removeSocket(email);
    await this.redisService.set(email, clientId);
    await this.redisService.set(clientId, email);
  }

  async removeSocket(key: string) {
    await this.redisService.delete(await this.redisService.get(key));
    await this.redisService.delete(key);
  }

  setServer(server: Server) {
    this.server = server;
  }

  async send(socketId: string, message: any) {
    if (!this.server) {
      throw new Error('Server is not initialized');
    }

    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      throw new Error(`Socket with ID ${socketId} not found`);
    }

    socket.emit('message', JSON.stringify(message));
  }
}
