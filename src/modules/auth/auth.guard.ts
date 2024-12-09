import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // Attach user info to request
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

/*************  ✨ Codeium Command ⭐  *************/
/******  208ac29b-31ed-4248-8d38-ab0664eb5759  *******/
  private extractTokenFromHeader(request: any): string | undefined {
    const authorizationHeader = request.headers['authorization'];
    if (authorizationHeader?.startsWith('Bearer ')) {
      return authorizationHeader.split(' ')[1];
    }
    return undefined;
  }
}
