import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { MessagesService } from '../../messages/messages.service';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);

  constructor(private readonly messageService: MessagesService) {
    // Connect to RabbitMQ
    const connection = amqp.connect(['amqp://user:password@rabbitmq:5672']);
    connection.on('connect', () => this.logger.log('Connected to RabbitMQ'));
    connection.on('disconnect', (params) =>
      this.logger.error('Disconnected from RabbitMQ', params.err.stack),
    );
    this.channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => {
        // Assert the queue
        return channel.assertQueue('messagesQueue', { durable: true });
      },
    });
  }

  public async onModuleInit() {
    try {
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        // Start consuming messages from the queue
        await channel.consume('messagesQueue', async (message) => {
          if (message) {
            const content = JSON.parse(message.content.toString());
            this.logger.log('Received message:', content);

            // Pass the message data to the MessageService for processing (e.g., saving to DB)
            try {
              await this.messageService.create(content);
              // Acknowledge the message after successful processing
              channel.ack(message);
            } catch (err) {
              this.logger.error('Error processing message', err.stack);
              // Optionally, you can reject the message and requeue it
              channel.nack(message, false, true);
            }
          }
        });
      });
    } catch (err) {
      this.logger.error('Error setting up RabbitMQ consumer', err.stack);
    }
  }
}
