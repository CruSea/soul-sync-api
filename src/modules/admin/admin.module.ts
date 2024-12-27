import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [UserModule, AccountModule],
})
export class AdminModule {}
