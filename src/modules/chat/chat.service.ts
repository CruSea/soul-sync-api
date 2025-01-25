import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatService {
  private server: Server;
  constructor(
    private chatGateway: ChatGateway,
    private readonly jwtService: JwtService,
  ) {
    this.server = this.chatGateway.server;
  }

  async getUserFromToken(client: any) {
    const token = this.getTokenFromClient(client);
    const user = await this.verifyToken(token);
    return user;
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
    try {
      return await this.jwtService.verifyAsync(parsedToken, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      throw error;
    }
  }

  async send(socketId: string, message: any): Promise<void> {
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
