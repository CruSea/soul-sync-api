import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RabbitMQConnection } from 'src/rabbitmq/rabbitmq.connection'; // Import centralized RabbitMQ connection
import { MessagesService } from '../../messages/messages.service';
import { Channel } from 'amqplib';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ConsumerService.name);
  private readonly queueName = 'messagesQueue';

  constructor(private readonly messageService: MessagesService) {}

  public async onModuleInit() {
    try {
      const channel = await RabbitMQConnection.createChannel(
        async (channel: Channel) => {
          // Assert the queue
          await channel.assertQueue(this.queueName, { durable: true });

          // Start consuming messages
          channel.consume(this.queueName, async (message) => {
            if (message) {
              const content = JSON.parse(message.content.toString());
              this.logger.log(`Received message: ${JSON.stringify(content)}`);

              try {
                // Process the message using MessagesService
                await this.messageService.create(content);

                // Acknowledge the message after successful processing
                channel.ack(message);
              } catch (error) {
                this.logger.error('Error processing message', error.stack);

                // Optionally reject and requeue the message
                channel.nack(message, false, true);
              }
            }
          });
        },
      );

      this.logger.log(`Consumer is listening on queue: ${this.queueName}`);
    } catch (err) {
      this.logger.error('Error initializing RabbitMQ consumer', err.stack);
    }
  }
}
