import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountUserService } from './accountUser.service';
import { DatabaseModule } from 'src/database/database.module';
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.NEXTAUTH_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    DatabaseModule
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, AccountUserService],
})
export class AuthModule {}
