import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { SocketService } from './socket.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
  ) {}

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
    if (!this.socketService.server) {
      throw new Error('Server is not initialized');
    }

    const socket = this.socketService.server.sockets.sockets.get(socketId);

    if (!socket) {
      throw new Error(`Socket with ID ${socketId} not found`);
    }

    socket.emit('message', JSON.stringify(message));
  }
}
