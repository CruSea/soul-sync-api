import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MessageConsumersService } from './message-consumers.service';

@Controller('message-consumers')
export class MessageConsumersController {
  constructor(
    private readonly messageConsumersService: MessageConsumersService,
  ) {}
  @EventPattern()
  async handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    this.messageConsumersService.handleMessage(data, context);
  }
}
