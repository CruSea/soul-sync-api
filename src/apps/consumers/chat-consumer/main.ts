import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ChatConsumerModule } from './module/chat-consumer.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ChatConsumerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'chat',
        queueOptions: {
          durable: true,
          messageTtl: 60000,
          deadLetterExchange: 'message',
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
