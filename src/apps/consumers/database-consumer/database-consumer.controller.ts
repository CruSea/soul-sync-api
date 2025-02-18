import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessagePayload } from 'src/types/message';
import { DatabaseConsumerService } from './database-consumer.service';

@Controller('database-consumer')
export class DatabaseConsumerController {
  constructor(private readonly databaseService: DatabaseConsumerService) {}
  @EventPattern()
  async handleMessage(
    @Payload() data: MessagePayload,
    @Ctx() context: RmqContext,
  ) {
    this.databaseService.handleMessage(data, context);
  }
}
