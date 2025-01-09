import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';

@Injectable()
export class MentorChatService {
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
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    this.connection = await amqp.connect(this.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
    console.log('MentorChatService Connected!');
  }

  private async disconnect() {
    await this.channel.close();
    await this.connection.close();
    console.log('DatabaseConsumerService Disconnected!');
  }

  private async consume(userId: string) {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (msg && msg.content) {
        const chatContent = msg.content.toString();
        const chat = JSON.parse(chatContent);
        console.log('Consumed CHAT:', chat);
        try {
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
      }
    });
  }
}
