import { Injectable } from '@nestjs/common';
import { Update, Ctx, Start } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class TelegramService {
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply('Welcome! This is your Telegram bot.');
  }
  
  
}
