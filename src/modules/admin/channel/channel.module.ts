import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { NegaritService } from './negarit/negarit.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule],
  controllers: [ChannelController],
  providers: [ChannelService, PrismaService, NegaritService],
  exports: [ChannelService],
})
export class ChannelModule {}
