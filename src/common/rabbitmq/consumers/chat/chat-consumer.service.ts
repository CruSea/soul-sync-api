import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';
import { SendChatInterface } from './chat-out-let-implementations/send-chat.interface';

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
  handleMessage(message: any, msg: amqp.Message): Promise<void> {
    try {
      const validator = this.validators.find((validator) => {
        return validator.support() === message.metadata.type;
      });
      this.ackMessage(msg);
    } catch (error) {
      console.error('Error handling message:', error);
      this.nackMessage(msg);
    }
    return;
  }
}
