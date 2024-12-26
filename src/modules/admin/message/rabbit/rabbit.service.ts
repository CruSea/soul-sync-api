import { Injectable } from "@nestjs/common";
import * as amqp from 'amqplib';

@Injectable()
export class RabbitService {

    channel: amqp.Channel; 


     async connectToRabbitMQ(queueName: string ): Promise<void> {
        try {
            const connection = await amqp.connect('amqp://user:password@rabbitmq:5672'); 
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(queueName, { durable: true }); 
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
}