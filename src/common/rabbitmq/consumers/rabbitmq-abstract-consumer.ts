import * as amqp from 'amqplib';
import { RabbitMQConsumerDto } from './dto/rabbitmq-consumer.dto';

export abstract class RabbitMQAbstractConsumer {
  protected channel: amqp.Channel;
  protected queueName: string;

  constructor(rabbitMQConsumerDto: RabbitMQConsumerDto) {
    this.channel = rabbitMQConsumerDto.channel;
    this.queueName = rabbitMQConsumerDto.queueName;
  }

  async consume(): Promise<void> {
    this.channel.consume(this.queueName, async (msg) => {
      if (!msg || !msg.content) {
        console.error('Invalid message:', msg);
        this.channel.nack(msg, false, false);
        return;
      }

      try {
        const messageContent = msg.content.toString();
        const message = JSON.parse(messageContent);

        await this.handleMessage(message, msg);
      } catch (error) {
        console.error('Error processing message:', error);
        this.channel.nack(msg, false, true);
      }
    });
  }

  abstract handleMessage(message: any, msg: amqp.Message): Promise<void>;

  ackMessage(msg: amqp.Message): void {
    this.channel.ack(msg);
  }

  nackMessage(msg: amqp.Message): void {
    this.channel.nack(msg, false, true);
  }
}
