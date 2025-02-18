import { Controller, Post, Body, HttpCode, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { NegaritMessageDto } from './dto/negarit-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('negarit')
  negarit(@Body() negaritMessageDto: NegaritMessageDto) {
    return this.messageService.negarit(negaritMessageDto);
  }

  @Post('telegram')
  @HttpCode(200)
  telegram(@Query() param, @Body() telegramMessageDto: any) {
    return this.messageService.telegram(param.id, telegramMessageDto);
  }
}
