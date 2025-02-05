import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private server: Server;

  constructor(private chatGateway: ChatGateway) {
    this.server = this.chatGateway.server;
  }

  async send(socketId: string, message: any): Promise<void> {
    if (!this.server) {
      throw new Error('Server is not initialized');
    }

    const socket = this.server.sockets.sockets.get(socketId);

    if (!socket) {
      throw new Error(`Socket with ID ${socketId} not found`);
      return;
    }

    socket.emit('message', JSON.stringify(message));
  }
}
