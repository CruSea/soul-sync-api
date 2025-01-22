import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';

@Injectable()
export class MessageConsumerService {
  private channel: amqp.Channel;
  private connection: amqp.Connection;
  private rabbitConnectionDetails: {
    queueName: 'message_queue';
    routingKeys: ['telegram'];
    exchangeName: 'message';
    exchangeType: 'topic';
  };

  constructor(
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
  ) {}

  async OnModuleInit() {
    try {
        const { channel, connection } =
      await this.rabbitMQConnectionService.createConnection(
        this.rabbitConnectionDetails,
      );
    this.channel = channel;
    this.connection = connection;
    } catch (error) {
        console.error('Error initializing MessageConsumerService:', error);
    }
    }
}
