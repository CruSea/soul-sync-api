import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaService } from './modules/prisma/prisma.service';
import { AdminModule } from './modules/admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { MentorModule } from 'src/modules/admin/mentor/mentor.module';
import { MentorsController } from './modules/mentors/mentors.controller';
import { MentorsService } from './modules/mentors/mentors.service';
import { MentorsModule } from './modules/mentors/mentors.module';
import { JwtModule } from '@nestjs/jwt';

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
    MentorsModule,
  ],
  providers: [PrismaService, MentorsService],
  controllers: [MentorsController],
})
export class AppModule {}
