import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { Message } from 'amqplib';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { PrismaService } from '../../../../modules/prisma/prisma.service';

@Injectable()
export class MentorChatService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'chat_queue';

  constructor(
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly prismaService: PrismaService,
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

  async consume(email: string) {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg || !msg.content || msg.content.length === 0) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg, false, false); 
        return;
      }

      try {
        if (await this.handleMessage(msg, email)) {
          this.channel.ack(msg);
        }else {
          throw new Error('handleMessage returned false');
        }
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg, false, true); 
      }
    });
  }

  private async handleMessage(msg: Message, email: string): Promise<boolean> {
    const chatContent = msg.content.toString();
    const chat = JSON.parse(chatContent);
    console.log("this is the chat: ", chat);
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { email: chat.metadata.email },
      });
      console.log('this is the user: ', user, ' email: ', email);
      if (!user || user.email !== email) {
        console.log('user.email: ', user.email, ' email: ', email);
        throw new Error('Unauthorized access');
      }

      const socketId = await this.redisService.get(chat.metadata.email);
      if (!socketId || socketId === 'mentor is offline') {
        throw new Error('Mentor is offline');
      }
      await this.chatService.send(socketId, chat);
      console.log('Successfully sent the message!');
      return true;
    } catch (error) {
      console.log("Error handling the message: ", error);
      return false;
    }

    
  }
}
