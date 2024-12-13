import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramModule } from './modules/channel/telegram/telegram.module';  

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN, 
    }),
    AuthModule,
    AdminModule,
    TelegramModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
