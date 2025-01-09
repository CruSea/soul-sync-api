import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';

@Injectable()
export class MentorChatService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'chat_queue';

  constructor(
    private readonly redis: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chat: ChatService,
  ) {}

  async onModuleInit() {
    try {
      await this.connect();
    } catch (error) {
      console.error('Error initializing MentorChatService:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.disconnect();
    } catch (error) {
      console.error('Error destroying MentorChatService:', error);
    }
  }

  private async connect() {
    try {
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
      console.log('MentorChatService Connected!');
    } catch (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error;
    }
  }

  private async disconnect() {
    try {
      await this.channel.close();
      await this.connection.close();
      console.log('MentorChatService Disconnected!');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }

  async consume(socketId: string) {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg || !msg.content) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg);
        return;
      }

      try {
        const chatContent = msg.content.toString();
        const chat = JSON.parse(chatContent);
        const userId = await this.redis.get(socketId);
        console.log('Consumed CHAT:', chat);

        if (chat.metadata.userId === userId) {
          const socketId = await this.redis.get(chat.metadata.userId);
          if (socketId === 'mentor is offline') {
            throw new Error('Mentor is offline');
          } else {
            await this.chat.send(socketId, chat);
            console.log('successfully sent the message!');
            this.channel.ack(msg);
          }
        } else {
          throw new Error('Unauthorized access');
        }
      } catch (error) {
        console.error('Error processing CHAT:', error);
        this.channel.nack(msg);
      }
    });
  }
}
