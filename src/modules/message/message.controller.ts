import { Controller, Post, Body, HttpCode, Query } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('negarit')
  @HttpCode(200)
  async negarit(@Query() param, @Body() negaritMessageDto: any) {
    console.log(
      'this is the id: ',
      param.id,
      ' this is the message: ',
      negaritMessageDto,
    );
    return await this.messageService.negarit(param.id, negaritMessageDto);
  }

  @Post('telegram')
  @HttpCode(200)
  telegram(@Query() param, @Body() telegramMessageDto: any) {
    return this.messageService.telegram(param.id, telegramMessageDto);
  }
  @Post('twilio')
  @HttpCode(200)
  async sendTwilioMessage(@Query() param, @Body() twilioMessageDto: any) {
    console.log('Received message from Twilio:', twilioMessageDto);
    return this.messageService.twilio(param.id, twilioMessageDto);
  }
}
