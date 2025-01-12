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
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RabbitmqService } from 'src/common/rabbitmq/rabbitmq.service';
import { Chat } from 'src/types/chat';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';

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
        } else if (chat.type === 'MESSAGE') {
          await this.sendMessageExchangeData(message);
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
      if (!message.payload.body) {
        return null;
      }
      return {
        channelId: message.payload.channelId,
        address: message.payload.address,
        type: 'SENT',
        body: message.payload.body,
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
      await this.channel.sendToQueue(
        'chat_queue',
        Buffer.from(JSON.stringify(chatEchangeData)),
      );
    } catch (error) {
      console.error('Error sending chat exchange data:', error);
    }
  }

  private async sendMessageExchangeData(message: any) {
    try {
      if (
        !message.payload ||
        !message.payload.address ||
        !message.payload.body
      ) {
        console.error('Invalid message payload:', message);
        return;
      }

      const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: message.payload.address,
          text: message.payload.body,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error sending message to Telegram:', errorResponse);
        return;
      }

      const telegramResponse = await response.json();
      if (!telegramResponse.ok) {
        console.error('Error sending message to Telegram:', telegramResponse);
        return;
      }

      console.log('Message sent to Telegram successfully:', telegramResponse);
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
    }
  }
}
