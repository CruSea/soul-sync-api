import { Module } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { ModeratorController } from './moderator.controller';
import { RabbitmqModule } from 'src/common/rabbitmq/rabbitmq.module';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { EmbeddingService } from './embedding.service';

@Module({
  imports: [PrismaModule, RabbitmqModule],
  controllers: [ModeratorController],
  providers: [ModeratorService, EmbeddingService],
})
export class ModeratorModule {}
