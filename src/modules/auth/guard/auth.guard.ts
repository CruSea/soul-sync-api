import { Injectable } from '@nestjs/common';
import { AuthGuard as JwtAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard extends JwtAuthGuard('jwt') {}
