import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { TelegramModule } from './channel/telegram/telegram.module';

@Module({
  imports: [MessageModule, UserModule, AccountModule, TelegramModule],
})
export class AdminModule {}
