import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;

  constructor() {
    // Connect to RabbitMQ server
    const connection = amqp.connect(['amqp://user:password@rabbitmq:5672']);
    Logger.log('Connected to RabbitMQ', 'ProducerService'); // Update URL if RabbitMQ runs elsewhere
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        // Set up the queue
        return channel.assertQueue('messagesQueue', { durable: true });
      },
    });
  }

  async addToQueue(message: any) {
    try {
      Logger.log('Received create message request');
      // Add a message to the RabbitMQ queue
      await this.channelWrapper.sendToQueue(
        'messagesQueue', // Queue name
        Buffer.from(JSON.stringify(message)), // Serialize message
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
