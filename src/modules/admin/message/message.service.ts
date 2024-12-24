import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import axios from 'axios';

@Injectable()
export class MessageService implements OnModuleInit{
    private channel: amqp.Channel;
    private queue = 'telegram_messages';

    async onModuleInit() {
        await this.connectToRabbitMQ();
        this.startConsumer(); // Start the consumer when the module initializes
        
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

    private startConsumer() {
        this.channel.consume(this.queue, async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log('Received from RabbitMQ:', messageContent);

                
                const { chatId, text } = JSON.parse(messageContent);
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: text
                });

                
                this.channel.ack(msg);
            }
        }, { noAck: false });
    }
}
