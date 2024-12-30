import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const options: JwtVerifyOptions = {
        secret: process.env.JWT_SECRET,
        ignoreExpiration: false,
      };

      const user = await this.jwtService.verifyAsync(token, options);

      request.user = user;
      return true;
    } catch (error) {
      console.error(`AuthGuard Error: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
