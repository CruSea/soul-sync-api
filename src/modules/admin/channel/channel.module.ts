import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PlatformModule } from './platforms/platform.module';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule, PlatformModule],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService],
})
export class ChannelModule {}
