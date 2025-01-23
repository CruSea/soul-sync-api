import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';
import { MessageTransmitterValidator } from './message-validators/message-validator';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { MessageDto } from './dto/message.dto';
import { RedisService } from '../../../redis/redis.service';
import { ChatService } from '../../../../modules/chat/chat.service';

@Injectable()
export class MessageConsumerService
  extends RabbitMQAbstractConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private connection: amqp.Connection;
  private rabbitConnectionDetails = {
    queueName: 'message_queue',
    routingKeys: ['telegram'],
    exchangeName: 'message',
    exchangeType: 'topic',
  };
  constructor(
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
    @Inject('MessageTransmitterValidator')
    private readonly validators: MessageTransmitterValidator[],
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
  ) {
    super({ queueName: 'message_queue', channel: null });
  }
  async onModuleInit(): Promise<void> {
    try {
      const { channel, connection } =
        await this.rabbitMQConnectionService.createConnection(
          this.rabbitConnectionDetails,
        );
      this.channel = channel;
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
      console.error('Error destroying MessageConsumerService:', error);
    }
  }
  async handleMessage(message: any, msg: amqp.Message): Promise<void> {
    const menteeAddress = await this.extractMenteeAddress(message);
    if (!menteeAddress) {
      console.error('Invalid message structure:', message);
      this.nackMessage(msg);
      return;
    }
    const conversationId = await this.fetchConversationId(menteeAddress);
    if (!conversationId) {
      console.error('Conversation not found for mentee:', menteeAddress);
      this.nackMessage(msg);
      return;
    }
    const processedMessage = await this.processMessage(message, conversationId);
    if (!processedMessage) {
      console.error('Error processing message:', message);
      this.nackMessage(msg);
      return;
    }
    await this.emitMessage(processedMessage);
    this.ackMessage(msg);
    return;
  }

  private async extractMenteeAddress(message: any): Promise<string | null> {
    const validator = await this.validators.find((validator) =>
      validator.supports(message.type),
    );
    if (!validator) {
      return null;
    }
    return validator.extractmenteeAddress(message);
  }

  private async fetchConversationId(
    menteeAddress: string,
  ): Promise<string | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { address: menteeAddress, isActive: true },
    });
    return conversation ? conversation.id : null;
  }
  private async processMessage(
    message: any,
    conversationId: string,
  ): Promise<MessageDto | null> {
    const validator = await this.validators.find((validator) =>
      validator.supports(message.type),
    );
    if (!validator) {
      return null;
    }
    const messageDto = await validator.processMessage(message, conversationId);
    return messageDto ? messageDto : null;
  }

  private async emitMessage(message: MessageDto) {
    const { mentorEmail, socketId } = await this.getMentorEmail(
      message.conversationId,
    );
    if (!mentorEmail || !socketId) {
      console.error(
        'Invalid mentor email or socketId:',
        message.conversationId,
      );
      return;
    }
    this.chatService.send(socketId, message);
    return;
  }
  private async getMentorEmail(
    conversationId: string,
  ): Promise<{ mentorEmail: string; socketId: string } | null> {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId },
    });
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return;
    }
    const mentor = await this.prisma.mentor.findFirst({
      where: { id: conversation.mentorId },
    });
    if (!mentor) {
      console.error('Mentor not found for conversation:', conversationId);
      return;
    }
    const mentorEmail = mentor.email;
    const socketId = await this.redisService.get(mentorEmail);

    return { mentorEmail, socketId };
  }
}
