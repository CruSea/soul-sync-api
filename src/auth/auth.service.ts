import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleGoogleSignin(userInfo: { email: string; imageUrl: string }) {
    const { email, imageUrl } = userInfo;

    // Find or create the user
    const user = await this.usersService.findOrCreateUser({ email, imageUrl });

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
