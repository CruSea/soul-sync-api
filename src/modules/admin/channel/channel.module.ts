import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { NegaritService } from './negarit/negarit.service';
import { NegaritController } from './negarit/negarit.controller';
import { NegaritModule } from './negarit/negarit.module';
import {AuthService} from 'src/modules/auth/auth.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule, NegaritModule],
  controllers: [ChannelController, NegaritController],
  providers: [ChannelService, PrismaService, NegaritService, AuthService],
  exports: [ChannelService],
})
export class ChannelModule {}
