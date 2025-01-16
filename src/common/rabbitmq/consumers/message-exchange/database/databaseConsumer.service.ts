import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  forwardRef,
  Inject,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { ChatExchangeService } from 'src/common/rabbitmq/chat-exchange/chat-exchange.service';

@Injectable()
export class DatabaseConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'database_queue';

  constructor(
    private prisma: PrismaService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly chatExchangeService: ChatExchangeService,
  ) {}

  async onModuleInit() {
    try {
      await this.connect();
      await this.consume();
    } catch (error) {
      console.error('Error initializing DatabaseConsumerService:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.disconnect();
    } catch (error) {
      console.error('Error destroying DatabaseConsumerService:', error);
    }
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
      if (!msg || !msg.content) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg);
        return;
      }

      try {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);
        console.log('Consumed message:', message);

        const createMessageDto = this.validateMessage(message);
        console.log('Validated message: ', createMessageDto);
        if (!createMessageDto) {
          console.error('Invalid message structure:', message);
          this.channel.nack(msg);
          return;
        }

        const chat = await this.processMessage(createMessageDto);
        if (!chat) {
          console.error('Error processing message:', message);
          this.channel.nack(msg);
          return;
        }

        if (chat.type === 'CHAT') {
          await this.sendChatExchangeData(chat);
        }

        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg);
      }
    });
  }

  private validateMessage(message: any): CreateMessageDto | null {
    if (!message.metadata || !message.payload) {
      return null;
    }

    if (message.type === 'CHAT') {
      return {
        channelId: (
          message.payload.channelId || message.payload.message.channelId
        ).toString(),
        address: message.payload.address || message.payload.message.address,
        type: 'SENT',
        body: message.payload.body || message.payload.message.body,
      };
    } else if (message.metadata.type === 'TELEGRAM') {
      if (
        !message.payload.message ||
        !message.payload.message.chat ||
        !message.payload.message.text
      ) {
        return null;
      }
      return {
        channelId: message.metadata.channelId,
        address: message.payload.message.chat.id.toString(),
        type: 'RECEIVED',
        body: message.payload.message.text,
      };
    } else if (message.metadata.type === 'NEGARIT') {
      if (!message.payload.received_message) {
        return null;
      }
      return {
        channelId: message.metadata.channelId,
        address: message.payload.received_message.sent_from,
        type: 'RECEIVED',
        body: message.payload.received_message.message,
      };
    } else if (message.metadata.type === 'TWILIO') {
      if (!message.payload.from || !message.payload.body) {
        console.error('Invalid Twilio message structure:', message.payload);
        return null;
      }
      return {
        channelId: message.metadata.channelId,
        address: message.payload.from, // Sender's phone number
        type: 'RECEIVED', // Mark as "received" from Twilio
        body: message.payload.body, // Message content
      };
    } else {
      console.error('Unsupported message type:', message.metadata);
      return null;
    }
  }

  private async processMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<any> {
    try {
      const createdMessage = await this.prisma.message.create({
        data: createMessageDto,
      });

      const existingConversation = await this.prisma.conversation.findFirst({
        where: { address: createdMessage.address, isActive: true },
      });

      const conversationId = existingConversation
        ? existingConversation.id
        : (
            await this.prisma.conversation.create({
              data: {
                mentorId: process.env.DEFAULT_MENTOR_ID,
                address: createdMessage.address,
                channelId: createdMessage.channelId,
                isActive: true,
              },
            })
          ).id;

      await this.prisma.thread.create({
        data: {
          conversationId,
          messageId: createdMessage.id,
        },
      });

      if (createdMessage.type === 'RECEIVED') {
        return {
          type: 'CHAT',
          metadata: {
            conversationId,
            email: (
              await this.prisma.mentor.findUnique({
                where: {
                  id: (
                    await this.prisma.conversation.findUnique({
                      where: { id: conversationId },
                    })
                  ).mentorId,
                },
              })
            )?.email,
          },
          payload: {
            message: createdMessage,
          },
        };
      } else {
        return {
          type: 'MESSAGE',
        };
      }
    } catch (error) {
      console.error('Error processing message:', error);
      return null;
    }
  }

  private async sendChatExchangeData(chat: Chat) {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: chat.metadata.conversationId },
      });
      const mentor = await this.prisma.mentor.findUnique({
        where: { id: conversation.mentorId },
      });
      let socketId = await this.redisService.get(mentor.email.toString());
      if (!socketId) {
        if (mentor) {
          this.chatService.setSocket(
            mentor.email.toString(),
            'mentor is offline',
          );
        }
        socketId = 'mentor is offline';
      }
      const chatEchangeData = this.rabbitmqService.getChatEchangeData(
        chat,
        socketId,
      );
      await this.chatExchangeService.send('chat', chatEchangeData);
    } catch (error) {
      console.error('Error sending chat exchange data:', error);
    }
  }
}
