import { Module } from '@nestjs/common';
import { DatabaseConsumerController } from './database-consumer.controller';
import { DatabaseConsumerService } from './database-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import RabbitMQConnectionService from './handle-rabbitmq-connection/rabbitmq-connection.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [DatabaseConsumerController],
  providers: [DatabaseConsumerService, RabbitMQConnectionService],
})
export class DatabaseConsumerModule {}
