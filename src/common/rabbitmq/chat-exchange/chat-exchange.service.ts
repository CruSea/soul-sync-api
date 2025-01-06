import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class ChatExchangeService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly EXCHANGE_NAME = 'chat';
  private readonly EXCHANGE_TYPE = 'topic'; // (direct, fanout, topic)
  private readonly QUEUE_NAME = 'chat_queue';
  
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
    await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, 'telegram'); // Bind to the specific routing key
    console.log('ChatExchangeService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('ChatExchangeService Disconnected!');
  }

  async send(routingKey: string, message: any) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    if (this.channel) {
      this.channel.publish(this.EXCHANGE_NAME, routingKey, messageBuffer, {
        persistent: true,
      });
      console.log('Message Sent');
    }
  }
}
