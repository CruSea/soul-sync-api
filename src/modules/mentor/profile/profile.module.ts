import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, AuthGuard, JwtService],
  exports: [ProfileService],
})
export class ProfileModule {}
