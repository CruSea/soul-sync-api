import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SmsService } from './sms.service';

@Controller('sms')
export class SmsController {
    constructor(private readonly smsService: SmsService) {}

    @Get('ports')
    async getSmsPorts() {
        return this.smsService.fetchSmsPorts();
    }

    @Post('send')
    async sendSms(
        @Body('phoneNumber') phoneNumber: string,
        @Body('message') message: string,
    ) {
        return this.smsService.sendSms(phoneNumber, message);
    }
}
