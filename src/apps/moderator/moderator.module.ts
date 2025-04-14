import { Module } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { ModeratorController } from './moderator.controller';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { EmbeddingService } from './embedding.service';
import { RedisModule } from 'src/common/redis/redis.module';

@Module({
  imports: [PrismaModule, RabbitmqModule, RedisModule],
  controllers: [ModeratorController],
  providers: [ModeratorService, EmbeddingService],
})
export class ModeratorModule {}
