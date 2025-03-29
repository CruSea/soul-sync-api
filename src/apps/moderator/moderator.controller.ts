import { Controller } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { Ctx, RmqContext, Payload, EventPattern } from '@nestjs/microservices';

@Controller()
export class ModeratorController {
  constructor(private readonly moderatorService: ModeratorService) {}

  @EventPattern()
  async handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {
    return await this.moderatorService.handleMessage(data, context);
  }
}
