import { Controller, Post, Body, HttpException, HttpStatus, Headers } from '@nestjs/common';
import { NegaritService } from './negarit.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Controller('negarit')
export class NegaritController {
  constructor(private readonly negaritService: NegaritService,
    private readonly prisma: PrismaService,
  ) { }

  @Post('send-sms')
  async sendSms(
    @Body('apiKey') apiKey: string,
    @Body('sentTo') sentTo: string,
    @Body('message') message: string,
    @Body('campaignId') campaignId: string,
    @Headers('authorization') authorization: string,
  ) {
    try {

      // Extract the token from the Authorization header
      const token = authorization.split(' ')[1];

      return await this.negaritService.sendSms(apiKey, sentTo, message, campaignId, token);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('receive')
  async receiveSms(@Body() body: any) {
    try {
      const { received_message } = body;
      return await this.negaritService.processIncomingSms(received_message);
    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      throw new HttpException('Error processing SMS', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
