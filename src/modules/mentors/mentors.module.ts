import { Module } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MentorsController } from './mentors.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [MentorsController],
  providers: [MentorsService, PrismaService],
  exports: [MentorsService],
})
export class MentorsModule {}
