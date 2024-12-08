import * as amqp from 'amqp-connection-manager';
import { Channel } from 'amqplib';

export class RabbitMQConnection {
  private static connection: amqp.AmqpConnectionManager;

  static getConnection(): amqp.AmqpConnectionManager {
    if (!this.connection) {
      this.connection = amqp.connect(['amqp://user:password@rabbitmq:5672']);
      console.log('Connected to RabbitMQ');
    }
    return this.connection;
  }

  static async createChannel(
    setup: (channel: Channel) => Promise<void>,
  ): Promise<amqp.ChannelWrapper> {
    const connection = this.getConnection();
    const channelWrapper = connection.createChannel({
      setup,
    });
    return channelWrapper;
  }
}
