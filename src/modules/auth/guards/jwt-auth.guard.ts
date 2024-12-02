import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: any) {
    const request = context.switchToHttp().getRequest();
    
    const token = request.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key'); // Use environment variable for secret
      request.user = decoded;
      
      // Call the default canActivate method
      return super.canActivate(context);
      
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}