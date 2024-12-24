import { Injectable } from "@nestjs/common";
import * as amqp from 'amqplib';

@Injectable()
export class RabbitService {

    channel: amqp.Channel;
    queue = 'telegram_messages';

     async connectToRabbitMQ() {
        try {
            const connection = await amqp.connect('amqp://user:password@rabbitmq:5672'); // Connect to RabbitMQ server
            this.channel = await connection.createChannel();
            await this.channel.assertQueue(this.queue, { durable: true }); // Ensure the queue exists
            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
        }
    }
}