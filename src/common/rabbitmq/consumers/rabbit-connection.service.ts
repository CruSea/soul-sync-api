import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQConnectionService {
  async createConnection(QueueName?: string): Promise<{
    connection: amqp.Connection;
    channel: amqp.Channel;
  }> {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    if (QueueName) {
      await channel.assertQueue(QueueName, { durable: true });
    }
    return { connection, channel };
  }

  async disconnect(
    connection: amqp.Connection,
    channel: amqp.Channel,
  ): Promise<void> {
    try {
      if (channel) {
        await channel.close();
        console.log('RabbitMQ Channel Closed');
      }
      if (connection) {
        await connection.close();
        console.log('RabbitMQ Connection Closed');
      }
    } catch (error) {
      console.error('Error during RabbitMQ disconnection:', error);
    }
  }
}
