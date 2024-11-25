import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private async fetchUserInfoFromGoogle(authCode: string) {
    console.log('Received Auth Code:', authCode);
    try {
      const tokenResponse = await this.googleClient.getToken(authCode);
      const idToken = tokenResponse.tokens.id_token;

      if (!idToken) {
        throw new Error('Invalid auth code or missing id_token');
      }
      console.log('ID Token:', idToken);
      console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
      console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);

      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      return ticket.getPayload();
    } catch (error) {
      console.error('Error fetching user info from Google:', error.message);

      throw new Error('Failed to authenticate with Google');
    }
  }

  async handleGoogleSignin(authCode: string) {
    // Fetch user info from Google
    const userInfo = await this.fetchUserInfoFromGoogle(authCode);

    const email = userInfo?.email;
    const imageUrl = userInfo?.picture;

    if (!email) {
      throw new Error('Google account does not have an email address');
    }

    // Check if user exists or create a new one
    const user = await this.userService.findOrCreateUser({ email, imageUrl });

    // Generate an access token
    const accessToken = this.jwtService.sign(
      {
        userId: user.uuid,
        email: user.email,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      },
    );

    return {
      user,
      accessToken,
    };
  }
}
