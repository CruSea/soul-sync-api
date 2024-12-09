import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { AccountUserService } from './accountUser.service';

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
    private readonly accountUserService: AccountUserService,
  ) {}

  private async fetchUserInfoFromGoogle(authCode: string) {
    const tokenResponse = await this.googleClient.getToken(authCode);
    const idToken = tokenResponse.tokens.id_token;

    if (!idToken) {
      throw new Error('Invalid auth code or missing id_token');
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return ticket.getPayload();
  }

  async handleGoogleSignup(authCode: string, accountName?: string) {
    const userInfo = await this.fetchUserInfoFromGoogle(authCode);

    const email = userInfo?.email;
    const imageUrl = userInfo?.picture;

    if (!email) {
      throw new Error('Google account does not have an email address');
    }

    const user = await this.userService.CreateUser(
      { email, imageUrl },
      accountName,
    );

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
    console.log(user);
    return {
      user,
      accessToken,
    };
  }

  async handleLogin(authCode: string) {
    const userInfo = await this.fetchUserInfoFromGoogle(authCode);
    const email = userInfo?.email;

    if (!email) {
      throw new Error('Google account does not have an email address');
    }

    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

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
  async handleMentorLogin(authCode: string, accountUserUuid: string) {
    const userInfo = await this.fetchUserInfoFromGoogle(authCode);
    const email = userInfo?.email;

    if (!email) {
      throw new Error('Google account does not have an email address');
    }

    let user = await this.userService.findUserByEmail(email);
    let isNewUser = false;

    if (!user) {
      user = await this.userService.CreateUser(
        { email, imageUrl: userInfo?.picture },
        // Create the user if not found
      );
      isNewUser = true;
    }

    // Only associate the mentor with the account if this is the first-time login
    if (isNewUser) {
      await this.accountUserService.addMentorToAccount(accountUserUuid, user);
    }

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
