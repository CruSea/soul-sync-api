import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { DatabaseService } from 'src/database/database.service';
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.NEXTAUTH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, DatabaseService],
})
export class AuthModule {}
