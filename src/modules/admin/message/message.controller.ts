import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from '../channel/messagingChannels/telegram/telegram.service';

@Controller('message')
export class MessageController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('tg-send')
    async sendTelegramMessage(@Body() body: { chatId: string; message: string }) {
        const { chatId, message } = body;
        await this.telegramService.sendMessage(chatId, message);
        return { status: 'Message sent' };
    }

}
