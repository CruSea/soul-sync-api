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

  @Post(`${process.env.HOST_URL + '/message/negarit?id=' + 'c73f9200-afaa-4e40-9923-f5a3be097639'}`)
  @HttpCode(200)
  receiveSms(@Query() param, @Body() body: any) {
    try {
      const { received_message } = body;
      return this.messageService.processNegaritWebhook(param.id, received_message);
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
