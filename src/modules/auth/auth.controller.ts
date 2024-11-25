import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/callback')
  async googleCallback(@Query('code') authCode: string) {
    console.log(authCode);
    if (!authCode) {
      throw new Error('Auth code is required');
    }

    const result = await this.authService.handleGoogleSignin(authCode);
    return result;
  }

  @Post('google-signin')
  async googleSignIn(@Body('authCode') authCode: string) {
    if (!authCode) {
      throw new Error('Auth code is required');
    }

    // Call AuthService with authCode
    const result = await this.authService.handleGoogleSignin(authCode);
    return result;
  }
}
