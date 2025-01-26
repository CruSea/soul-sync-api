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
import { SentChatDto } from './dto/sent-chat.dto';

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
  async handleMessage(chat: any, msg: amqp.Message): Promise<void> {
    try {
      const channelType = await this.fetchChannelType(
        chat.metadata.conversationId,
      );
      const validator = this.validators.find((validate) =>
        validate.supports(channelType),
      );
      if (!validator) {
        throw new Error('Validator not found');
      }
      const processedChat = await this.processChat(chat);
      if (validator.send(processedChat)) {
        this.ackMessage(msg);
      } else {
        this.nackMessage(msg);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.nackMessage(msg);
    }
    return;
  }
  private async fetchChannelType(conversationId: string) {
    try {
      const conversation = await this.prismaService.conversation.findFirst({
        where: { id: conversationId },
      });
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      const channel = await this.prismaService.channel.findFirst({
        where: { id: conversation.channelId },
      });
      if (!channel) {
        throw new Error('Channel not found');
      }
      return channel.type;
    } catch (error) {
      console.error('Error fetching channel type:', error);
      return null;
    }
  }
  private async processChat(chat: any): Promise<SentChatDto> {
    const { channel, conversation } = await this.fetchChannelandConversation(
      chat.metadata.conversationId,
    );
    return {
      body: chat.payload,
      address: conversation.address,
      channelId: channel.id,
      channelConfig: channel.configuration as Record<string, any>,
    };
  }
  async fetchChannelandConversation(conversationlId: string) {
    const conversation = await this.prismaService.conversation.findFirst({
      where: { id: conversationlId },
    });
    const channel = await this.prismaService.channel.findFirst({
      where: { id: conversation.channelId },
    });
    return { channel, conversation };
  }
}
