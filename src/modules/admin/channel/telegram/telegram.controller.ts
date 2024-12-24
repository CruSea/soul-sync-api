import { Controller, Post, Get, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
    constructor(private readonly telegramService: TelegramService) {}

    @Post('webhook')
    async handleWebhook(@Body() update: any) {
        return this.telegramService.handleUpdate(update);
    }
}
