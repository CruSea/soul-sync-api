import { Controller, Post, Body, HttpCode, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MessageService } from './message.service';
import { NegaritMessageDto } from './dto/negarit-message.dto';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('negarit')
  @HttpCode(200)
  negarit(@Query() param, @Body() negaritMessageDto: any) {
    return this.messageService.negarit(param.id, negaritMessageDto);
  }

  @Post('negarit-webhook')
  @HttpCode(200)
  receiveSms(@Body() body: any) {
    try {
      const { received_message } = body;
      return this.messageService.processNegaritWebhook(received_message);
    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      throw new HttpException('Error processing SMS', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('telegram')
  @HttpCode(200)
  telegram(@Query() param, @Body() telegramMessageDto: any) {
    return this.messageService.telegram(param.id, telegramMessageDto);
  }
}
