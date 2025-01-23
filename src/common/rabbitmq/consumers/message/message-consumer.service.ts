import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RabbitMQConnectionService } from '../rabbit-connection.service';
import { RabbitMQAbstractConsumer } from '../rabbitmq-abstract-consumer';
import { MessageTransmitterValidator } from './message-validators/message-validator';

@Injectable()
export class MessageConsumerService
  extends RabbitMQAbstractConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private connection: amqp.Connection;
  private rabbitConnectionDetails: {
    queueName: 'message_queue';
    routingKeys: ['telegram'];
    exchangeName: 'message';
    exchangeType: 'topic';
  };
  constructor(
    private readonly rabbitMQConnectionService: RabbitMQConnectionService,
     @Inject('MessageValidators')
        private readonly validators: MessageTransmitterValidator[],
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
      console.error('Error initializing MessageConsumerService:', error);
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
    const menteeAdresss = await this.extractMenteeAddress(message);
    if (!menteeAdresss) {
      console.error('Invalid message structure:', message);
      this.nackMessage(msg);
      return;
    }
    
    return;
  }

  private async extractMenteeAddress(message: any): Promise<string | null> { 
    const validator = await this.validators.find((validator) => validator.supports(message.type));
    if (!validator) {
      return null;
    }
    return validator.extractAdress(message);
  }
}
