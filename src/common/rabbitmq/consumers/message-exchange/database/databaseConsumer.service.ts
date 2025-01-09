import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class DatabaseConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'database_queue';

  constructor(private prisma: PrismaService) {}

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
      if (msg && msg.content) {
        try {
          const messageContent = msg.content.toString();
          const message = JSON.parse(messageContent);
          console.log('Consumed message:', message);

          let createMessageDto: CreateMessageDto;

          // Validate message structure
          if (!message.metadata || !message.payload) {
            console.error('Invalid message format:', message);
            this.channel.nack(msg); // Requeue invalid messages
            return;
          }

          if (message.metadata.type === 'TELEGRAM') {
            if (
              !message.payload.message ||
              !message.payload.message.chat ||
              !message.payload.message.text
            ) {
              console.error('Invalid TELEGRAM message structure:', message);
              this.channel.nack(msg); // Requeue invalid messages
              return;
            }
            createMessageDto = {
              channelId: message.metadata.channelId,
              address: message.payload.message.chat.id.toString(),
              type: 'RECEIVED',
              body: message.payload.message.text,
            };
          } else if (message.metadata.type === 'NEGARIT') {
            if (!message.payload.received_message) {
              console.error('Invalid NEGARIT message structure:', message);
              this.channel.nack(msg); // Requeue invalid messages
              return;
            }
            createMessageDto = {
              channelId: message.metadata.channelId,
              address: message.payload.received_message.sent_from,
              type: 'RECEIVED',
              body: message.payload.received_message.message,
            };
          } else {
            console.error('Unsupported message type:', message.metadata.type);
            this.channel.nack(msg); // Requeue unsupported messages
            return;
          }

          // Transaction to handle message, conversation, and thread
          await this.prisma.$transaction(async (prisma) => {
            const createdMessage = await prisma.message.create({
              data: createMessageDto,
            });

            const existingConversation = await prisma.conversation.findFirst({
              where: { address: createdMessage.address, isActive: true },
            });

            const conversationId = existingConversation
              ? existingConversation.id
              : (
                  await prisma.conversation.create({
                    data: {
                      mentorId: process.env.DEFAULT_MENTOR_ID,
                      address: createdMessage.address,
                      channelId: createdMessage.channelId,
                      isActive: true,
                    },
                  })
                ).id;

            await prisma.thread.create({
              data: {
                conversationId,
                messageId: createdMessage.id,
              },
            });
          });

          // Acknowledge only after success
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(msg); // Requeue on error
        }
      }
    });
  }f
}