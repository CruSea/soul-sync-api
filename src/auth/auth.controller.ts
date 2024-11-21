import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guard/auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard) // Protect this endpoint
  @Post('google-signin')
  async googleSignIn(@Req() request: any) {
    // Access user info from AuthGuard
    const { email, imageUrl } = request.user;

    // Call AuthService with user info
    const result = await this.authService.handleGoogleSignin({
      email,
      imageUrl,
    });
    return result;
  }
}
