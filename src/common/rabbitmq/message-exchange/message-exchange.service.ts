import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class MessageExchangeService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly EXCHANGE_NAME = 'message';
  private readonly EXCHANGE_TYPE = 'topic'; // (direct, fanout, topic)
  private readonly DATABASE_QUEUE_NAME = 'database_queue';

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    this.connection = await amqp.connect(this.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.EXCHANGE_NAME, this.EXCHANGE_TYPE, {
      durable: true,
    });
    await this.channel.assertQueue(this.DATABASE_QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(
      this.DATABASE_QUEUE_NAME,
      this.EXCHANGE_NAME,
      'message',
    );
    console.log('MessageExchangeService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('MessageExchangeService Disconnected!');
  }

  async send(routingKey: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer, {
      persistent: true,
    });
    console.log(
      `Message sent to exchange "${this.EXCHANGE_NAME}" with routing key "${routingKey}":`,
      message,
    );
  }
}
