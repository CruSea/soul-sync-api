import { PrismaService } from "src/modules/prisma/prisma.service";
import { DatabaseConsumerService } from "./message-exchange/database/databaseConsumer.service";
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [DatabaseConsumerService, PrismaService],
  exports: [DatabaseConsumerService],
})
export class ConsumerModule {}