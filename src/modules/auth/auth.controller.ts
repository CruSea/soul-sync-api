import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/sign-in-auth.dto';
import { SignUpUserDto } from './dto/sign-up-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    res.redirect(`${process.env.WEB_CALLBACK_URL}?token=${req.user}`);
  }

  @Get('google-local')
  @UseGuards(AuthGuard('google-local'))
  async googleLocalAuth() {}

  @Get('google/local-callback')
  @UseGuards(AuthGuard('google-local'))
  async googleLocalAuthRedirect(@Req() req, @Res() res: Response) {
    res.redirect(`${process.env.LOCAL_WEB_CALLBACK_URL}?token=${req.user}`);
  }

  @Post('sign-in')
  async signIn(@Body() signInUserDto: SignInUserDto): Promise<AuthDto> {
    return await this.authService.signIn(signInUserDto);
  }

  @Post('sign-up')
  async signUp(@Body() signUpUserDto: SignUpUserDto): Promise<AuthDto> {
    const ben = await this.authService.signUp(signUpUserDto);
    console.log('ben', ben);
    return ben;
  }
}
