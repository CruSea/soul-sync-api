// messages.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './Telegram.service';

@Controller('messages')
export class TelegramController {
  constructor(private readonly messagesService: TelegramService) {}

  @Post()
  async sendMessage(@Body() body: { senderId: string; channelId: string; message: string; menteeChatId: number }) {
    return this.messagesService.sendMessageToTelegram(body);
  }
}
