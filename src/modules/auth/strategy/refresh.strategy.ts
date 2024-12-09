import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: 'asdasdad',
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const user = await this.authService.getUserIfRefreshTokenMatches(
      payload.sub,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
