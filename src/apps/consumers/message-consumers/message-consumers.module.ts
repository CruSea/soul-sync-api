import { Module } from '@nestjs/common';
import { MessageConsumersService } from './message-consumers.service';
import { MessageConsumersController } from './message-consumers.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MessageConsumersService],
  controllers: [MessageConsumersController],
})
export class MessageConsumersModule {}
