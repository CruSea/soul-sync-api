import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    await this.redisService.delete(email); // deletes if there is any that is previously set but left without being removed so that it sets a new one
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
