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

        try {
          let createMessageDto: CreateMessageDto;

          if (message.metadata.type === 'TELEGRAM') {
            createMessageDto = {
              channelId: message.metadata.channelId,
              address: message.payload.message.chat.id.toString(),
              type: 'RECEIVED',
              body: message.payload.message.text,
            };
          } else if (message.metadata.type === 'NEGARIT') {
            createMessageDto = {
              channelId: message.metadata.channelId,
              address: message.payload.received_message.sent_from,
              type: 'RECEIVED',
              body: message.payload.received_message.message,
            };
          }

          if (createMessageDto) {
            console.log('Creating message with DTO:', createMessageDto);
            const createdMessage = await this.prisma.message.create({
              data: createMessageDto
            });
            console.log('Created message:', createdMessage);

            // Fetch the created message from the database
            const fetchedMessage = await this.prisma.message.findUnique({
              where: { id: createdMessage.id, type: 'RECEIVED' }
            });
            console.log('Fetched message:', fetchedMessage);

            if (fetchedMessage) {
               const createConversationDto: CreateConversationDto = {
                mentorId: "014a2bfb-d414-49a8-9806-6241f2da119e",
                address: fetchedMessage.address,
                channelId: fetchedMessage.channelId.toString(),
                isActive: true
              };

               await this.prisma.conversation.create({
                data: createConversationDto
              });

              console.log('Conversation created:', createConversationDto);
            }
          }

          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // Optionally, we can nack the message to requeue it
          // this.channel.nack(msg);
        }
      }
    });
  }
}