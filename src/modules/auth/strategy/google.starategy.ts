import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    try {
      const user = await this.authService.signInOrUp({
        username: emails[0].value,
        name: name.givenName,
        password: emails[0].value,
        imageUrl: photos[0].value,
      });
      // Fetch roles and accounts using AuthService methods
      const roles = await this.authService.getUserRoles(user.id);
      const accounts = await this.authService.getUserAccounts(user.id);

      // Prepare JWT payload
      const payload = {
        sub: user.id,
        email: user.username,
        imageUrl: user.imageUrl,
        accounts: accounts.map((acc) => ({
          id: acc.account.id,
          name: acc.account.name,
       //   domain: acc.account.domain,
        })),
        roles: roles.map((role) => role.type),
      };

      // Generate JWT token
      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      });

      done(null, token);
    } catch (error) {
      done(error, false);
    }
  }
}
