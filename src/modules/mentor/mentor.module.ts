import { Module } from '@nestjs/common';
import { ConversationModule } from './conversation/conversation.module';
import { MentorProfileModule } from './profile/mentor-profile.module';

@Module({
  imports: [ConversationModule, MentorProfileModule],
})
export class MentorModule {}
