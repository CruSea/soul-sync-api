import { Controller, Post, Body } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messagesService: MessageService) {}

  @Post()
  async sendMessage(@Body() body: { senderId: string; channelId: string; message: string; menteeChatId: number }) {
    return this.messagesService.sendMessageToTelegram(body);
  }
}