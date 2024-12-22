import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from "grammy";
import axios from 'axios';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Bot;

    constructor() {
        this.bot = new Bot("7237693210:AAE5-wnuwTTHdn2BM-d-PyttdIZdy9iXzUo"); 
    }

    onModuleInit() {
        this.bot.on("message", (ctx) => ctx.reply("Hi there!"));
        this.bot.start();
    }

    async sendMessage(chatId: string, message: string): Promise<void> {
        const url = `https://api.telegram.org/bot7237693210:AAE5-wnuwTTHdn2BM-d-PyttdIZdy9iXzUo/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: message,
        };

        try {
            await axios.post(url, payload);
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
}
