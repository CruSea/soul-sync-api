import { Module } from '@nestjs/common';
import { DatabaseConsumerService } from './databaseConsumer.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Module({
    providers: [DatabaseConsumerService, PrismaService],
    exports: [DatabaseConsumerService],
})
export class DatabaseConsumerModule {}