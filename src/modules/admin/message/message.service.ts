import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { RabbitService } from '../channel/rabbit/rabbit.service';

@Injectable()
export class MessageService implements OnModuleInit{
    constructor(private readonly messagerabbitService: RabbitService) {}
   

    async onModuleInit() {
        await this.messagerabbitService.connectToRabbitMQ('telegram');
        this.startConsumer(); 
        
    }


    private startConsumer() {
        this.messagerabbitService.channel.consume('telegram', async (msg) => {
            if (msg !== null) {
                const messageContent = msg.content.toString();
                console.log('Received from RabbitMQ:', messageContent);

                
                const { chatId, text } = JSON.parse(messageContent);
                await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    chat_id: chatId,
                    text: text
                });

                
                this.messagerabbitService.channel.ack(msg);
            }
        }, { noAck: false });
    }
}
