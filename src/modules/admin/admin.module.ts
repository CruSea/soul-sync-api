import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AccountModule } from './account/account.module';
import { ChannelModule } from './channel/channel.module';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { MessageModule } from './message/message.module';
import { TelegramModule } from './channel/messagingChannels/telegram/telegram.module';

@Module({
  imports: [UserModule, AccountModule, ChannelModule, MessageModule, TelegramModule],
  providers: [JwtStrategy, PrismaService],
})
export class AdminModule {}
