import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class DatabaseConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'database_queue';

  constructor(private prisma: PrismaService) { }

  async onModuleInit() {
    await this.connect();
    await this.consume();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    this.connection = await amqp.connect(this.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
    console.log('DatabaseConsumerService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('DatabaseConsumerService Disconnected!');
  }

  private async consume() {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);
        console.log('Consumed message:', message);

        // Perform database operations here
        if (message.metadata.type === 'TELEGRAM') {
          const createMessageDto: CreateMessageDto = {
            channelId: message.metadata.channelId,
            address: message.payload.message.chat.id.toString(),
            type: 'RECEIVED',
            body: message.payload.message.text,
          };

          await this.prisma.message.create({
            data: createMessageDto
          });
        } else if (message.metadata.type === 'NEGARIT') {
          const createMessageDto: CreateMessageDto = {
            channelId: message.metadata.channelId,
            address: message.payload.received_message.sent_from,
            type: 'RECEIVED',
            body: message.payload.received_message.message,
          };

          await this.prisma.message.create({
            data: createMessageDto
          });
        }

        this.channel.ack(msg);
      }
    });
  }
 
}