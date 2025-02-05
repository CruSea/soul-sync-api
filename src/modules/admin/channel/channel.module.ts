import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ChannelFactory } from './channel-platforms/channel-factory';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, ChannelFactory],
})
export class ChannelModule {}
