import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MentorModule } from './modules/mentor/mentor.module';
import { ChatModule } from './modules/chat/chat.module';
import { RabbitmqModule } from './common/rabbitmq/rabbitmq.module';
import { RedisModule } from './common/redis/redis.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    AdminModule,
    MentorModule,
    ChatModule,
    RabbitmqModule,
    RedisModule,
    MessageModule,
  ],
  providers: [PrismaService],
  controllers: [],
})
export class AppModule {}
