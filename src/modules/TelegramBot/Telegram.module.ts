// messages.module.ts
import { Module } from '@nestjs/common';
import { TelegramController } from './Telegram.controller';
import { TelegramService } from './Telegram.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [TelegramController],
    providers: [TelegramService],
})
export class TelegramModule {}
