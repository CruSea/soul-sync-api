import { Controller, Post, Get, Body } from '@nestjs/common';
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

    @Post('webhook')
    async handleWebhook(@Body() update: any) {
        return this.telegramService.handleUpdate(update);
    }

    @Get()
    async getHello() {
        return 'Hello World!';
    }
}
