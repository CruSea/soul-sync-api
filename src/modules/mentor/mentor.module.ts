import { Module } from '@nestjs/common';
import { ConversationModule } from './conversation/conversation.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [ConversationModule, ProfileModule],
})
export class MentorModule {}
