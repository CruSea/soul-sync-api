import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RolesController } from './role.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [RolesController],
  providers: [RoleService, PrismaService, JwtService],
})
export class RoleModule {}
