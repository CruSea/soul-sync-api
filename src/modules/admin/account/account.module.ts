import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [AccountController],
  providers: [AccountService, PrismaService],
})
export class AccountModule {}
