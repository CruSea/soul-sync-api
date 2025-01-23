import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';

@Injectable()
export class MessageConsumerService
  extends RabbitMQAbstractConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private connection: amqp.Connection;
  private rabbitConnectionDetails: {
    queueName: 'message_queue';
    routingKeys: ['telegram'];
    exchangeName: 'message';
    exchangeType: 'topic';
  };
  constructor(
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
  ) {
    super({ queueName: 'message_queue', channel: null });
  }
  async onModuleInit(): Promise<void> {
    try {
      const { channel, connection } =
        await this.rabbitMQConnectionService.createConnection(
          this.rabbitConnectionDetails,
        );
      this.channel = channel;
      this.connection = connection;
      await this.consume();
    } catch (error) {
      console.error('Error initializing MessageConsumerService:', error);
    }
  }
  async onModuleDestroy(): Promise<void> {
    try {
      await this.rabbitMQConnectionService.disconnect(
        this.connection,
        this.channel,
      );
    } catch (error) {
      console.error('Error destroying MessageConsumerService:', error);
    }
  }
  handleMessage(message: any, msg: amqp.Message): Promise<void> {
    return;
  }
}
