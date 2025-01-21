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
import { RedisService } from 'src/common/redis/redis.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { ChatExchangeService } from 'src/common/rabbitmq/chat-exchange/chat-exchange.service';
import { MessageValidator } from './message-validator';

@Injectable()
export class DatabaseConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  private readonly RABBITMQ_URL = process.env.RABBITMQ_URL;
  private readonly QUEUE_NAME = 'database_queue';

  //I used forwardRef to avoid circular dependency
  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly chatExchangeService: ChatExchangeService,
    private readonly validators: MessageValidator[], 
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.connect();
      await this.consume();
    } catch (error) {
      console.error('Error initializing DatabaseConsumerService:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.disconnect();
    } catch (error) {
      console.error('Error destroying DatabaseConsumerService:', error);
    }
  }

  private async connect(): Promise<void> {
    this.connection = await amqp.connect(this.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
    console.log('DatabaseConsumerService Connected!');
  }

  private async disconnect(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
    console.log('DatabaseConsumerService Disconnected!');
  }

  private async consume(): Promise<void> {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg || !msg.content) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg);
        return;
      }

      try {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);

        const createMessageDto = this.validateMessage(message);
        if (!createMessageDto) {
          console.error('Invalid message structure:', message);
          this.channel.nack(msg);
          return;
        }

        await this.processMessage(createMessageDto);
        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg);
      }
    });
  }
  private validateMessage(message: any): CreateMessageDto | null {
    const validator = this.validators.find((validate) =>
      validate.supports(message.metadata.type),
    );

    if (!validator) {
      console.error('Unsupported message type:', message.metadata.type);
      return null;
    }

    return validator.validate(message);
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
    } catch (error) {
      console.error('Error processing message:', error);
      return null;
    }
  }
}
