import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsGuardGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = this.getTokenFromHandshake(client);
    try {
      const options: JwtVerifyOptions = {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      };
      const user = await this.jwtService.verifyAsync(token, options);
      client.user = user;
      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  private getTokenFromHandshake(client: any): string {
    const token =
      client.handshake?.auth?.token ||
      client.handshake?.headers?.authorization ||
      client.handshake?.query?.token;
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }
    return token.startsWith('Bearer ') ? token.slice(7) : token;
  }
}
