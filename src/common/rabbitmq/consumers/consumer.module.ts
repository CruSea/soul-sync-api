import { PrismaService } from "src/modules/prisma/prisma.service";
import { DatabaseConsumerService } from "./message-exchange/database/databaseConsumer.service";
import { Module } from '@nestjs/common';
import { RabbitmqService } from "../rabbitmq.service";
import { RedisService } from "src/common/redis/redis.service";

@Module({
  imports: [],
  providers: [
    DatabaseConsumerService,
    PrismaService,
    RabbitmqService,
    RedisService,
  ],
  exports: [DatabaseConsumerService],
})
export class ConsumerModule {}