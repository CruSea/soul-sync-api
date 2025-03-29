import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MentorProfileController } from './mentor-profile.controller';
import { MentorProfileService } from './mentor-profile.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [MentorProfileController],
  providers: [MentorProfileService, PrismaService, AuthGuard, JwtService],
  exports: [MentorProfileService],
})
export class MentorProfileModule {}
