import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';
import { SendChatInterface } from './chat-out-let-implementations/send-chat.interface';
import { PrismaService } from '../../../../modules/prisma/prisma.service';

@Injectable()
export class ChatConsumerService
  extends RabbitMQAbstractConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private connection = amqp.Connection;
  private rabbitConnectionDetails = {
    queueName: 'chat_queue',
    exchangeName: 'chat',
    exchangeType: 'topic',
    routingKeys: ['chat'],
  };
  constructor(
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
    @Inject('SendChatInterface')
    private readonly validators: SendChatInterface[],
    private readonly prismaService: PrismaService,
  ) {
    super({ queueName: 'chat_queue', channel: null });
    this.rabbitMQConnectionService
      .createConnection(this.rabbitConnectionDetails)
      .then(({ connection, channel }) => {
        this.connection = connection;
        this.channel = channel;
      });
  }
  async onModuleInit(): Promise<void> {
    try {
      this.consume();
    } catch (error) {
      console.error('Error initializing ChatConsumerService:', error);
    }
  }
  async onModuleDestroy(): Promise<void> {
    try {
      await this.rabbitMQConnectionService.disconnect(
        this.connection,
        this.channel,
      );
    } catch (error) {
      console.error('Error destroying ChatConsumerService:', error);
    }
  }
  async handleMessage(message: any, msg: amqp.Message): Promise<void> {
    try {
      const channelType = await this.fetchChannelType(
        message.metadata.conversationId,
      );
      const validator = this.validators.find((validator) => {
        return validator.support() === channelType;
      });
      if (!validator) {
        throw new Error('Validator not found');
      }
      validator.send(message);
      this.ackMessage(msg);
    } catch (error) {
      console.error('Error handling message:', error);
      this.nackMessage(msg);
    }
    return;
  }
  private async fetchChannelType(conversationId: string) {
    try {
      return await this.prismaService.conversation
        .findFirst({
          where: { id: conversationId, isActive: true },
        })
        .then(
          (conversation: {
            channelId: string;
            isActive: boolean;
            type?: string;
          }) => {
            if (conversation && conversation.type) {
              return conversation.type;
            }
            throw new Error('Channel type not found');
          },
        );
    } catch (error) {
      console.error('Error fetching channel type:', error);
      return null;
    }
  }
}
