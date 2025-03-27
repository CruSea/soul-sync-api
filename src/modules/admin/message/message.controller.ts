import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Controller('admin/messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getAllMessages(
    @Query('accountId') accountId: string,
    @Query(new ValidationPipe({ transform: true })) query: Record<string, any>,
  ) {
    return this.messageService.getAllMessages(accountId, query);
  }
}
