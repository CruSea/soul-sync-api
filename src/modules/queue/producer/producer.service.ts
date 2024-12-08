import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { RabbitMQConnection } from 'src/rabbitmq/rabbitmq.connection';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper = RabbitMQConnection.createChannel(
    async (channel: Channel) => {
      await channel.assertQueue('messagesQueue', { durable: true });
    },
  );

  async addToQueue(message: any) {
    try {
      Logger.log('Received create message request', 'ProducerService');

      // Add a message to the RabbitMQ queue
      (await this.channelWrapper).sendToQueue(
        'messagesQueue',
        Buffer.from(JSON.stringify(message)),
      );

      Logger.log('Message successfully added to queue', 'ProducerService');
      return { status: 'Message added to queue successfully!' };
    } catch (error) {
      Logger.error('Failed to add message to queue', error, 'ProducerService');
      throw new HttpException(
        'Failed to add message to queue',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
