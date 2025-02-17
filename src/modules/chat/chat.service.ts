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
    try {
      const token = this.getTokenFromClient(client);
      if (!token) {
        throw new Error('Token not found');
      }
      const user = await this.verifyToken(token);
      if (!user) {
        throw new Error('Invalid or expired token');
      }
      return user;
    } catch (error) {
      console.log('error in extracting user from token: ', error);
      return null;
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
    try {
      return await this.jwtService.verifyAsync(parsedToken, {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      console.log('error in verifying token (invalid or expired): ', error);
      return null;
    }
  }

  async send(socketId: string, message: any): Promise<void> {
    if (!this.socketService.server) {
      throw new Error('Server is not initialized');
    }

    const socket = this.socketService.server.sockets.sockets.get(socketId);

    if (!socket) {
      console.log(`Socket with ID ${socketId} not found`);
      return;
    }

    socket.emit('message', JSON.stringify(message));
  }
}
