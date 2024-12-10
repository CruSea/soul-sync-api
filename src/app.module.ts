import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [AuthModule, UserModule, MessageModule],
  providers: [PrismaService],
})
export class AppModule {}
