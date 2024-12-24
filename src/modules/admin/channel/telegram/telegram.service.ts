import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from "grammy";
import axios from 'axios';
import * as amqp from 'amqplib';
import { RabbitService } from '../rabbit/rabbit.service';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Bot;

    constructor(private readonly rabbitService: RabbitService) {
        this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN); 
    }

    async onModuleInit() {
        await this.rabbitService.connectToRabbitMQ();
        this.bot.on('message', async (ctx) => {
            await this.handleUpdate(ctx.update);
        });
        this.bot.start();
    }



    async handleUpdate(update: any) {
        const chatId = update.message.chat.id;
        const text = "Hello there! Welcome to SoulSync! We are here to help you with your questions and concerns.";

        // Send a reply back to the user
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: text,
        });

        // Prepare message for RabbitMQ

        const message = {
            chatId: chatId,
            text: update.message.text,
        };

        // Send message to RabbitMQ
        this.rabbitService.channel.sendToQueue(this.rabbitService.queue, Buffer.from(JSON.stringify(message)), { persistent: true });
        
        console.log('Message sent to RabbitMQ:', message);
        
        return { status: 'ok' };
    }

    async sendMessage(chatId: string, message: string): Promise<void> {
        const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const payload = {
            chat_id: chatId,
            text: message,
        };

        try {
            await axios.post(url, payload);
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);``   
        }
    }
}
