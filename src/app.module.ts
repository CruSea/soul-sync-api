import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { TelegramModule } from './modules/TelegramBot/Telegram.module';

@Module({
  imports: [AuthModule, UserModule, TelegramModule],
  providers: [PrismaService],
})
export class AppModule {}
