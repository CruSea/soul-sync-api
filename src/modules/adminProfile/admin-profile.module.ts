import { Module } from '@nestjs/common';
import { AdminProfileService } from './admin-profile.service';
import { AdminProfileController } from './admin-profile.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AdminProfileController],
  providers: [AdminProfileService, PrismaService, JwtService],
})
export class AdminProfileModule {}
