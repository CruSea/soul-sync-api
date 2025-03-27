import { Controller, Post, Body, Query } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async handleMessage(@Query() param, @Body() message: any) {
    return this.messageService.processMessage(param.id, message);
  }
}
