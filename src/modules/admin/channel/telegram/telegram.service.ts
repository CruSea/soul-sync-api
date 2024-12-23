import { Injectable, OnModuleInit } from '@nestjs/common';
import { Bot } from "grammy";
import axios from 'axios';
import * as amqp from 'amqplib';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Bot;
    private channel: amqp.Channel;
    private queue = 'telegram_messages';


    constructor() {
        this.bot = new Bot(process.env.TELEGRAM_BOT_TOKEN); 
    }

    async onModuleInit() {
        await this.connectToRabbitMQ();
        this.startConsumer(); // Start the consumer when the module initializes
        this.bot.on('message', async (ctx) => {
            await this.handleUpdate(ctx.update);
        });
        this.bot.start();
    }

    private async connectToRabbitMQ() {
        try {
            const connection = await amqp.connect('amqp://user:password@rabbitmq:5672'); // Connect to RabbitMQ server
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(this.queue, { durable: true }); // Ensure the queue exists
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
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
        this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(message)), { persistent: true });
        
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

    private startConsumer() {
        this.channel.consume(this.queue, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log('Received from RabbitMQ:', messageContent);

                
                const { chatId, text } = JSON.parse(messageContent);
                await this.sendMessage(chatId, text); // Send the message back to Telegram

                
                this.channel.ack(msg);
            }
        }, { noAck: false });
    }
}
