import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('send')
    async sendTelegramMessage(@Body() body: { chatId: string; message: string }) {
        const { chatId, message } = body;
        await this.telegramService.sendMessage(chatId, message);
        return { status: 'Message sent' };
    }
}
