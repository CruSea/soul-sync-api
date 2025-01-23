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
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';

@Injectable()
export class DatabaseConsumerService
  extends RabbitMQAbstractConsumer
  implements OnModuleInit, OnModuleDestroy
{
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
  ) {
    super({ queueName: 'database_queue', channel: null });
  }

  async onModuleInit(): Promise<void> {
    try {
      const connections = await Promise.all(
        this.rabbitConnectionDetails.map((details) =>
          this.rabbitMQConnectionService.createConnection(details),
        ),
      );
      const { channel, connection } = connections[0];
      this.connection = connection;
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

  async handleMessage(message: any, msg: amqp.Message): Promise<void> {
    try {
      const createMessageDto = this.validateMessage(message);
      console.log(CreateMessageDto);
      if (!createMessageDto) {
        console.error('Invalid message structure:', message);
        this.nackMessage(msg);
        return;
      }

      await this.processMessage(createMessageDto);
      this.ackMessage(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      this.nackMessage(msg);
    }
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
  ): Promise<void> {
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
      throw error;
    }
  }
}
