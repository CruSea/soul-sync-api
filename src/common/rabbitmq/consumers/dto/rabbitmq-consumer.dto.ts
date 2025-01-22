import * as amqp from 'amqplib';
import { IsString } from 'class-validator';

export class RabbitMQConsumerDto {
    @IsString()
    queueName: string;
    
    channel: amqp.Channel;
}