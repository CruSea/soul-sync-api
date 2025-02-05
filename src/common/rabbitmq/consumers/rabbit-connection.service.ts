import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionDto } from './dto/rabbitmq-connection.dto';

@Injectable()
export class RabbitMQConnectionService {
  async createConnection(
    rabbitMQConnectionDto?: RabbitMQConnectionDto,
  ): Promise<{
    connection: amqp.Connection;
    channel: amqp.Channel;
  }> {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    if (rabbitMQConnectionDto) {
      if (
        rabbitMQConnectionDto.exchangeName &&
        rabbitMQConnectionDto.exchangeType
      ) {
        await channel.assertExchange(
          rabbitMQConnectionDto.exchangeName,
          rabbitMQConnectionDto.exchangeType,
          { durable: true },
        );
      }

      await channel.assertQueue(rabbitMQConnectionDto.queueName, {
        durable: true,
      });

      if (
        rabbitMQConnectionDto.queueName &&
        rabbitMQConnectionDto.exchangeName &&
        rabbitMQConnectionDto.routingKeys
      ) {
        rabbitMQConnectionDto.routingKeys.forEach((routingKey) => {
          channel.bindQueue(
            rabbitMQConnectionDto.queueName,
            rabbitMQConnectionDto.exchangeName,
            routingKey,
          );
        });
      }
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
