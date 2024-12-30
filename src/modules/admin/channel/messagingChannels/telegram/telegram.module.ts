import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { RabbitModule } from '../../../message/rabbit/rabbit.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [RabbitModule, PrismaModule],
  controllers: [TelegramController],
  providers: [TelegramService, AuthService, JwtService],
  exports: [TelegramService, ]
})
export class TelegramModule {}
