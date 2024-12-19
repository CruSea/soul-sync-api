import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ChannelModule } from './channel/channel.module';

@Module({
  imports: [MessageModule, UserModule, AccountModule, ChannelModule],
})
export class AdminModule {}
