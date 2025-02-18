import { Module } from '@nestjs/common';
import { ChatConsumerController } from './chat-consumer.controller';
import { ChatConsumerService } from './chat-consumer.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ClientService } from './strategy/client.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
  ],
  controllers: [ChatConsumerController],
  providers: [ChatConsumerService, ClientService],
})
export class ChatConsumerModule {}
