import { Controller, Post, Body, HttpCode, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { MessageService } from './message.service';
import * as twilio from 'twilio';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('negarit')
  @HttpCode(200)
  async negarit(@Query() param, @Body() negaritMessageDto: any) {
    return await this.messageService.negarit(param.id, negaritMessageDto);
  }

  @Post('telegram')
  @HttpCode(200)
  telegram(@Query() param, @Body() telegramMessageDto: any) {
    return this.messageService.telegram(param.id, telegramMessageDto);
  }

  @Post('twilio')
  @HttpCode(200)
  async sendTwilioMessage(
    @Query() param,
    @Body() twilioMessageDto: any,
    @Res() res: Response,
  ) {
    const twiml = new twilio.twiml.MessagingResponse();
    res.type('text/xml').send(twiml.toString());
    return this.messageService.twilio(param.id, twilioMessageDto);
  }
}
