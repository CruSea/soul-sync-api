import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { Server } from 'socket.io';
import { ChatGateway } from './chat.gateway'; // Import the gateway for access to the server

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
    await this.redisService.delete(email);
    await this.redisService.set(email, clientId);
  }

  async removeSocket(clientId: string) {
    await this.redisService.delete(clientId);
  }

  async send(socketId: string, message: string) {
    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      throw new NotFoundException(`Socket with ID ${socketId} not found`);
    }

    socket.emit('message', message);
  }
}
