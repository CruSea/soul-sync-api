import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DatabaseConsumerModule } from './module/database-consumer.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DatabaseConsumerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'database',
        queueOptions: {
          durable: true,
          messageTtl: 60000,
          deadLetterExchange: 'message',
          deadLetterRoutingKey: 'dead',
        },
        noAck: false,
        prefetchCount: 5,
      },
    },
  );
  await app.listen();
}
bootstrap();
