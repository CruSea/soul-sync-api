import { Module } from '@nestjs/common';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { MentorModule } from './mentor/mentor.module';

@Module({
  imports: [MessageModule, UserModule, AccountModule, MentorModule],
})
export class AdminModule {}
