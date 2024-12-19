import { Module } from '@nestjs/common';
import { MentorService } from './mentor.service';
import { MentorController } from './mentor.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [MentorController],
  providers: [MentorService, PrismaService],
  exports: [MentorService],
})
export class MentorModule {}
