import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ChannelModule } from './channel/channel.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [MessageModule, UserModule, AccountModule, ChannelModule, ConversationModule],
})
export class AdminModule {}
