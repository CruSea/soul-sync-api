import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from "grammy";
import axios from 'axios';
import { RabbitService } from '../../message/rabbit/rabbit.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Bot;

    constructor(
        private readonly prisma: PrismaService, 
        private readonly telegramRabbitService: RabbitService) 
        {
        this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN); 
    }

    async onModuleInit() {
        await this.telegramRabbitService.connectToRabbitMQ('telegram');
        this.bot.on('message', async (ctx) => {
            await this.handleUpdate(ctx.update);
        });
        this.bot.start();
    }



    async handleUpdate(update: any): Promise<void> {
        const username = update.message.chat.username;
    
        const user = await this.prisma.user.findFirst({
            where: { 
                username: username,
                isDeleted: false,
            },
        });
    
        if (!user) {
            const channelMetadataResponse = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`);
            const channelUsername = channelMetadataResponse.data.result.username;
    
            const channel = await this.prisma.channel.findFirst({
                where: { username: channelUsername },
            });
    
            if (!channel) {
                await this.sendMessage(update.message.chat.id, "Channel not found");
                console.log('Channel not found');
            }
            
            return;
        }
    
        await this.handleIncomingMessage(update);
    }

    async handleIncomingMessage(update: any) {
        const chatId = update.message.chat.id;
        const text = "wow this is amazing!!!!";

        // Send a reply back to the user
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: chatId,
            text: text,
        });

        // Prepare message for RabbitMQ
        const message = {
            chatId: update.message.chat.id,
            text: update.message.text,
        };

        // Send message to RabbitMQ
        this.telegramRabbitService.channel.sendToQueue('telegram', Buffer.from(JSON.stringify(message)), { persistent: true });
        
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
