import { Module } from '@nestjs/common';
import { NegaritController } from './negarit.controller';
import { NegaritService } from './negarit.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {AuthService } from 'src/modules/auth/auth.service';

@Module({
    controllers: [NegaritController],
    exports: [NegaritService],
    providers: [NegaritService, PrismaService, JwtService, AuthService],
    //imports: [PrismaService],
})
export class NegaritModule {}
