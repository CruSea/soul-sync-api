import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';
import { Server } from 'socket.io';
import { ChatGateway } from './chat.gateway'; // Import the gateway for access to the server

@Injectable()
export class ChatService {
  private server: Server;

  constructor(
    private redis: RedisService,
    private chatGateway: ChatGateway, 
  ) {
    this.server = this.chatGateway.server; 
  }

  async setClient(clientId: string, userId: string) {
    await this.redis.set(clientId, userId);
  }

  async removeClient(clientId: string) {
    await this.redis.delete(clientId);
  }

  async send(socketId: string, message: string) {
    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      throw new NotFoundException(`Socket with ID ${socketId} not found`);
    }

    socket.emit('message', message);
  }
}
