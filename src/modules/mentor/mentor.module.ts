import { Module } from '@nestjs/common';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [ConversationModule],
})
export class MentorModule {}
