import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { NegaritService, MultipleSmsType } from './negarit.service';

@Controller('negarit')
export class NegaritController {
  constructor(private readonly negaritService: NegaritService) {}

  @Post('send-sms')
  async sendSms(
    @Body('apiKey') apiKey: string,
    @Body('sentTo') sentTo: string,
    @Body('message') message: string,
    @Body('campaignId') campaignId: string,
  ) {
    try {
      return await this.negaritService.sendSms(apiKey, sentTo, message, campaignId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('receive')
  async receiveSms(@Body() body: any) {
    console.log('Incoming SMS data:', body);
    // Temporarily log the entire body to inspect its structure
    return { success: true, received: body };
  }

  @Post('send-multiple-sms')
  async sendMultipleSms(
    @Body('apiKey') apiKey: string,
    @Body('data') data: MultipleSmsType[],
    @Body('campaignId') campaignId: string,
  ) {
    try {
      return await this.negaritService.sendMultipleSms(apiKey, data, campaignId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}