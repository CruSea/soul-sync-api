import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class ChatExchangeService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly EXCHANGE_NAME = 'chat';
  private readonly EXCHANGE_TYPE = 'topic'; // (direct, fanout, topic)
  private readonly QUEUE_NAME_CHAT = 'chat_queue';
  private readonly QUEUE_NAME_DB = 'database_queue';

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
    await this.channel.assertQueue(this.QUEUE_NAME_CHAT, { durable: true });
    await this.channel.assertQueue(this.QUEUE_NAME_DB, { durable: true });
    await this.channel.bindQueue(
      this.QUEUE_NAME_DB,
      this.EXCHANGE_NAME,
      'chat',
    );
    console.log('ChatExchangeService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('ChatExchangeService Disconnected!');
  }

  async send(routingKey: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    console.log('chatexchange message: ', message, "messageBuffer: ", messageBuffer);
    if (this.channel) {
      this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer, {
        persistent: true,
      });
      console.log('Message Sent');
    }
  }
}
