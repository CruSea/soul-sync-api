import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async googleSignup(
    @Body('authCode') authCode: string,
    @Body('accountName') accountName?: string,
  ) {
    if (!authCode) {
      throw new Error('Auth code is required');
    }
    const result = await this.authService.handleGoogleSignup(
      authCode,
      accountName,
    );
    return result;
  }

  @Post('login')
  async login(@Body('authCode') authCode: string) {
    if (!authCode) {
      throw new Error('Auth code is required');
    }

    const result = await this.authService.handleLogin(authCode);
    return result;
  }
}
