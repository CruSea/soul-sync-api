import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageValidator } from './message-validators/Message-validator';
import { RabbitMQConnectionService } from '../rabbit-connection.service';

@Injectable()
export class DatabaseConsumerService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private QUEUE_NAME = 'database_queue';
  private rabbitConnectionDetails = [
    {
      queueName: this.QUEUE_NAME,
      routingKeys: ['telegram'],
      exchangeName: 'message',
      exchangeType: 'topic',
    },
    {
      queueName: this.QUEUE_NAME,
      routingKeys: ['chat'],
      exchangeName: 'chat',
      exchangeType: 'topic',
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
    @Inject('MessageValidators')
    private readonly validators: MessageValidator[],
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const connections = await Promise.all(
        this.rabbitConnectionDetails.map((details) =>
          this.rabbitMQConnectionService.createConnection(details),
        ),
      );
      const { channel, connection } = connections[0];
      this.connection = connection;
      this.channel = channel;
      await this.consume();
    } catch (error) {
      console.error('Error initializing DatabaseConsumerService:', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.rabbitMQConnectionService.disconnect(
        this.connection,
        this.channel,
      );
    } catch (error) {
      console.error('Error destroying DatabaseConsumerService:', error);
    }
  }

  private async consume(): Promise<void> {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg || !msg.content) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg, false, false);
        return;
      }

      try {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);

        const createMessageDto = await this.validateMessage(message);
        if (!createMessageDto) {
          console.error('Invalid message structure:', message);
          this.channel.nack(msg, false, false);
          return;
        }

        await this.processMessage(createMessageDto);
        this.channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg, false, false);
      }
    });
  }
  private async validateMessage(
    message: any,
  ): Promise<CreateMessageDto | null> {
    const validator = this.validators.find((validate) =>
      validate.supports(message.metadata.type),
    );

    if (!validator) {
      console.error('Unsupported message type:', message.metadata.type);
      return null;
    }

    return await validator.validate(message);
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
