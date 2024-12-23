import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MentorModule } from '../mentor/mentor.module';
import { MentorService } from '../mentor/mentor.service';

@Module({
  imports: [PrismaModule, AuthModule, JwtModule, MentorModule],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, AuthService, MentorService],
})
export class ConversationModule {}
