import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaService } from './modules/prisma/prisma.service';

@Module({
  imports: [AuthModule, UserModule],
  providers: [PrismaService],
})
export class AppModule {}
