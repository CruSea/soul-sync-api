import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [AuthModule, UserModule, MessagesModule],
  providers: [PrismaService],
})
export class AppModule {}
