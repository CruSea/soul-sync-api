import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ModeratorModule } from './moderator.module';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ModeratorModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'moderator',
        queueOptions: {
          durable: true,
          messageTtl: 60000,
          deadLetterExchange: 'moderator',
          deadLetterRoutingKey: 'dead',
        },
        noAck: false,
        prefetchCount: 1,
      },
    },
  );
  await app.listen();
}

bootstrap();
