import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthGuard implements CanActivate {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['authorization'];
    const token = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.substring(7)
      : null;

    if (!token) {
      return false;
    }

    try {
      // Verify the token using Google's OAuth2 client
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      // Attach user info to request (e.g., email, picture...)
      request.user = {
        email: payload?.email,
        imageUrl: payload?.picture,
      };

      return true;
    } catch (error) {
      console.error('Invalid Google ID Token:', error);
      return false;
    }
  }
}
